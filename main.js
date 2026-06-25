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

// 기본 체크리스트 템플릿 생성 헬퍼 함수
function createDefaultChecklist(status) {
  const isPending = status === 'pending';
  // 기본 정량 점수 설정: 대기 상태는 0점, 적합 상태는 4-5점, 부적합 상태는 2-3점 분배
  const defaultScore = (id) => {
    if (isPending) return 0;
    if (status === 'fit') {
      return id === 'Q02' || id === 'Q08' ? 4 : 5; // 우수한 점수
    }
    // 부적합(unfit)의 경우 낮은 점수 섞음
    return id === 'Q03' || id === 'Q05' ? 2 : 4;
  };

  // 기본 정성 결과 설정: 대기 상태는 빈값, 적합은 모두 'fit', 부적합은 일부 'unfit'
  const defaultResult = (id) => {
    if (isPending) return '';
    if (status === 'fit') return 'fit';
    return id === 'QL01' ? 'unfit' : 'fit'; // 부적합 업체는 건강진단결과서 등을 부적합 처리
  };

  return [
    { id: "Q01", type: "quantitative", category: "개인위생", item: "작업자 위생모/위생복/위생화 착용 및 청결 상태", desc: "조리 및 배식 종사자의 개인 위생 복장 착용 규정 준수 여부", maxScore: 5, score: defaultScore("Q01") },
    { id: "Q02", type: "quantitative", category: "개인위생", item: "종사자 손 세척 및 소독 적정성", desc: "원료 취급 전, 화장실 사용 후 등 수시 손 세척/소독 준수 여부", maxScore: 5, score: defaultScore("Q02") },
    { id: "Q03", type: "quantitative", category: "원료관리", item: "원부재료 입고 검사 및 신선도 상태", desc: "입고 검사 기록 작성 및 유통기한 경과 여부 확인", maxScore: 5, score: defaultScore("Q03") },
    { id: "Q04", type: "quantitative", category: "원료관리", item: "식재료 보관 시 구분 보관 및 선입선출 이행", desc: "바닥 밀착 보관 금지, 농수축산물 및 가공품의 교차오염 방지 격리", maxScore: 5, score: defaultScore("Q04") },
    { id: "Q05", type: "quantitative", category: "보관온도", item: "냉장/냉동고 온도 준수 및 온도계 정상 작동 여부", desc: "냉장 10℃ 이하, 냉동 -18℃ 이하 온도 관리 준수 기록", maxScore: 5, score: defaultScore("Q05") },
    { id: "Q06", type: "quantitative", category: "공정관리", item: "교차오염 방지 조치 (도구 구분 사용)", desc: "칼, 도마, 식기 등의 용도별(육류/어류/채소류) 구분 사용 및 소독", maxScore: 5, score: defaultScore("Q06") },
    { id: "Q07", type: "quantitative", category: "공정관리", item: "해동 식재료의 위생적 처리 및 재냉동 금지", desc: "유수해동 또는 냉장해동 기준 준수 및 해동 후 즉시 사용 여부", maxScore: 5, score: defaultScore("Q07") },
    { id: "Q08", type: "quantitative", category: "환경위생", item: "작업장 세척/소독 상태 및 청결도", desc: "바닥, 벽, 배수구의 오물 제거 및 정기적인 소독제 소독 여부", maxScore: 5, score: defaultScore("Q08") },
    { id: "Q09", type: "quantitative", category: "환경위생", item: "폐기물 용기 관리 및 위생적 밀폐 여부", desc: "폐기물 용기 뚜껑 비치 및 주기적인 배출 관리 상태", maxScore: 5, score: defaultScore("Q09") },
    { id: "Q10", type: "quantitative", category: "표시사항", item: "원산지 및 알레르기 유발물질 정보 표시 적정성", desc: "고객 안내 메뉴판 또는 쇼케이스 내 법적 필수 표시사항 이행 여부", maxScore: 5, score: defaultScore("Q10") },
    { id: "QL01", type: "qualitative", category: "법적준수", item: "조리 종사자 건강진단결과서(보건증) 유효 여부", desc: "현장 근무자 전원의 보건증 소지 및 유효기간 만료 여부 확인 (법적 필수)", result: defaultResult("QL01") },
    { id: "QL02", type: "qualitative", category: "법적준수", item: "위생교육 수료증 보관 및 자체 위생교육 실시 기록", desc: "영업자 위생교육 및 매월 종사자 자체 교육 실시 기록 관리 여부", result: defaultResult("QL02") },
    { id: "QL03", type: "qualitative", category: "방제위생", item: "작업장 내 해충(쥐, 바퀴벌레 등) 흔적 및 방제 상태", desc: "전문 방제업체 정기 점검 여부 및 서식 흔적 발견 여부", result: defaultResult("QL03") },
    { id: "QL04", type: "qualitative", category: "설비안전", item: "정수 필터 교체 주기 준수 및 식수 적합 여부", desc: "제빙기 및 음용수 필터 최근 교체 일자 및 적합 판정 여부", result: defaultResult("QL04") }
  ];
}

