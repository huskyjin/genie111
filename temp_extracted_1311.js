  if (itemRegImageInput) {
    itemRegImageInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Img = event.target.result;
          currentQuestionTempPhotos.push(base64Img);
          renderItemRegPhotoPreviews(currentQuestionTempPhotos);
        };
        reader.readAsDataURL(file);
      });
      e.target.value = '';
    });
  }
}

/* ==========================================================================
   제조사 현장 평가 모듈 개발 스크립트 (initMfrEval 및 하위 기능군)
   ========================================================================== */

// 1. 제조사 전용 전역 상태 필터 객체
let mfrFilters = {
  div: '',
  biz: '',
  vhr: '',
  type: ''
};

// 2. 제조사 평가 초기화 진입점
function initMfrEval() {
  const menuFactory = document.getElementById('menu_factory');
  const btnMfrBackToHome = document.getElementById('btnMfrBackToHome');
  const homeView = document.getElementById('home-view');
  const mfrEvalView = document.getElementById('mfr-eval-view');

  const btnMfrTabEval = document.getElementById('btn-mfr-tab-eval');
  const btnMfrTabCompany = document.getElementById('btn-mfr-tab-company');
  const tabContentEval = document.getElementById('mfr-tab-content-eval');
  const tabContentCompany = document.getElementById('mfr-tab-content-company');

  const btnMfrHeaderAdd = document.getElementById('btnMfrHeaderAdd');
  const mfrRegisterView = document.getElementById('mfr-register-view');
  const mfrDetailView = document.getElementById('mfr-detail-view');

  const btnMfrOpenFilter = document.getElementById('btnMfrOpenFilter');
  const btnMfrCloseFilter = document.getElementById('btnMfrCloseFilter');
  const mfrFilterOverlay = document.getElementById('mfrFilterOverlay');
  const btnMfrFilterReset = document.getElementById('btnMfrFilterReset');
  const btnMfrFilterApply = document.getElementById('btnMfrFilterApply');

  if (!menuFactory) return;

  // 필터 활성화 도트 동적 추가
  if (btnMfrOpenFilter && !document.getElementById('mfrFilterActiveDot')) {
    const activeDot = document.createElement('span');
    activeDot.className = 'filter-active-dot';
    activeDot.id = 'mfrFilterActiveDot';
    btnMfrOpenFilter.style.position = 'relative';
    btnMfrOpenFilter.appendChild(activeDot);
  }

  // A. 메뉴 진입 및 홈 이동
  menuFactory.addEventListener('click', () => {
    homeView.style.display = 'none';
    mfrEvalView.style.display = 'flex';
    switchMfrTab('eval'); // 기본은 평가 리스트 탭
  });

  btnMfrBackToHome.addEventListener('click', () => {
    mfrEvalView.style.display = 'none';
    homeView.style.display = 'flex';
  });

  // B. 탭 스위칭 제어
  function switchMfrTab(tabType) {
    currentMfrSubTab = tabType;
    if (tabType === 'eval') {
      btnMfrTabEval.classList.add('active');
      btnMfrTabCompany.classList.remove('active');
      tabContentEval.style.display = 'block';
      tabContentCompany.style.display = 'none';
      renderMfrEvalList();
    } else {
      btnMfrTabEval.classList.remove('active');
      btnMfrTabCompany.classList.add('active');
      tabContentEval.style.display = 'none';
      tabContentCompany.style.display = 'block';
      renderMfrCompanyList();
    }
  }

  btnMfrTabEval.addEventListener('click', () => switchMfrTab('eval'));
  btnMfrTabCompany.addEventListener('click', () => switchMfrTab('company'));

  // C. 플러스(+) 등록 단추 액션
  btnMfrHeaderAdd.addEventListener('click', () => {
    if (currentMfrSubTab === 'eval') {
      // 바로 신규 평가 씬(Scene)으로 이동
      openMfrDetail(null);
    } else {
      // 신규 제조사 등록 씬(Scene)으로 이동
      mfrEvalView.style.display = 'none';
      mfrRegisterView.style.display = 'flex';

      // 폼 초기화 및 기본값 설정
      document.getElementById('txt-mfr-register-title').textContent = '신규 제조사 등록';
      btnMfrSubmitRegister.dataset.mode = 'new';
      
      // OEM 전용 추가 항목 컨테이너 기본 표시 (OEM 라디오 디폴트 체크이므로)
      document.getElementById('mfrRegOemSubSection').style.display = 'flex';

      // 거래업체 드롭다운에 바이어 등록 업체 목록 바인딩
      bindBuyerCompaniesToMfrSelect();

      // 오늘 날짜 및 바이어 기본명 바인딩
      document.getElementById('mfrRegDate').value = new Date().toISOString().split('T')[0];
      const account = buyerAccounts[currentBuyerId];
      document.getElementById('mfrRegInspector').value = account ? account.name : '';

      // 나머지 인풋 비우기
      document.getElementById('mfrRegName').value = '';
      document.getElementById('mfrRegDiv').value = '';
      document.getElementById('mfrRegBiz').value = '';
      document.querySelector('input[name="mfrRegType"][value="OEM"]').checked = true;
      document.querySelector('input[name="mfrRegVhr"][value="VHR"]').checked = true;
      document.getElementById('mfrRegOwner').value = '';
      document.getElementById('mfrRegLicense').value = '';
      document.getElementById('mfrRegAddress').value = '';
      document.getElementById('mfrRegCategory').value = '';
      document.getElementById('mfrRegSales').value = '';
      document.getElementById('mfrRegClients').value = '';
      document.getElementById('mfrRegEmployees').value = '';
      document.getElementById('mfrRegCert').value = '';
      document.getElementById('mfrRegManager').value = '';
      document.getElementById('mfrRegMemo').value = '';
    }
  });

  // D. 신규 제조사 등록 씬 뒤로가기
  const btnMfrBackToEvalFromReg = document.getElementById('btnMfrBackToEvalFromReg');
  btnMfrBackToEvalFromReg.addEventListener('click', () => {
    mfrRegisterView.style.display = 'none';
    mfrEvalView.style.display = 'flex';
  });

  // E. OEM/일반 라디오 변경 핸들러 (OEM 선택 시에만 하위 작성 내용 표시)
  const mfrRegTypeRadios = document.querySelectorAll('input[name="mfrRegType"]');
  mfrRegTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const oemSection = document.getElementById('mfrRegOemSubSection');
      if (e.target.value === 'OEM') {
        oemSection.style.display = 'flex';
      } else {
        oemSection.style.display = 'none';
      }
    });
  });

  // F. 신규 제조사 등록 완료 / 임시 저장
  const btnMfrSubmitRegister = document.getElementById('btnMfrSubmitRegister');
  const btnMfrSaveDraft = document.getElementById('btnMfrSaveDraft');

  function saveMfrProfile(isDraft) {
    const name = document.getElementById('mfrRegName').value.trim();
    const div = document.getElementById('mfrRegDiv').value;
    const biz = document.getElementById('mfrRegBiz').value;
    const type = document.querySelector('input[name="mfrRegType"]:checked').value;
    const vhr = document.querySelector('input[name="mfrRegVhr"]:checked').value;
    
    const date = document.getElementById('mfrRegDate').value || new Date().toISOString().split('T')[0];
    const inspector = document.getElementById('mfrRegInspector').value.trim() || '바이어';
    const owner = document.getElementById('mfrRegOwner').value.trim();
    const licenseNo = document.getElementById('mfrRegLicense').value.trim();
    
    // 신규 추가 필드
    const address = document.getElementById('mfrRegAddress').value.trim();
    const category = document.getElementById('mfrRegCategory').value.trim();
    const sales = document.getElementById('mfrRegSales').value.trim();
    const clients = document.getElementById('mfrRegClients').value.trim();
    const employees = document.getElementById('mfrRegEmployees').value.trim();
    const cert = document.getElementById('mfrRegCert').value.trim();
    const manager = document.getElementById('mfrRegManager').value.trim();
    const memo = document.getElementById('mfrRegMemo').value.trim();

    // OEM 하위 항목 필드
    const partner = type === 'OEM' ? document.getElementById('mfrRegPartner').value : '';
    const recheck = type === 'OEM' ? document.getElementById('mfrRegRecheck').checked : false;

    // 유효성 검사 (임시저장이 아닐 때 필수값 체크)
    if (!isDraft) {
      if (!name) {
        showToast('제조사명을 입력해 주세요.');
        return;
      }
      if (!div) {
        showToast('사업부(Div.)를 선택해 주세요.');
        return;
      }
      if (!biz) {
        showToast('업태를 선택해 주세요.');
        return;
      }
      if (type === 'OEM' && !partner) {
        showToast('OEM 제조사는 거래업체 선택이 필수입니다.');
        return;
      }
    } else {
      if (!name) {
        showToast('제조사명은 필수입니다. (임시저장)');
        return;
      }
    }

    const mode = btnMfrSubmitRegister.dataset.mode || 'new';

    if (mode === 'new') {
      const newId = mfrMockData.length > 0 ? Math.max(...mfrMockData.map(d => d.id)) + 1 : 1;
      const newMfr = {
        id: newId,
        buyerId: currentBuyerId,
        type,
        name,
        div,
        biz,
        vhr,
        owner,
        licenseNo,
        address,
        partner,
        recheck,
        category,
        sales,
        clients,
        employees,
        cert,
        manager,
        regDate: date,
        inspector,
        status: isDraft ? 'pending' : 'fit',
        evalFile: '',
        actionFile: '',
        comment: memo,
        checklist: createDefaultChecklist(isDraft ? 'pending' : 'fit')
      };
      mfrMockData.unshift(newMfr);
      showToast(isDraft ? '제조사 프로필이 임시 저장되었습니다.' : '신규 제조사 등록이 완료되었습니다.');
    } else {
      // 수정 모드
      const editId = parseInt(btnMfrSubmitRegister.dataset.id);
      const mfrItem = mfrMockData.find(d => d.id === editId);
      if (mfrItem) {
        mfrItem.type = type;
        mfrItem.name = name;
        mfrItem.div = div;
        mfrItem.biz = biz;
        mfrItem.vhr = vhr;
        mfrItem.owner = owner;
        mfrItem.licenseNo = licenseNo;
        mfrItem.address = address;
        mfrItem.partner = partner;
        mfrItem.recheck = recheck;
        mfrItem.category = category;
        mfrItem.sales = sales;
        mfrItem.clients = clients;
        mfrItem.employees = employees;
        mfrItem.cert = cert;
        mfrItem.manager = manager;
        mfrItem.regDate = date;
        mfrItem.inspector = inspector;
        mfrItem.comment = memo;
        if (!isDraft && mfrItem.status === 'pending') {
          mfrItem.status = 'fit';
        }
        showToast('제조사 정보가 성공적으로 수정되었습니다.');
      }
    }

    // 목록 복귀
    mfrRegisterView.style.display = 'none';
    mfrEvalView.style.display = 'flex';
    switchMfrTab('company');
  }

  btnMfrSubmitRegister.addEventListener('click', () => saveMfrProfile(false));
  btnMfrSaveDraft.addEventListener('click', () => saveMfrProfile(true));

  // G. 필터 드로어 바인딩
  btnMfrOpenFilter.addEventListener('click', () => {
    mfrFilterOverlay.style.display = 'block';
  });

  btnMfrCloseFilter.addEventListener('click', () => {
    mfrFilterOverlay.style.display = 'none';
  });

  btnMfrFilterReset.addEventListener('click', () => {
    document.getElementById('mfrFilterDiv').value = '';
    document.getElementById('mfrFilterBiz').value = '';
    document.getElementById('mfrFilterVhr').value = '';
    document.getElementById('mfrFilterType').value = '';

    mfrFilters = { div: '', biz: '', vhr: '', type: '' };
    document.getElementById('mfrFilterActiveDot').style.display = 'none';
    
    mfrFilterOverlay.style.display = 'none';
    if (currentMfrSubTab === 'eval') renderMfrEvalList();
    else renderMfrCompanyList();
  });

  btnMfrFilterApply.addEventListener('click', () => {
    mfrFilters.div = document.getElementById('mfrFilterDiv').value;
    mfrFilters.biz = document.getElementById('mfrFilterBiz').value;
    mfrFilters.vhr = document.getElementById('mfrFilterVhr').value;
    mfrFilters.type = document.getElementById('mfrFilterType').value;

    const hasActiveFilter = mfrFilters.div || mfrFilters.biz || mfrFilters.vhr || mfrFilters.type;
    document.getElementById('mfrFilterActiveDot').style.display = hasActiveFilter ? 'block' : 'none';

    mfrFilterOverlay.style.display = 'none';
    if (currentMfrSubTab === 'eval') renderMfrEvalList();
    else renderMfrCompanyList();
  });

  // 실시간 제조사명 검색어 인풋 리스너
  const mfrSearchInput = document.getElementById('mfrSearchInput');
  mfrSearchInput.addEventListener('input', (e) => {
    // 등록 제조사 리스트 탭일 때 실시간 필터 적용
    renderMfrCompanyList();
  });

  // H. 제조사 평가 상세 뒤로가기 버튼
  const btnMfrBackToEvalList = document.getElementById('btnMfrBackToEvalList');
  btnMfrBackToEvalList.addEventListener('click', () => {
    mfrDetailView.style.display = 'none';
    mfrEvalView.style.display = 'flex';
  });

  // I. 평가 상세 업체 선택 드롭다운 체인지 이벤트
  const mfrDetailCompanySelect = document.getElementById('mfrDetailCompanySelect');
  mfrDetailCompanySelect.addEventListener('change', (e) => {
    const selectedId = parseInt(e.target.value);
    const mfrItem = mfrMockData.find(c => c.id === selectedId);
    if (mfrItem) {
      // 상세 뷰 데이터 셋업 및 점검 리스트 노출
      activeMfrDetailItem = mfrItem;
      activeMfrChecklist = mfrItem.checklist ? JSON.parse(JSON.stringify(mfrItem.checklist)) : createDefaultChecklist('pending');

      // 요약 카드 정보 바인딩
      document.getElementById('lblMfrDetailDiv').textContent = mfrItem.div;
      document.getElementById('lblMfrDetailBiz').textContent = mfrItem.biz;
      document.getElementById('lblMfrDetailVhr').textContent = mfrItem.vhr;
      document.getElementById('lblMfrDetailInspector').textContent = mfrItem.inspector;

      document.getElementById('mfrDetailSummaryCard').style.display = 'block';
      document.getElementById('mfrInspectionSection').style.display = 'flex';
      document.getElementById('mfrDetailVerdictBar').style.display = 'flex';

      // 가상 파일명 매핑 표시 초기화
      document.getElementById('txtMfrEvalFile').textContent = mfrItem.evalFile ? mfrItem.evalFile : '평가 파일 업로드 (.pdf, .xlsx)';
      document.getElementById('txtMfrActionFile').textContent = mfrItem.actionFile ? mfrItem.actionFile : '개선 조치 파일 업로드 (.pdf, .docx)';
      document.getElementById('mfrDetailComment').value = mfrItem.comment || '';

      // 체크리스트 질문 렌더링
      renderMfrChecklistQuestions(activeMfrChecklist);
      updateMfrRealtimeDisplay(activeMfrChecklist);
    }
  });

  // J. 평가 파일 & 조치 파일 가상 첨부
  const mfrEvalFileInput = document.getElementById('mfrEvalFileInput');
  const mfrActionFileInput = document.getElementById('mfrActionFileInput');

  mfrEvalFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && activeMfrDetailItem) {
      document.getElementById('txtMfrEvalFile').textContent = file.name;
      activeMfrDetailItem.evalFile = file.name;
      showToast(`평가 서류 "${file.name}"이 임시 첨부되었습니다.`);
    }
  });

  mfrActionFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && activeMfrDetailItem) {
      document.getElementById('txtMfrActionFile').textContent = file.name;
      activeMfrDetailItem.actionFile = file.name;
      showToast(`개선 조치 보고서 "${file.name}"이 임시 첨부되었습니다.`);
    }
  });

  // K. 상세 평가 임시 저장 / 최종 제출 완료
  const btnMfrDetailSaveDraft = document.getElementById('btnMfrDetailSaveDraft');
  const btnMfrDetailSubmitFinal = document.getElementById('btnMfrDetailSubmitFinal');

  function saveMfrInspect(isFinal) {
    if (!activeMfrDetailItem) {
      showToast('평가할 제조사 업체를 선택해 주세요.');
      return;
    }

    const comment = document.getElementById('mfrDetailComment').value.trim();
    
    // 점검 완료 시 14대 문항에 빈 값이 없는지 확인
    if (isFinal) {
      const unanswered = activeMfrChecklist.some(q => !q.result);
      if (unanswered) {
        showToast('모든 점검 항목에 대해 적합/부적합 판정을 마쳐주세요.');
        return;
      }
    }

    // activeMfrDetailItem에 저장
    activeMfrDetailItem.checklist = JSON.parse(JSON.stringify(activeMfrChecklist));
    activeMfrDetailItem.comment = comment;

    // 최종 판정 결정
    const finalVerdict = calculateMfrFinalVerdict(activeMfrChecklist);
    if (isFinal) {
      activeMfrDetailItem.status = finalVerdict;
      showToast(finalVerdict === 'fit' ? '현장 평가 결과 [적합] 판정으로 제출되었습니다.' : '현장 평가 결과 [부적합] 판정으로 제출되었습니다.');
    } else {
      activeMfrDetailItem.status = 'pending';
      showToast('작업 내역이 임시 저장되었습니다.');
    }

    // 복귀
    mfrDetailView.style.display = 'none';
    mfrEvalView.style.display = 'flex';
    switchMfrTab('eval');
  }

  btnMfrDetailSaveDraft.addEventListener('click', () => saveMfrInspect(false));
  btnMfrDetailSubmitFinal.addEventListener('click', () => saveMfrInspect(true));

  // L. 문항별 개별 상세 등록 관련 이벤트 바인딩
  const btnMfrBackToDetailFromItem = document.getElementById('btnMfrBackToDetailFromItem');
  const btnMfrBackToDetailFromItemHelp = document.getElementById('btnMfrBackToDetailFromItemHelp');
  const btnMfrSaveItemDetails = document.getElementById('btnMfrSaveItemDetails');
  const mfrItemRegImageInput = document.getElementById('mfrItemRegImageInput');

  btnMfrBackToDetailFromItem.addEventListener('click', () => {
    document.getElementById('mfr-item-detail-view').style.display = 'none';
    mfrDetailView.style.display = 'flex';
  });

  btnMfrBackToDetailFromItemHelp.addEventListener('click', () => {
    document.getElementById('mfr-item-help-view').style.display = 'none';
    mfrDetailView.style.display = 'flex';
  });

  btnMfrSaveItemDetails.addEventListener('click', () => {
    const comment = document.getElementById('mfrItemRegComment').value.trim();
    if (!comment) {
      showToast('상세 미비 내용을 적어주세요.');
      return;
    }

    if (activeMfrChecklist && mfrCurrentQuestionId) {
      const q = activeMfrChecklist.find(item => item.id === mfrCurrentQuestionId);
      if (q) {
        q.detailComment = comment;
        q.photos = [...mfrQuestionTempPhotos];
        showToast('개별 상세 위생 미비 내용이 반영되었습니다.');
      }
    }

    document.getElementById('mfr-item-detail-view').style.display = 'none';
    mfrDetailView.style.display = 'flex';

    renderMfrChecklistQuestions(activeMfrChecklist);
  });

  mfrItemRegImageInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        mfrQuestionTempPhotos.push(event.target.result);
        renderMfrItemPhotoPreviews(mfrQuestionTempPhotos);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  });
}

