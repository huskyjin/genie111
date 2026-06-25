/* ==========================================
   Hi-Genie 프로토타입 인터랙션 스크립트 (main.js)
   ========================================== */

// 1. 다국어 텍스트 데이터 사전 (Dictionary)
const translations = {
  ko: {
    userRole: '관리자',
    userDept: '롯데중앙연구소',
    shopReg: '점포 등록',
    menuBuyer: 'Buyer 평가',
    menuFactory: '제조사 현장 평가',
    menuInfo: '정보',
    menuTicket: '지원',
    average: '평균점수',
    suffix: '기준',
    noticeTag: '[회수]',
    noticeText: '주식회사 디와이푸드텍 농업회사법인 추억의 알짜소세지 세균수 기준규격 부적합 20260902',
    toastNoNoti: '새로운 알림이 없습니다.',
    toastApproved: '결재가 정상 승인되었습니다.',
    modalTitle: '결재 대기 문서 목록',
    modalEmpty: '결재 대기 중인 안전성 검사 보고서가 없습니다.',
    doc1: '[점검] 소공점 정기 안전성 진단 결과서',
    doc2: '[개선] 잠실점 냉동식품 온도 부적합 개선 조치서',
    btnApprove: '승인'
  },
  en: {
    userRole: 'Admin',
    userDept: 'Lotte R&D Center',
    shopReg: 'Register Shop',
    menuBuyer: 'Buyer Eval.',
    menuFactory: 'Factory Eval.',
    menuInfo: 'Information',
    menuTicket: 'Support',
    average: 'Average Score',
    suffix: 'As of',
    noticeTag: '[Recall]',
    noticeText: 'DY Food Tech Corp. Memory Sausage Germ Count Standard Violation 20260902',
    toastNoNoti: 'No new notifications.',
    toastApproved: 'The approval has been successfully processed.',
    modalTitle: 'Approval Pending List',
    modalEmpty: 'There are no safety reports pending approval.',
    doc1: '[Inspection] Sogong Store Regular Safety Report',
    doc2: '[Improvement] Jamsil Store Frozen Food Temp Violation Resolution',
    btnApprove: 'Approve'
  }
};

// 2. 계열사별 차트 모의 데이터 (Mock Database)
const affiliateData = {
  'lotte-dept': {
    lastYear: 95,
    thisYear: 95,
    thisMonth: 94
  },
  'lotte-mart': {
    lastYear: 92,
    thisYear: 94,
    thisMonth: 95
  },
  'lotte-super': {
    lastYear: 90,
    thisYear: 91,
    thisMonth: 89
  },
  'lotte-outlets': {
    lastYear: 93,
    thisYear: 93,
    thisMonth: 93
  }
};

// 3. 상태 관리 변수
let currentLang = 'ko';
let pendingApprovalCount = 2; // 초기 결재 대기 2건

// 4. DOM 요소 셀렉터
const dom = {
  selectAffiliate: document.getElementById('selectAffiliate'),
  btnLanguage: document.getElementById('btnLanguage'),
  langDropdown: document.getElementById('langDropdown'),
  flagKor: document.getElementById('flag-kor'),
  langLabel: document.getElementById('lang-label'),
  
  // 번역 대상 텍스트 노드
  txtUserRole: document.getElementById('txt-user-role'),
  txtUserDept: document.getElementById('txt-user-dept'),
  txtShopReg: document.getElementById('txt-shop-reg'),
  txtMenuBuyer: document.getElementById('txt-menu-buyer'),
  txtMenuFactory: document.getElementById('txt-menu-factory'),
  txtMenuInfo: document.getElementById('txt-menu-info'),
  txtMenuTicket: document.getElementById('txt-menu-ticket'),
  lblAverages: document.querySelectorAll('.lbl-average'),
  txtSuffix: document.getElementById('txt-suffix'),
  
  // 차트 스펙
  valLastYear: document.getElementById('val-last-year'),
  valThisYear: document.getElementById('val-this-year'),
  valThisMonth: document.getElementById('val-this-month'),
  fillLastYear: document.querySelector('.bar-fill.last-year'),
  fillThisYear: document.querySelector('.bar-fill.this-year'),
  fillThisMonth: document.querySelector('.bar-fill.this-month'),
  
  // 알림 & 공지사항
  btnNoti: document.getElementById('btnNoti'),
  notiDot: document.querySelector('.noti-dot'),
  btnNotice: document.getElementById('btnNotice'),
  noticeTrack: document.getElementById('notice-track'),
  toast: document.getElementById('toast'),
  
  // 결재 모달
  btnApproval: document.getElementById('btnApproval'),
  approvalCount: document.getElementById('approval-count'),
  sidebarApprovalCount: document.getElementById('sidebar-approval-count'),
  approvalModal: document.getElementById('approvalModal'),
  btnCloseModal: document.getElementById('btnCloseModal'),
  modalEmptyText: document.getElementById('modal-empty-text'),
  approvalList: document.getElementById('approval-list'),
};