const buyerMockData = [
  { id: 1, buyerId: 'BUYER_DEPT_01', storeName: '본점 (소공점)', name: '주식회사 푸드링크', date: '2026-06-24', div: '농산', biz: '제조가공업', vhr: 'VHR', express: true, status: 'fit', checklist: createDefaultChecklist('fit'), photo: '', comment: '위생 복장 상태 양호하며 선도 우수함.' },
  { id: 2, buyerId: 'BUYER_DEPT_02', storeName: '잠실점', name: '(주)대현수산', date: '2026-06-25', div: '수산', biz: '소분업', vhr: 'HR', express: false, status: 'pending', checklist: createDefaultChecklist('pending'), photo: '', comment: '' },
  { id: 3, buyerId: 'BUYER_DEPT_03', storeName: '강남점', name: '영양축산푸드', date: '2026-06-23', div: '축산', biz: '제조가공업', vhr: 'R', express: true, status: 'unfit', checklist: createDefaultChecklist('unfit'), photo: '', comment: '보건증 유효기간 만료 근무자 1명 발견 및 온도 준수 불량.' },
  { id: 4, buyerId: 'BUYER_DEPT_04', storeName: '영등포점', name: '롯데조리유통', date: '2026-06-18', div: '조리', biz: '유통업', vhr: 'VHR', express: false, status: 'fit', checklist: createDefaultChecklist('fit'), photo: '', comment: '식재료 선입선출 준수 및 도구 소독 철저.' },
  { id: 5, buyerId: 'BUYER_DEPT_05', storeName: '노원점', name: '삼성그로서리', date: '2026-06-20', div: '그로서리', biz: '수입원', vhr: 'HR', express: false, status: 'fit', checklist: createDefaultChecklist('fit'), photo: '', comment: '해외 수입제품 표시 기준 준수 양호.' },
  { id: 6, buyerId: 'BUYER_DEPT_06', storeName: '본점 (소공점)', name: '우리가공식품', date: '2026-06-15', div: '농산', biz: '제조가공업', vhr: 'R', express: true, status: 'fit', checklist: createDefaultChecklist('fit'), photo: '', comment: '작업장 세척상태 깔끔하고 정리정돈 양호.' },
  { id: 7, buyerId: 'BUYER_DEPT_07', storeName: '인천점', name: '바다사랑수산', date: '2026-06-28', div: '수산', biz: '제조가공업', vhr: 'VHR', express: false, status: 'unfit', checklist: createDefaultChecklist('unfit'), photo: '', comment: '조리 도구 구분 사용 미비로 인한 교차오염 우려 지적.' },
  { id: 8, buyerId: 'BUYER_DEPT_08', storeName: '김포공항점', name: '참조은축산', date: '2026-06-10', div: '축산', biz: '소분업', vhr: 'R', express: false, status: 'pending', checklist: createDefaultChecklist('pending'), photo: '', comment: '' },
  { id: 9, buyerId: 'BUYER_DEPT_09', storeName: '건대스타시티점', name: '조리나라', date: '2026-06-12', div: '조리', biz: '제조가공업', vhr: 'HR', express: true, status: 'fit', checklist: createDefaultChecklist('fit'), photo: '', comment: '조리 완료 식품 온도 유지 상태 훌륭함.' },
  { id: 10, buyerId: 'BUYER_DEPT_10', storeName: '미아점', name: '글로벌식품수입', date: '2026-06-05', div: '그로서리', biz: '수입원', vhr: 'VHR', express: false, status: 'pending', checklist: createDefaultChecklist('pending'), photo: '', comment: '' }
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

  // 상세 보기 화면 관련 DOM 요소
  const buyerDetailView = document.getElementById('buyer-detail-view');
  const btnBackToEvalList = document.getElementById('btnBackToEvalList');
  const btnDetailSaveDraft = document.getElementById('btnDetailSaveDraft');
  const btnDetailSubmitFinal = document.getElementById('btnDetailSubmitFinal');
  const detailImageInput = document.getElementById('detailImageInput');

  if (!btnBuyerMenu) return;

  // 메인 메뉴 클릭 시 Buyer 평가 화면으로 전환
  btnBuyerMenu.addEventListener('click', (e) => {
    e.stopPropagation(); // 기존 bindEvents의 가상 모듈 진입 토스트 실행 방지
    homeView.style.display = 'none';
    buyerEvalView.style.display = 'flex';
    buyerDetailView.style.display = 'none';
    
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

  // 상세 보기에서 목록으로 뒤로가기
  btnBackToEvalList.addEventListener('click', () => {
    buyerDetailView.style.display = 'none';
    buyerEvalView.style.display = 'flex';
    renderBuyerList(); // 상태 변동 시 목록 갱신
  });

  // 이미지 업로드 파일 변경 핸들러
  detailImageInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !activeDetailItem) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Img = event.target.result;
        if (!activeDetailItem.photos) {
          activeDetailItem.photos = [];
        }
        activeDetailItem.photos.push(base64Img);
        renderPhotoPreviews(activeDetailItem.photos);
      };
      reader.readAsDataURL(file);
    });
    // 인풋 리셋
    e.target.value = '';
  });

  // 임시 저장 처리
  btnDetailSaveDraft.addEventListener('click', () => {
    if (!activeDetailItem) return;
    
    // 특이사항 코멘트 보존
    activeDetailItem.comment = document.getElementById('detailCommentInput').value;
    
    showToast('평가 내용이 임시 저장되었습니다.');
  });

  // 최종 제출 완료 처리
  btnDetailSubmitFinal.addEventListener('click', () => {
    if (!activeDetailItem) return;

    // 특이사항 코멘트 최종 저장
    activeDetailItem.comment = document.getElementById('detailCommentInput').value;

    // 종합 점수와 등급 계산 정보 획득
    const { totalScore, grade } = calculateScoreAndGrade(activeDetailItem.checklist);

    // 최종 데이터 제출 처리 (콘솔 로깅 명세 준수)
    const submitData = {
      buyerId: activeDetailItem.buyerId,
      storeName: activeDetailItem.storeName,
      companyId: activeDetailItem.id,
      companyName: activeDetailItem.name,
      division: activeDetailItem.div,
      businessType: activeDetailItem.biz,
      vhrType: activeDetailItem.vhr,
      assessmentDate: new Date().toISOString().split('T')[0],
      isExpress: activeDetailItem.express,
      totalScore: totalScore,
      grade: grade,
      checklist: activeDetailItem.checklist,
      comment: activeDetailItem.comment,
      photoCount: activeDetailItem.photos ? activeDetailItem.photos.length : 0
    };

    console.log('--- [롯데백화점 상품 안전성 최종 평가 제출 데이터] ---');
    console.log(JSON.stringify(submitData, null, 2));

    // 업체 목록 상의 상태를 '대기'에서 완료 결과에 따른 '적합/부적합'으로 갱신
    // 위생 법적 리스크(부적합 요인)가 있거나 총점이 80점 미만이면 부적합(unfit), 그 외 적합(fit) 판정
    const hasUnfitQualitative = activeDetailItem.checklist.some(c => c.type === 'qualitative' && c.result === 'unfit');
    if (totalScore >= 80 && !hasUnfitQualitative) {
      activeDetailItem.status = 'fit';
    } else {
      activeDetailItem.status = 'unfit';
    }

    showToast('최종 평가서 제출이 완료되었습니다.');

    // 화면 복귀 및 목록 리프레시
    setTimeout(() => {
      buyerDetailView.style.display = 'none';
      buyerEvalView.style.display = 'flex';
      renderBuyerList();
    }, 500);
  });
}