// 3. 바이어 등록 업체를 신규 제조사 드롭다운(partner)에 바인딩하는 헬퍼
function bindBuyerCompaniesToMfrSelect() {
  const selectPartner = document.getElementById('mfrRegPartner');
  if (!selectPartner) return;

  selectPartner.innerHTML = '<option value="" disabled selected>거래업체 선택</option>';

  // 현재 로그인한 바이어 ID에 격리 매칭되는 바이어 평가 등록 업체 목록
  const matchedCompanies = buyerMockData.filter(d => d.buyerId === currentBuyerId);
  
  matchedCompanies.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.textContent = `${c.name} (${c.storeName})`;
    selectPartner.appendChild(opt);
  });
}

// 4. Tab A: 제조사 현장 평가 이력 리스트 렌더링 (전체 / 적합 / 부적합 탭 연동)
function renderMfrEvalList() {
  const container = document.getElementById('mfrEvalList');
  if (!container) return;

  container.innerHTML = '';

  const activeTabBtn = document.querySelector('#mfr-tab-content-eval .tab-container .tab-item.active');
  const filterStatus = activeTabBtn ? activeTabBtn.dataset.tab : 'all';

  // 필터링 적용 (RBAC + Div + Biz + VHR + Type + 적합도 탭)
  const filtered = mfrMockData.filter(item => {
    if (item.buyerId !== currentBuyerId) return false;

    // 탭 필터링
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;

    // 상세 필터 드로어 조건
    if (mfrFilters.div && item.div !== mfrFilters.div) return false;
    if (mfrFilters.biz && item.biz !== mfrFilters.biz) return false;
    if (mfrFilters.vhr && item.vhr !== mfrFilters.vhr) return false;
    if (mfrFilters.type && item.type !== mfrFilters.type) return false;

    return true;
  });

  // 상태 탭 클릭 이벤트 바인딩 (최초 한 번 또는 동적 렌더 후 지속)
  const tabItems = document.querySelectorAll('#mfr-tab-content-eval .tab-container .tab-item');
  tabItems.forEach(tab => {
    if (!tab.dataset.bound) {
      tab.dataset.bound = 'true';
      tab.addEventListener('click', (e) => {
        tabItems.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        renderMfrEvalList();
      });
    }
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="list-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
        </svg>
        <p>현장 평가 점검 기록이 없습니다.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'eval-card';

    let statusText = '평가 대기';
    let statusClass = 'badge-start-eval';
    if (item.status === 'fit') {
      statusText = '적합';
      statusClass = 'badge-fit';
    } else if (item.status === 'unfit') {
      statusText = '부적합';
      statusClass = 'badge-unfit';
    }

    const typeBadge = `<span class="eval-badge ${item.type === 'OEM' ? 'badge-express' : 'badge-start-eval'}" style="margin-right: 5px;">${item.type === 'OEM' ? 'OEM' : '일반'}</span>`;
    const evalAttachedFileBadge = item.evalFile ? `<span class="detail-completed-badge" style="background:#10b981;">평가서첨부</span>` : '';
    const actionAttachedFileBadge = item.actionFile ? `<span class="detail-completed-badge" style="background:#3b82f6;">조치서첨부</span>` : '';

    card.innerHTML = `
      <div class="card-header-row">
        <h4 class="card-title">${item.name}</h4>
        <div class="card-badges">
          ${typeBadge}
          <span class="eval-badge ${statusClass}">${statusText}</span>
        </div>
      </div>
      <div class="card-info-grid">
        <div class="info-field">
          <span class="lbl">사업부 (Div.)</span>
          <span class="val">${item.div}</span>
        </div>
        <div class="info-field">
          <span class="lbl">VHR 유형</span>
          <span class="val">${item.vhr}</span>
        </div>
        <div class="info-field">
          <span class="lbl">점검일자</span>
          <span class="val">${item.regDate}</span>
        </div>
        <div class="info-field">
          <span class="lbl">점검자</span>
          <span class="val">${item.inspector}</span>
        </div>
      </div>
      <div style="display:flex; gap:6px; margin-top:8px;">
        ${evalAttachedFileBadge}
        ${actionAttachedFileBadge}
      </div>
    `;

    // 평가 이력 클릭 시 상세 평가 뷰 진입
    card.addEventListener('click', () => {
      openMfrDetail(item);
    });

    container.appendChild(card);
  });
}