// 5. 초기화 함수
function init() {
  // 초기 결재 배지 세팅
  updateApprovalBadge();
  
  // 공지사항 흐르기 애니메이션 설정
  setupNoticeAnimation();

  // 이벤트 바인딩
  bindEvents();

  // Buyer 평가 시뮬레이션 초기화
  initBuyerEval();
}

// 6. 이벤트 핸들러 및 리스너 등록
function bindEvents() {
  
  // 계열사 변경 시 차트 데이터 갱신
  dom.selectAffiliate.addEventListener('change', (e) => {
    const value = e.target.value;
    updateChartData(value);
  });

  // 언어 선택 드롭다운 토글
  dom.btnLanguage.addEventListener('click', (e) => {
    e.stopPropagation();
    dom.langDropdown.classList.toggle('show');
  });

  // 전역 클릭 시 드롭다운 닫기
  document.addEventListener('click', () => {
    dom.langDropdown.classList.remove('show');
  });

  // 다국어 변경 처리
  dom.langDropdown.addEventListener('click', (e) => {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;
    
    // active 클래스 제어
    dom.langDropdown.querySelectorAll('.dropdown-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');

    const selectedLang = item.getAttribute('data-lang');
    changeLanguage(selectedLang);
  });

  // 알림 클릭 시 토스트 노출
  dom.btnNoti.addEventListener('click', () => {
    showToast(translations[currentLang].toastNoNoti);
    dom.notiDot.style.display = 'none'; // 알림 확인 시 점 소멸
  });

  // 가상 알림 추가 시뮬레이션 (3초 후 상단 알림 배지 활성화)
  setTimeout(() => {
    dom.notiDot.style.display = 'block';
  }, 3000);

  // 결재함 모달 제어
  dom.btnApproval.addEventListener('click', () => {
    dom.approvalModal.classList.add('show');
  });

  dom.btnCloseModal.addEventListener('click', () => {
    dom.approvalModal.classList.remove('show');
  });

  dom.approvalModal.addEventListener('click', (e) => {
    if (e.target === dom.approvalModal) {
      dom.approvalModal.classList.remove('show');
    }
  });

  // 결재 승인 처리 시뮬레이션
  dom.approvalList.addEventListener('click', (e) => {
    const btnApprove = e.target.closest('.btn-action-approve');
    if (!btnApprove) return;

    const item = btnApprove.closest('.approval-item');
    
    // 리스트에서 부드럽게 삭제
    item.style.transition = 'all 0.3s ease-out';
    item.style.opacity = '0';
    item.style.transform = 'translateX(50px)';
    
    setTimeout(() => {
      item.remove();
      pendingApprovalCount--;
      updateApprovalBadge();
      showToast(translations[currentLang].toastApproved);

      // 전체 승인 시 분기 처리
      if (pendingApprovalCount <= 0) {
        dom.approvalList.style.display = 'none';
        dom.modalEmptyText.style.display = 'block';
        dom.modalEmptyText.textContent = translations[currentLang].modalEmpty;
      }
    }, 300);
  });

  // 공지사항 배너 클릭 시 알림 토스트
  dom.btnNotice.addEventListener('click', () => {
    showToast(`${translations[currentLang].noticeTag} 공지사항 상세 화면으로 이동합니다.`);
  });

  // 8대 메뉴 클릭 시 햅틱 피드백 가상 동작 (토스트 노출)
  const menuButtons = document.querySelectorAll('.menu-item, .btn-shop-reg');
  menuButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.querySelector('.menu-title, span').textContent;
      showToast(`[${name}] 모듈로 진입합니다. (프로토타입 데모)`);
    });
  });
}