// 현재 활성화되어 점검 중인 업체 객체 홀더
let activeDetailItem = null;

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

    // 카드 개별 클릭 이벤트: 상세 보기로 진입
    card.addEventListener('click', () => {
      openBuyerDetail(item);
    });

    listContainer.appendChild(card);
  });
}

// 17. 상세 평가 뷰 열기 및 화면 그리기
function openBuyerDetail(item) {
  activeDetailItem = item;
  
  // 뷰 스위칭
  document.getElementById('buyer-eval-view').style.display = 'none';
  document.getElementById('buyer-detail-view').style.display = 'flex';

  // 상단 업체 정보 배너 렌더링
  document.getElementById('detail-company-name').textContent = item.name;
  document.getElementById('detail-vhr-type').textContent = item.vhr;
  document.getElementById('detail-div').textContent = item.div;
  document.getElementById('detail-biz').textContent = item.biz;
  document.getElementById('detail-store-name').textContent = item.storeName;
  document.getElementById('detail-buyer-id').textContent = item.buyerId;

  // 특이사항 의견 기기입값 바인딩
  document.getElementById('detailCommentInput').value = item.comment || '';

  // 사진 첨부 목록 렌더링
  if (!item.photos) item.photos = [];
  renderPhotoPreviews(item.photos);

  // 체크리스트 문항 분류 및 렌더링
  renderChecklistQuestions(item.checklist);

  // 실시간 합계 점수/등급 초기 렌더링
  updateRealtimeDisplay(item.checklist);
}