// 5. Tab B: 등록 제조사 리스트 렌더링
function renderMfrCompanyList() {
  const container = document.getElementById('mfrCompanyList');
  if (!container) return;

  container.innerHTML = '';

  const keyword = document.getElementById('mfrSearchInput').value.trim().toLowerCase();

  // 필터링 적용 (RBAC + Div + Biz + VHR + Type + Keyword)
  const filtered = mfrMockData.filter(item => {
    if (item.buyerId !== currentBuyerId) return false;

    // 키워드 검색
    if (keyword && !item.name.toLowerCase().includes(keyword)) return false;

    // 상세 필터 드로어 조건
    if (mfrFilters.div && item.div !== mfrFilters.div) return false;
    if (mfrFilters.biz && item.biz !== mfrFilters.biz) return false;
    if (mfrFilters.vhr && item.vhr !== mfrFilters.vhr) return false;
    if (mfrFilters.type && item.type !== mfrFilters.type) return false;

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="list-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
        </svg>
        <p>조회 조건에 부합하는 제조사가 없습니다.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'mfr-card';

    const oemSubLabel = item.type === 'OEM' ? `
      <div style="font-size:11px; color:#ef4444; font-weight:700; margin-top:2px;">
        • 거래업체: ${item.partner || '미지정'} ${item.recheck ? '<span style="color:#eab308; margin-left:8px;">[재점검대상]</span>' : ''}
      </div>
    ` : '';

    card.innerHTML = `
      <div class="card-header-row">
        <h4 class="card-title" style="font-size:15px; font-weight:700;">${item.name}</h4>
        <span class="badge ${item.type === 'OEM' ? 'status-pending' : 'status-completed'}" style="font-size:10px;">${item.type === 'OEM' ? 'OEM 제조사' : '일반 제조사'}</span>
      </div>
      <div class="card-info-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:4px;">
        <div class="info-field">
          <span class="lbl" style="font-size:11px; color:#64748b;">사업부 (Div.)</span>
          <span class="val" style="font-size:12px; font-weight:600; color:#334155;">${item.div}</span>
        </div>
        <div class="info-field">
          <span class="lbl" style="font-size:11px; color:#64748b;">업태</span>
          <span class="val" style="font-size:12px; font-weight:600; color:#334155;">${item.biz}</span>
        </div>
        <div class="info-field">
          <span class="lbl" style="font-size:11px; color:#64748b;">VHR 유형</span>
          <span class="val" style="font-size:12px; font-weight:600; color:#334155;">${item.vhr}</span>
        </div>
        <div class="info-field">
          <span class="lbl" style="font-size:11px; color:#64748b;">최초등록일</span>
          <span class="val" style="font-size:12px; font-weight:600; color:#334155;">${item.regDate}</span>
        </div>
      </div>
      ${oemSubLabel}
      <div class="mfr-card-actions">
        <button class="btn-mfr-action-edit" data-id="${item.id}">정보 수정</button>
        <button class="btn-mfr-action-eval" data-id="${item.id}">현장 평가</button>
      </div>
    `;

    // 정보 수정 단추
    card.querySelector('.btn-mfr-action-edit').addEventListener('click', (e) => {
      e.stopPropagation();
      openMfrProfileEdit(item);
    });

    // 현장 평가 시작 단추
    card.querySelector('.btn-mfr-action-eval').addEventListener('click', (e) => {
      e.stopPropagation();
      openMfrDetail(item);
    });

    container.appendChild(card);
  });
}

