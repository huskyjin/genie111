// 2. 제조사 평가 초기화 진입점
function initMfrEval() {
  const menuFactory = document.getElementById('menu_factory');
  const btnMfrBackToHome = document.getElementById('btnMfrBackToHome');
  const homeView = document.getElementById('home-view');
  const mfrEvalView = document.getElementById('mfr-eval-view');

  const btnMfrHeaderAdd = document.getElementById('btnMfrHeaderAdd');
  const mfrRegisterView = document.getElementById('mfr-register-view');

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
    renderMfrCompanyList();
  });

  btnMfrBackToHome.addEventListener('click', () => {
    mfrEvalView.style.display = 'none';
    homeView.style.display = 'flex';
  });

  // C. 플러스(+) 등록 단추 액션
  btnMfrHeaderAdd.addEventListener('click', () => {
    // 신규 제조사 등록 씬(Scene)으로 이동
    mfrEvalView.style.display = 'none';
    mfrRegisterView.style.display = 'flex';

    // 폼 초기화 및 기본값 설정
    document.getElementById('txt-mfr-register-title').textContent = '신규 제조사 등록';
    btnMfrSubmitRegister.dataset.mode = 'new';
    
    // OEM 전용 추가 항목 컨테이너 기본 표시 (OEM 라디오 디폴트 체크이므로)
    document.getElementById('mfrRegOemSubSection').style.display = 'flex';

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
    document.getElementById('mfrRegPartner').value = '';
    document.getElementById('mfrRegRecheck').checked = false;
    document.getElementById('mfrRegCategory').value = '';
    document.getElementById('mfrRegSales').value = '';
    document.getElementById('mfrRegClients').value = '';
    document.getElementById('mfrRegEmployees').value = '';
    document.getElementById('mfrRegCert').value = '';
    document.getElementById('mfrRegManager').value = '';
    document.getElementById('mfrRegMemo').value = '';
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
    const partner = type === 'OEM' ? document.getElementById('mfrRegPartner').value.trim() : '';
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
        showToast('OEM 제조사는 거래업체 입력이 필수입니다.');
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
        comment: memo
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
        showToast('제조사 정보가 성공적으로 수정되었습니다.');
      }
    }

    // 목록 복귀
    mfrRegisterView.style.display = 'none';
    mfrEvalView.style.display = 'flex';
    renderMfrCompanyList();
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
    renderMfrCompanyList();
  });

  btnMfrFilterApply.addEventListener('click', () => {
    mfrFilters.div = document.getElementById('mfrFilterDiv').value;
    mfrFilters.biz = document.getElementById('mfrFilterBiz').value;
    mfrFilters.vhr = document.getElementById('mfrFilterVhr').value;
    mfrFilters.type = document.getElementById('mfrFilterType').value;

    const hasActiveFilter = mfrFilters.div || mfrFilters.biz || mfrFilters.vhr || mfrFilters.type;
    document.getElementById('mfrFilterActiveDot').style.display = hasActiveFilter ? 'block' : 'none';

    mfrFilterOverlay.style.display = 'none';
    renderMfrCompanyList();
  });

  // 실시간 제조사명 검색어 인풋 리스너
  const mfrSearchInput = document.getElementById('mfrSearchInput');
  mfrSearchInput.addEventListener('input', (e) => {
    renderMfrCompanyList();
  });
}

// 5. 등록 제조사 리스트 렌더링
function renderMfrCompanyList() {
  const container = document.getElementById('mfrCompanyList');
  if (!container) return;

  container.innerHTML = '';

  const keyword = document.getElementById('mfrSearchInput').value.trim().toLowerCase();

  // 필터링 적용 (Div + Biz + VHR + Type + Keyword)
  const filtered = mfrMockData.filter(item => {
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
    card.style.cursor = 'pointer';

    const oemSubLabel = item.type === 'OEM' ? `
      <div style="font-size:11px; color:#ef4444; font-weight:700; margin-top:2px;">
        • 거래업체: ${item.partner || '미지정'} ${item.recheck ? '<span style="color:#eab308; margin-left:8px;">[재점검대상]</span>' : ''}
      </div>
    ` : '';

    card.innerHTML = `
      <div class="card-header-row">
        <h4 class="card-title" style="font-size:15px; font-weight:700; margin: 0;">${item.name}</h4>
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
    `;

    // 카드 영역 클릭 시 바로 제조사 정보 수정 화면으로 진입
    card.addEventListener('click', () => {
      openMfrProfileEdit(item);
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
    document.getElementById('mfrRegPartner').value = item.partner || '';
    document.getElementById('mfrRegRecheck').checked = item.recheck || false;
  } else {
    oemSection.style.display = 'none';
  }
}