// 18. 체크리스트 문항 그리기
function renderChecklistQuestions(checklist) {
  const quantContainer = document.getElementById('quantitativeList');
  const qualContainer = document.getElementById('qualitativeList');

  quantContainer.innerHTML = '';
  qualContainer.innerHTML = '';

  let quantIndex = 1;
  let qualIndex = 1;

  checklist.forEach(question => {
    const card = document.createElement('div');
    card.className = 'inspect-card';

    if (question.type === 'quantitative') {
      // 정량 문항 렌더링 (0~5점 라디오 세그먼트)
      card.innerHTML = `
        <div class="inspect-card-header">
          <span class="item-num">정량 문항 ${quantIndex++}</span>
          <h5 class="item-title">${question.item}</h5>
          <p class="item-desc">${question.desc}</p>
        </div>
        <div class="segment-control" data-qid="${question.id}">
          ${[0, 1, 2, 3, 4, 5].map(score => {
            const isActive = question.score === score ? 'active' : '';
            return `<button class="segment-btn ${isActive}" data-score="${score}">${score}</button>`;
          }).join('')}
        </div>
      `;

      // 점수 버튼 이벤트 바인딩
      card.querySelectorAll('.segment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const score = parseInt(e.target.getAttribute('data-score'));
          question.score = score;

          // 비주얼 클래스 토글
          card.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');

          // 실시간 점수 판정 업데이트
          updateRealtimeDisplay(checklist);
        });
      });

      quantContainer.appendChild(card);
    } else if (question.type === 'qualitative') {
      // 정성 문항 렌더링 (적합/부적합 2단 세그먼트)
      const isFitActive = question.result === 'fit' ? 'active' : '';
      const isUnfitActive = question.result === 'unfit' ? 'active' : '';

      card.innerHTML = `
        <div class="inspect-card-header">
          <span class="item-num">정성 문항 ${qualIndex++}</span>
          <h5 class="item-title">${question.item}</h5>
          <p class="item-desc">${question.desc}</p>
        </div>
        <div class="binary-control" data-qid="${question.id}">
          <button class="binary-btn btn-fit ${isFitActive}" data-result="fit">
            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            적합
          </button>
          <button class="binary-btn btn-unfit ${isUnfitActive}" data-result="unfit">
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            부적합
          </button>
        </div>
      `;

      // 적합/부적합 버튼 이벤트 바인딩
      card.querySelectorAll('.binary-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const resultBtn = e.target.closest('.binary-btn');
          const result = resultBtn.getAttribute('data-result');
          question.result = result;

          // 비주얼 클래스 토글
          card.querySelectorAll('.binary-btn').forEach(b => b.classList.remove('active'));
          resultBtn.classList.add('active');

          // 실시간 점수 판정 업데이트
          updateRealtimeDisplay(checklist);
        });
      });

      qualContainer.appendChild(card);
    }
  });
}