// 6. 제조사 정보 수정 화면 진입 및 기입값 바인딩
function openMfrProfileEdit(item) {
  const mfrEvalView = document.getElementById('mfr-eval-view');
  const mfrRegisterView = document.getElementById('mfr-register-view');
  const btnMfrSubmitRegister = document.getElementById('btnMfrSubmitRegister');

  mfrEvalView.style.display = 'none';
  mfrRegisterView.style.display = 'flex';

  document.getElementById('txt-mfr-register-title').textContent = '제조사 정보 수정';
  btnMfrSubmitRegister.dataset.mode = 'edit';
  btnMfrSubmitRegister.dataset.id = item.id;

  // 값 바인딩
  document.getElementById('mfrRegName').value = item.name;
  document.getElementById('mfrRegDiv').value = item.div;
  document.getElementById('mfrRegBiz').value = item.biz;
  
  document.querySelector(`input[name="mfrRegType"][value="${item.type}"]`).checked = true;
  document.querySelector(`input[name="mfrRegVhr"][value="${item.vhr}"]`).checked = true;
  
  document.getElementById('mfrRegDate').value = item.regDate;
  document.getElementById('mfrRegInspector').value = item.inspector;
  document.getElementById('mfrRegOwner').value = item.owner || '';
  document.getElementById('mfrRegLicense').value = item.licenseNo || '';

  // 추가 필드 바인딩
  document.getElementById('mfrRegAddress').value = item.address || '';
  document.getElementById('mfrRegCategory').value = item.category || '';
  document.getElementById('mfrRegSales').value = item.sales || '';
  document.getElementById('mfrRegClients').value = item.clients || '';
  document.getElementById('mfrRegEmployees').value = item.employees || '';
  document.getElementById('mfrRegCert').value = item.cert || '';
  document.getElementById('mfrRegManager').value = item.manager || '';
  document.getElementById('mfrRegMemo').value = item.comment || '';

  // OEM 하위 항목 바인딩 및 보임 여부
  const oemSection = document.getElementById('mfrRegOemSubSection');
  if (item.type === 'OEM') {
    oemSection.style.display = 'flex';
    bindBuyerCompaniesToMfrSelect();
    document.getElementById('mfrRegPartner').value = item.partner || '';
    document.getElementById('mfrRegRecheck').checked = item.recheck || false;
  } else {
    oemSection.style.display = 'none';
  }
}