// 7. 차트 갱신 로직 (마이크로 애니메이션 리셋 포함)
function updateChartData(affiliateKey) {
  const data = affiliateData[affiliateKey];
  if (!data) return;

  // 텍스트 페이드 효과와 함께 값 갱신
  [dom.valLastYear, dom.valThisYear, dom.valThisMonth].forEach(el => {
    el.style.transition = 'opacity 0.2s';
    el.style.opacity = '0';
  });

  setTimeout(() => {
    dom.valLastYear.textContent = data.lastYear;
    dom.valThisYear.textContent = data.thisYear;
    dom.valThisMonth.textContent = data.thisMonth;

    [dom.valLastYear, dom.valThisYear, dom.valThisMonth].forEach(el => {
      el.style.opacity = '1';
    });
  }, 200);

  // 차트 바 리셋 후 부드러운 상승 애니메이션
  resetAndAnimateBar(dom.fillLastYear, `${data.lastYear}%`);
  resetAndAnimateBar(dom.fillThisYear, `${data.thisYear}%`);
  resetAndAnimateBar(dom.fillThisMonth, `${data.thisMonth}%`);
}

function resetAndAnimateBar(barElement, targetHeight) {
  barElement.style.animation = 'none';
  barElement.offsetHeight; // Reflow 트리거
  barElement.style.setProperty('--target-height', targetHeight);
  barElement.style.animation = 'riseUp 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
}

// 8. 다국어 번역 제어
function changeLanguage(lang) {
  currentLang = lang;
  const trans = translations[lang];

  // 플래그 및 레이블 교체
  if (lang === 'ko') {
    dom.flagKor.textContent = '🇰🇷';
    dom.langLabel.textContent = 'Korean';
  } else {
    dom.flagKor.textContent = '🇺🇸';
    dom.langLabel.textContent = 'English';
  }

  // 텍스트 노드 일괄 업데이트
  dom.txtUserRole.textContent = trans.userRole;
  dom.txtUserDept.textContent = trans.userDept;
  dom.txtShopReg.textContent = trans.shopReg;
  dom.txtMenuBuyer.textContent = trans.menuBuyer;
  dom.txtMenuFactory.textContent = trans.menuFactory;
  dom.txtMenuInfo.textContent = trans.menuInfo;
  dom.txtMenuTicket.textContent = trans.menuTicket;
  dom.txtSuffix.textContent = trans.suffix;

  dom.lblAverages.forEach(el => {
    el.textContent = trans.average;
  });

  // 공지사항 롤링 영역 변경
  const noticeHtml = `<span class="notice-tag">${trans.noticeTag}</span> <span class="notice-text">${trans.noticeText}</span>`;
  dom.noticeTrack.innerHTML = noticeHtml;

  // 모달 텍스트
  dom.modalEmptyText.textContent = trans.modalEmpty;
  
  // 모달 리스트 항목
  const docTitles = dom.approvalList.querySelectorAll('.doc-title');
  if (docTitles.length >= 2) {
    docTitles[0].textContent = trans.doc1;
    docTitles[1].textContent = trans.doc2;
  }
  dom.approvalList.querySelectorAll('.btn-action-approve').forEach(btn => {
    btn.textContent = trans.btnApprove;
  });

  // 리셋 공지 애니메이션
  setupNoticeAnimation();
}