// 19. 점수 및 등급 계산 알고리즘
function calculateScoreAndGrade(checklist) {
  // 1) 정량 점수 합산 (10문항 * 5점 만점 = 50점 만점)
  const quantitativeItems = checklist.filter(c => c.type === 'quantitative');
  const sumScore = quantitativeItems.reduce((acc, cur) => acc + (cur.score || 0), 0);
  
  // 100점 만점 기준으로 백분율 스케일 업 (합계 * 2)
  const totalScore = sumScore * 2;

  // 2) 정성 점수 분석 (부적합 항목 개수 산출)
  const qualitativeItems = checklist.filter(c => c.type === 'qualitative');
  const unfitCount = qualitativeItems.filter(c => c.result === 'unfit').length;

  // 3) 등급 판단
  let grade = 'C등급';
  let gradeClass = 'grade-c';

  if (totalScore >= 95 && unfitCount === 0) {
    grade = 'S등급';
    gradeClass = 'grade-s';
  } else if (totalScore >= 85 && unfitCount === 0) {
    grade = 'A등급';
    gradeClass = 'grade-a';
  } else if (totalScore >= 70 && unfitCount <= 1) {
    grade = 'B등급';
    gradeClass = 'grade-b';
  } else {
    grade = 'C등급';
    gradeClass = 'grade-c';
  }

  return { totalScore, grade, gradeClass };
}

// 20. 실시간 화면 점수/등급 컴포넌트 렌더링
function updateRealtimeDisplay(checklist) {
  const { totalScore, grade, gradeClass } = calculateScoreAndGrade(checklist);

  const scoreEl = document.getElementById('realtime-total-score');
  const gradeEl = document.getElementById('realtime-total-grade');

  scoreEl.textContent = totalScore;
  gradeEl.textContent = grade;
  
  // 모든 이전 등급 클래스 제거 후 해당 클래스 추가
  gradeEl.className = 'val-grade';
  gradeEl.classList.add(gradeClass);
}

// 21. 사진 첨부 미리보기 영역 렌더링
function renderPhotoPreviews(photos) {
  const previewGrid = document.getElementById('uploadPreviewGrid');
  if (!previewGrid) return;

  previewGrid.innerHTML = '';

  photos.forEach((src, index) => {
    const thumb = document.createElement('div');
    thumb.className = 'preview-thumb';
    thumb.innerHTML = `
      <img src="${src}" alt="현장 사진 미리보기">
      <button class="btn-del-thumb" data-index="${index}">&times;</button>
    `;

    // 사진 삭제 이벤트 바인딩
    thumb.querySelector('.btn-del-thumb').addEventListener('click', (e) => {
      e.stopPropagation();
      photos.splice(index, 1);
      renderPhotoPreviews(photos);
    });

    previewGrid.appendChild(thumb);
  });
}

// 초기화 시작
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupNoticeAnimation);