// 7. 제조사 평가 상세 뷰 오픈 및 드롭다운/데이터 바인딩
function openMfrDetail(item) {
  const mfrEvalView = document.getElementById('mfr-eval-view');
  const mfrDetailView = document.getElementById('mfr-detail-view');
  
  mfrEvalView.style.display = 'none';
  mfrDetailView.style.display = 'flex';

  const selectWrapper = document.getElementById('mfr-detail-company-select-wrapper');
  const nameWrapper = document.getElementById('mfr-detail-company-name-wrapper');
  const summaryCard = document.getElementById('mfrDetailSummaryCard');
  const inspectSection = document.getElementById('mfrInspectionSection');
  const verdictBar = document.getElementById('mfrDetailVerdictBar');
  
  const commentTextarea = document.getElementById('mfrDetailComment');
  const lblEvalFile = document.getElementById('txtMfrEvalFile');
  const lblActionFile = document.getElementById('txtMfrActionFile');

  // 첨부 파일명 초기화
  lblEvalFile.textContent = '평가 파일 업로드 (.pdf, .xlsx)';
  lblActionFile.textContent = '개선 조치 파일 업로드 (.pdf, .docx)';
  commentTextarea.value = '';

  if (item === null) {
    // A. 신규 평가 모드 (업체 선택 드롭다운 띄우기)
    activeMfrDetailItem = null;
    activeMfrChecklist = null;

    selectWrapper.style.display = 'block';
    nameWrapper.style.display = 'none';
    summaryCard.style.display = 'none';
    inspectSection.style.display = 'none';
    verdictBar.style.display = 'none';

    // 평가 가능한 제조사 리스트 (현재 바이어 계정 권한 격리 대상) 바인딩
    const selectBox = document.getElementById('mfrDetailCompanySelect');
    selectBox.innerHTML = '<option value="" disabled selected>제조사 업체를 선택해 주세요.</option>';

    const matchedMfrs = mfrMockData.filter(d => d.buyerId === currentBuyerId);
    matchedMfrs.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.name} (${m.type})`;
      selectBox.appendChild(opt);
    });

  } else {
    // B. 기존 평가 조회 및 수정 모드
    activeMfrDetailItem = item;
    activeMfrChecklist = item.checklist ? JSON.parse(JSON.stringify(item.checklist)) : createDefaultChecklist(item.status);

    selectWrapper.style.display = 'none';
    nameWrapper.style.display = 'block';
    summaryCard.style.display = 'block';
    inspectSection.style.display = 'flex';
    verdictBar.style.display = 'flex';

    // 업체 요약정보 채우기
    document.getElementById('mfrDetailCompanyTypeBadge').textContent = item.type === 'OEM' ? 'OEM 제조사' : '일반 제조사';
    document.getElementById('mfrDetailCompanyTypeBadge').className = `badge ${item.type === 'OEM' ? 'status-pending' : 'status-completed'}`;
    document.getElementById('mfrDetailCompanyNameText').textContent = item.name;

    document.getElementById('lblMfrDetailDiv').textContent = item.div;
    document.getElementById('lblMfrDetailBiz').textContent = item.biz;
    document.getElementById('lblMfrDetailVhr').textContent = item.vhr;
    document.getElementById('lblMfrDetailInspector').textContent = item.inspector;

    commentTextarea.value = item.comment || '';
    if (item.evalFile) lblEvalFile.textContent = item.evalFile;
    if (item.actionFile) lblActionFile.textContent = item.actionFile;

    // 질문 목록 및 판정 렌더링
    renderMfrChecklistQuestions(activeMfrChecklist);
    updateMfrRealtimeDisplay(activeMfrChecklist);
  }
}

// 8. 14대 위생 점검 체크리스트 질문 카드군 동적 빌드
function renderMfrChecklistQuestions(checklist) {
  const container = document.getElementById('mfrChecklistQuestions');
  if (!container) return;

  container.innerHTML = '';

  checklist.forEach((q) => {
    const card = document.createElement('div');
    card.className = 'question-card';

    // 적합/부적합 상태에 따른 버튼 액티브 클래스 결정
    const isFitActive = q.result === 'fit' ? 'active' : '';
    const isUnfitActive = q.result === 'unfit' ? 'active' : '';
    
    // 상세 정보 작성 여부 배지
    const hasDetailInfo = q.detailComment || (q.photos && q.photos.length > 0);
    const detailBadge = hasDetailInfo ? `<span class="detail-completed-badge" style="margin-left: 6px;">상세 등록됨</span>` : '';

    // 사진 썸네일 미리보기
    let photoThumbsHtml = '';
    if (q.photos && q.photos.length > 0) {
      photoThumbsHtml = `
        <div class="card-thumbs-grid" style="display: flex; gap: 8px; margin-top: 10px;">
          ${q.photos.map(src => `<img src="${src}" class="thumb-mini" style="width: 42px; height: 42px; border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0; cursor: pointer;">`).join('')}
        </div>
      `;
    }

    // 상세 정보 코멘트 스니펫
    const commentSnippet = q.detailComment ? `
      <p class="comment-snippet" style="font-size: 11px; color: #475569; background: #f8fafc; padding: 8px 12px; border-radius: 8px; border-left: 3px solid #64748b; margin: 8px 0 0 0; line-height: 1.4;">
        ${q.detailComment}
      </p>
    ` : '';

    // 개별 질문 카드 마크업 조립
    card.innerHTML = `
      <div class="question-header">
        <div class="q-title-row">
          <span class="q-num">${q.id}</span>
          <span class="q-category">[${q.category}]</span>
          ${detailBadge}
          <button class="btn-item-help" title="항목 설명 보기" style="background: none; border: none; font-size: 14px; color: #3b82f6; cursor: pointer; padding: 0 4px; display: inline-flex; align-items: center;">⍰</button>
        </div>
        <p class="q-item-text" style="font-size: 13px; font-weight: 600; color: #0f172a; margin: 4px 0 0 0; line-height: 1.45;">${q.item}</p>
      </div>

      <div class="question-body">
        <div class="scoring-toggle-buttons">
          <button class="btn-score btn-score-fit ${isFitActive}" data-score="fit">적합</button>
          <button class="btn-score btn-score-unfit ${isUnfitActive}" data-score="unfit">부적합</button>
        </div>
        
        <!-- 적합/부적합 선택 시 상세 추가 버튼 노출 -->
        <button class="btn-item-detail-page" style="display: ${q.result ? 'block' : 'none'}; width: 100%; height: 36px; border: 1px dashed #cbd5e1; background: #ffffff; border-radius: 8px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer; margin-top: 10px;">
          상세 내용 및 사진 추가
        </button>
        
        ${commentSnippet}
        ${photoThumbsHtml}
      </div>
    `;

    // 1) 적합/부적합 판정 토글 클릭 핸들러
    const btnFit = card.querySelector('.btn-score-fit');
    const btnUnfit = card.querySelector('.btn-score-unfit');
    const btnDetail = card.querySelector('.btn-item-detail-page');

    function selectScore(score) {
      q.result = score;
      if (score === 'fit') {
        btnFit.classList.add('active');
        btnUnfit.classList.remove('active');
      } else {
        btnFit.classList.remove('active');
        btnUnfit.classList.add('active');
      }
      btnDetail.style.display = 'block';
      
      // 실시간 배지 및 판정 업데이트
      updateMfrRealtimeDisplay(checklist);
    }

    btnFit.addEventListener('click', () => selectScore('fit'));
    btnUnfit.addEventListener('click', () => selectScore('unfit'));

    // 2) 상세 정보 등록 페이지 이동
    btnDetail.addEventListener('click', () => {
      openMfrItemDetailReg(q);
    });

    // 3) 도움말 페이지 이동
    card.querySelector('.btn-item-help').addEventListener('click', (e) => {
      e.stopPropagation();
      openMfrItemHelp(q);
    });

    // 4) 썸네일 라이트박스 연동
    const thumbs = card.querySelectorAll('.thumb-mini');
    thumbs.forEach((img, idx) => {
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        openImagePopup(q.photos[idx]);
      });
    });

    container.appendChild(card);
  });
}

// 9. 문항별 도움말 가이드라인 열기
function openMfrItemHelp(q) {
  const helpView = document.getElementById('mfr-item-help-view');
  if (!helpView) return;

  const guide = checklistGuideLines[q.id] || {
    law: "식품위생법 관련 영업자 및 종사자 준수사항에 의거하여 해당 항목의 기준을 철저히 이행해야 합니다.",
    unfits: ["해당 항목의 관리 부실 및 기준 미달 상태"],
    checkpoint: "해당 위생 관리 요소에 대해 현장에서 직접 목측 및 서류 대조를 진행하십시오."
  };

  document.getElementById('mfrItemHelpCategory').textContent = q.category;
  document.getElementById('mfrItemHelpTitle').textContent = q.item;
  document.getElementById('mfrItemHelpLaw').textContent = guide.law;
  document.getElementById('mfrItemHelpCheckPoint').innerHTML = guide.checkpoint.replace(/\n/g, '<br>');

  const unfitList = document.getElementById('mfrItemHelpUnfitExamples');
  unfitList.innerHTML = '';
  guide.unfits.forEach(ex => {
    const li = document.createElement('li');
    li.textContent = ex;
    unfitList.appendChild(li);
  });

  document.getElementById('mfr-detail-view').style.display = 'none';
  helpView.style.display = 'flex';
}

// 10. 문항별 상세 코멘트 & 사진 등록 뷰 열기
function openMfrItemDetailReg(q) {
  const detailRegView = document.getElementById('mfr-item-detail-view');
  if (!detailRegView) return;

  mfrCurrentQuestionId = q.id;
  mfrQuestionTempPhotos = q.photos ? [...q.photos] : [];

  document.getElementById('mfrItemRegCategory').textContent = q.category;
  document.getElementById('mfrItemRegTitle').textContent = q.item;
  document.getElementById('mfrItemRegDesc').textContent = q.desc;
  document.getElementById('mfrItemRegComment').value = q.detailComment || '';

  renderMfrItemPhotoPreviews(mfrQuestionTempPhotos);

  document.getElementById('mfr-detail-view').style.display = 'none';
  detailRegView.style.display = 'flex';
}

// 11. 이미지 썸네일 미리보기
function renderMfrItemPhotoPreviews(photos) {
  const previewGrid = document.getElementById('mfrItemRegPreviewGrid');
  if (!previewGrid) return;

  previewGrid.innerHTML = '';

  photos.forEach((src, idx) => {
    const thumb = document.createElement('div');
    thumb.className = 'preview-thumb';
    thumb.style.cursor = 'pointer';
    thumb.innerHTML = `
      <img src="${src}" alt="현장 사진 미리보기">
      <button class="btn-del-thumb" data-index="${idx}">&times;</button>
    `;

    thumb.querySelector('.btn-del-thumb').addEventListener('click', (e) => {
      e.stopPropagation();
      photos.splice(idx, 1);
      renderMfrItemPhotoPreviews(photos);
    });

    previewGrid.appendChild(thumb);
  });
}

// 12. 제조사 실시간 부적합 자동 판정
function calculateMfrFinalVerdict(checklist) {
  const values = checklist.map(q => q.result);
  
  // 1) 아직 하나라도 판정하지 않은 문항이 있으면 pending
  const hasUnanswered = values.some(v => v === '');
  
  // 2) 부적합('unfit')이 단 하나라도 존재하면 최종 verdict는 unfit
  const hasUnfit = values.includes('unfit');

  if (hasUnfit) return 'unfit';
  if (hasUnanswered) return 'pending';
  return 'fit';
}

// 13. 실시간 배지 피드백 업데이트
function updateMfrRealtimeDisplay(checklist) {
  const verdict = calculateMfrFinalVerdict(checklist);
  const badge = document.getElementById('mfrVerdictBadge');
  if (!badge) return;

  if (verdict === 'fit') {
    badge.textContent = '최종 적합';
    badge.className = 'badge verdict-badge badge-fit';
  } else if (verdict === 'unfit') {
    badge.textContent = '최종 부적합';
    badge.className = 'badge verdict-badge badge-unfit';
  } else {
    badge.textContent = '판정 대기';
    badge.className = 'badge verdict-badge status-pending';
  }
}