// 9. 결재함 배지 카운트 업데이트
function updateApprovalBadge() {
  dom.approvalCount.textContent = pendingApprovalCount;
  if (dom.sidebarApprovalCount) {
    dom.sidebarApprovalCount.textContent = `${pendingApprovalCount}건`;
  }
  
  if (pendingApprovalCount <= 0) {
    dom.approvalCount.style.display = 'none';
    if (dom.sidebarApprovalCount) {
      dom.sidebarApprovalCount.className = 'value text-green';
      dom.sidebarApprovalCount.textContent = translations[currentLang].modalEmpty.includes('reports') ? 'Clean' : '완료';
    }
  } else {
    dom.approvalCount.style.display = 'flex';
    if (dom.sidebarApprovalCount) {
      dom.sidebarApprovalCount.className = 'value badge-red';
    }
    
    // 배지 업데이트 시 통통 튀는 애니메이션 효과 부여
    dom.approvalCount.classList.add('scale-pulse');
    setTimeout(() => {
      dom.approvalCount.classList.remove('scale-pulse');
    }, 400);

    // 모달 데이터 리스트 동기화
    dom.modalEmptyText.style.display = 'none';
    dom.approvalList.style.display = 'flex';
  }
}

// 10. 공지사항 텍스트 스크롤링 애니메이션 로직
let noticeAnimFrame = null;
function setupNoticeAnimation() {
  if (noticeAnimFrame) {
    cancelAnimationFrame(noticeAnimFrame);
  }

  const containerWidth = dom.btnNotice.querySelector('.notice-container').offsetWidth;
  const trackWidth = dom.noticeTrack.offsetWidth;
  
  // 텍스트가 더 길어서 스크롤이 필요할 때만 애니메이션 작동
  if (trackWidth > containerWidth) {
    let position = containerWidth;
    
    function scroll() {
      position -= 0.8; // 속도 조절
      if (position < -trackWidth) {
        position = containerWidth;
      }
      dom.noticeTrack.style.transform = `translateX(${position}px)`;
      noticeAnimFrame = requestAnimationFrame(scroll);
    }
    
    scroll();
  } else {
    dom.noticeTrack.style.transform = 'translateX(0)';
  }
}

// 11. 토스트 메시지 출력
let toastTimeout = null;
function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add('show');
  
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastTimeout = setTimeout(() => {
    dom.toast.classList.remove('show');
  }, 2500);
}

/* ==========================================
   Buyer 평가 모듈 시뮬레이션 스크립트
   ========================================== */

// 12. Buyer 평가 모의 데이터 (Mock Database)
const buyerMockData = [
  { id: 1, name: '주식회사 푸드링크', date: '2026-06-24', div: '농산', biz: '제조가공업', vhr: 'VHR', express: true, status: 'fit' },
  { id: 2, name: '(주)대현수산', date: '2026-06-25', div: '수산', biz: '소분업', vhr: 'HR', express: false, status: 'pending' },
  { id: 3, name: '영양축산푸드', date: '2026-06-23', div: '축산', biz: '제조가공업', vhr: 'R', express: true, status: 'unfit' },
  { id: 4, name: '롯데조리유통', date: '2026-06-18', div: '조리', biz: '유통업', vhr: 'VHR', express: false, status: 'fit' },
  { id: 5, name: '삼성그로서리', date: '2026-06-20', div: '그로서리', biz: '수입원', vhr: 'HR', express: false, status: 'fit' },
  { id: 6, name: '우리가공식품', date: '2026-06-15', div: '농산', biz: '제조가공업', vhr: 'R', express: true, status: 'fit' },
  { id: 7, name: '바다사랑수산', date: '2026-06-28', div: '수산', biz: '제조가공업', vhr: 'VHR', express: false, status: 'unfit' },
  { id: 8, name: '참조은축산', date: '2026-06-10', div: '축산', biz: '소분업', vhr: 'R', express: false, status: 'pending' },
  { id: 9, name: '조리나라', date: '2026-06-12', div: '조리', biz: '제조가공업', vhr: 'HR', express: true, status: 'fit' },
  { id: 10, name: '글로벌식품수입', date: '2026-06-05', div: '그로서리', biz: '수입원', vhr: 'VHR', express: false, status: 'pending' }
];

// 13. 바이어 평가 상태 변수
let buyerActiveTab = 'all';
let buyerFilters = {
  dateStart: '2026-06-01',
  dateEnd: '2026-06-30',
  div: 'all',
  biz: 'all',
  vhrs: ['VHR', 'HR', 'R'],
  expressOnly: false
};

// 14. Buyer 평가 모듈 초기화 함수
function initBuyerEval() {
  const btnBuyerMenu = document.getElementById('menu_buyer');
  const btnBackToHome = document.getElementById('btnBackToHome');
  const btnOpenFilter = document.getElementById('btnOpenFilter');
  const btnCloseFilter = document.getElementById('btnCloseFilter');
  const btnFilterReset = document.getElementById('btnFilterReset');
  const btnFilterApply = document.getElementById('btnFilterApply');
  const tabItems = document.querySelectorAll('.tab-container .tab-item');

  const homeView = document.getElementById('home-view');
  const buyerEvalView = document.getElementById('buyer-eval-view');
  const filterOverlay = document.getElementById('buyerFilterOverlay');

  if (!btnBuyerMenu) return;

  // 메인 메뉴 클릭 시 Buyer 평가 화면으로 전환
  btnBuyerMenu.addEventListener('click', (e) => {
    e.stopPropagation(); // 기존 bindEvents의 가상 모듈 진입 토스트 실행 방지
    homeView.style.display = 'none';
    buyerEvalView.style.display = 'flex';
    
    // 필터 기본 세팅 동기화 및 렌더링
    syncFilterUI();
    renderBuyerList();
  });

  // 뒤로가기 버튼 클릭 시 홈 화면 복구
  btnBackToHome.addEventListener('click', () => {
    buyerEvalView.style.display = 'none';
    homeView.style.display = 'flex';
  });

  // 필터 열기/닫기
  btnOpenFilter.addEventListener('click', () => {
    filterOverlay.classList.add('show');
  });

  btnCloseFilter.addEventListener('click', () => {
    filterOverlay.classList.remove('show');
  });

  filterOverlay.addEventListener('click', (e) => {
    if (e.target === filterOverlay) {
      filterOverlay.classList.remove('show');
    }
  });

  // 필터 리셋
  btnFilterReset.addEventListener('click', () => {
    document.getElementById('filterDateStart').value = '2026-06-01';
    document.getElementById('filterDateEnd').value = '2026-06-30';
    document.getElementById('filterDiv').value = 'all';
    document.getElementById('filterBiz').value = 'all';
    document.querySelectorAll('input[name="filterVhr"]').forEach(chk => chk.checked = true);
    document.getElementById('filterExpress').checked = false;
    showToast('필터가 초기화되었습니다.');
  });

  // 필터 적용
  btnFilterApply.addEventListener('click', () => {
    buyerFilters.dateStart = document.getElementById('filterDateStart').value;
    buyerFilters.dateEnd = document.getElementById('filterDateEnd').value;
    buyerFilters.div = document.getElementById('filterDiv').value;
    buyerFilters.biz = document.getElementById('filterBiz').value;
    
    buyerFilters.vhrs = [];
    document.querySelectorAll('input[name="filterVhr"]:checked').forEach(chk => {
      buyerFilters.vhrs.push(chk.value);
    });
    
    buyerFilters.expressOnly = document.getElementById('filterExpress').checked;

    // 필터 활성화 배지 표시 여부 결정
    const filterActiveDot = document.getElementById('filterActiveDot');
    const isFilterActive = buyerFilters.div !== 'all' || 
                           buyerFilters.biz !== 'all' || 
                           buyerFilters.vhrs.length !== 3 || 
                           buyerFilters.expressOnly ||
                           buyerFilters.dateStart !== '2026-06-01' ||
                           buyerFilters.dateEnd !== '2026-06-30';
    
    filterActiveDot.style.display = isFilterActive ? 'block' : 'none';

    filterOverlay.classList.remove('show');
    showToast('필터 조건이 적용되었습니다.');
    renderBuyerList();
  });

  // 구분 탭 스위칭
  tabItems.forEach(tab => {
    tab.addEventListener('click', () => {
      tabItems.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      buyerActiveTab = tab.getAttribute('data-tab');
      renderBuyerList();
    });
  });
}

// 15. 필터 UI 데이터 동기화
function syncFilterUI() {
  document.getElementById('filterDateStart').value = buyerFilters.dateStart;
  document.getElementById('filterDateEnd').value = buyerFilters.dateEnd;
  document.getElementById('filterDiv').value = buyerFilters.div;
  document.getElementById('filterBiz').value = buyerFilters.biz;
  
  document.querySelectorAll('input[name="filterVhr"]').forEach(chk => {
    chk.checked = buyerFilters.vhrs.includes(chk.value);
  });
  
  document.getElementById('filterExpress').checked = buyerFilters.expressOnly;
}

// 16. Buyer 평가 리스트 동적 렌더링
function renderBuyerList() {
  const listContainer = document.getElementById('buyerEvalList');
  if (!listContainer) return;

  listContainer.innerHTML = '';

  // 필터링 적용
  const filtered = buyerMockData.filter(item => {
    // 1) 상태 탭 필터링
    if (buyerActiveTab === 'fit' && item.status !== 'fit') return false;
    if (buyerActiveTab === 'unfit' && item.status !== 'unfit') return false;
    
    // 2) 날짜 범위 필터링
    if (item.date < buyerFilters.dateStart || item.date > buyerFilters.dateEnd) return false;
    
    // 3) 사업부 필터링
    if (buyerFilters.div !== 'all' && item.div !== buyerFilters.div) return false;
    
    // 4) 업태 필터링
    if (buyerFilters.biz !== 'all' && item.biz !== buyerFilters.biz) return false;
    
    // 5) VHR유형 복수선택 필터링
    if (!buyerFilters.vhrs.includes(item.vhr)) return false;
    
    // 6) Express 긴급 여부 필터링
    if (buyerFilters.expressOnly && !item.express) return false;

    return true;
  });

  // 데이터가 비었을 때 빈 화면 렌더링
  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div class="list-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>조회 조건에 부합하는 평가 결과가 없습니다.</p>
      </div>
    `;
    return;
  }

  // 카드 렌더링
  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'eval-card';
    
    let statusText = '대기';
    let statusClass = 'badge-pending';
    if (item.status === 'fit') {
      statusText = '적합';
      statusClass = 'badge-fit';
    } else if (item.status === 'unfit') {
      statusText = '부적합';
      statusClass = 'badge-unfit';
    }

    const expressBadge = item.express ? `<span class="eval-badge badge-express">Express</span>` : '';

    card.innerHTML = `
      <div class="card-header-row">
        <h4 class="card-title">${item.name}</h4>
        <div class="card-badges">
          ${expressBadge}
          <span class="eval-badge ${statusClass}">${statusText}</span>
        </div>
      </div>
      <div class="card-info-grid">
        <div class="info-field">
          <span class="lbl">사업부 (Div.)</span>
          <span class="val">${item.div}</span>
        </div>
        <div class="info-field">
          <span class="lbl">업태</span>
          <span class="val">${item.biz}</span>
        </div>
        <div class="info-field">
          <span class="lbl">VHR 유형</span>
          <span class="val">${item.vhr}</span>
        </div>
        <div class="info-field">
          <span class="lbl">평가 등록일</span>
          <span class="val">${item.date}</span>
        </div>
      </div>
    `;

    // 카드 개별 클릭 이벤트 바인딩 (햅틱 효과 시뮬레이션)
    card.addEventListener('click', () => {
      showToast(`[${item.name}] 상세 평가 보고서 화면으로 이동합니다.`);
    });

    listContainer.appendChild(card);
  });
}

// 초기화 시작
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupNoticeAnimation);
