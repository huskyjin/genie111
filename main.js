/* ==========================================
   Hi-Genie 프로토타입 인터랙션 스크립트 (main.js - 경량화 껍데기 버전)
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
  'lotte-dept': { lastYear: 95, thisYear: 95, thisMonth: 94 },
  'lotte-mart': { lastYear: 92, thisYear: 94, thisMonth: 95 },
  'lotte-super': { lastYear: 90, thisYear: 91, thisMonth: 89 },
  'lotte-outlets': { lastYear: 93, thisYear: 93, thisMonth: 93 }
};

// 3. 상태 관리 변수
let currentLang = 'ko';
let pendingApprovalCount = 2;
let currentBuyerId = 'BUYER_DEPT_01'; // 가상 바이어 ID

// DOM 요소 셀렉터
const dom = {
  selectAffiliate: document.getElementById('selectAffiliate'),
  btnLanguage: document.getElementById('btnLanguage'),
  langDropdown: document.getElementById('langDropdown'),
  flagKor: document.getElementById('flag-kor'),
  langLabel: document.getElementById('lang-label'),
  txtUserRole: document.getElementById('txt-user-role'),
  txtUserDept: document.getElementById('txt-user-dept'),
  txtShopReg: document.getElementById('txt-shop-reg'),
  txtMenuBuyer: document.getElementById('txt-menu-buyer'),
  txtMenuFactory: document.getElementById('txt-menu-factory'),
  txtMenuInfo: document.getElementById('txt-menu-info'),
  txtMenuTicket: document.getElementById('txt-menu-ticket'),
  lblAverages: document.querySelectorAll('.lbl-average'),
  txtSuffix: document.getElementById('txt-suffix'),
  valLastYear: document.getElementById('val-last-year'),
  valThisYear: document.getElementById('val-this-year'),
  valThisMonth: document.getElementById('val-this-month'),
  fillLastYear: document.querySelector('.bar-fill.last-year'),
  fillThisYear: document.querySelector('.bar-fill.this-year'),
  fillThisMonth: document.querySelector('.bar-fill.this-month'),
  btnNoti: document.getElementById('btnNoti'),
  notiDot: document.querySelector('.noti-dot'),
  btnNotice: document.getElementById('btnNotice'),
  noticeTrack: document.getElementById('notice-track'),
  toast: document.getElementById('toast'),
  btnApproval: document.getElementById('btnApproval'),
  approvalCount: document.getElementById('approval-count'),
  sidebarApprovalCount: document.getElementById('sidebar-approval-count'),
  approvalModal: document.getElementById('approvalModal'),
  btnCloseModal: document.getElementById('btnCloseModal'),
  modalEmptyText: document.getElementById('modal-empty-text'),
  approvalList: document.getElementById('approval-list'),
};

// 가상 데이터베이스 (유저 플로우 구동에 필요한 최소 데이터)
const buyerMockData = [
  { id: 1, buyerId: 'BUYER_DEPT_01', storeName: '본점 (소공점)', name: '주식회사 푸드링크', date: '2026-06-24', div: '농산', biz: '제조가공업', vhr: 'VHR', express: true, status: 'fit', comment: '위생 복장 상태 양호하며 선도 우수함.' },
  { id: 2, buyerId: 'BUYER_DEPT_01', storeName: '잠실점', name: '(주)대현수산', date: '2026-06-25', div: '수산', biz: '소분업', vhr: 'HR', express: false, status: 'pending', comment: '' },
  { id: 3, buyerId: 'BUYER_DEPT_01', storeName: '강남점', name: '영양축산푸드', date: '2026-06-23', div: '축산', biz: '제조가공업', vhr: 'R', express: true, status: 'unfit', comment: '보건증 만료 및 온도 관리 준수 지적.' },
  { id: 4, buyerId: 'BUYER_DEPT_01', storeName: '영등포점', name: '롯데조리유통', date: '2026-06-18', div: '조리', biz: '유통업', vhr: 'VHR', express: false, status: 'fit', comment: '식재료 선입선출 준수 및 도구 소독 철저.' },
  { id: 5, buyerId: 'BUYER_DEPT_01', storeName: '노원점', name: '삼성그로서리', date: '2026-06-20', div: '그로서리', biz: '수입원', vhr: 'HR', express: false, status: 'fit', comment: '해외 수입제품 표시 기준 준수 양호.' },
  { id: 6, buyerId: 'BUYER_DEPT_01', storeName: '인천점', name: '바다사랑수산', date: '2026-06-28', div: '수산', biz: '제조가공업', vhr: 'VHR', express: false, status: 'unfit', comment: '조리 도구 구분 사용 미비로 인한 교차오염 우려 지적.' }
];

const mfrMockData = [
  { id: 1, buyerId: 'BUYER_DEPT_01', type: 'OEM', name: '우리가공식품', div: '농산', biz: '제조가공업', vhr: 'R', owner: '김제조', licenseNo: '123-45-67890', regDate: '2026-06-15', inspector: '김바이어', status: 'pending', partner: '주식회사 푸드링크', recheck: true },
  { id: 2, buyerId: 'BUYER_DEPT_01', type: 'GENERAL', name: '삼양푸드스퀘어', div: '수산', biz: '소분업', vhr: 'HR', owner: '김철수', licenseNo: '104-12-56789', regDate: '2026-06-20', inspector: '박바이어', status: 'completed', partner: '', recheck: false },
  { id: 3, buyerId: 'BUYER_DEPT_01', type: 'OEM', name: '한양축산푸드', div: '축산', biz: '제조가공업', vhr: 'VHR', owner: '이우성', licenseNo: '112-34-56789', regDate: '2026-06-21', inspector: '최바이어', status: 'pending', partner: '롯데조리유통', recheck: true },
  { id: 4, buyerId: 'BUYER_DEPT_01', type: 'GENERAL', name: '신선원 그로서리', div: '그로서리', biz: '유통업', vhr: 'R', owner: '오영수', licenseNo: '135-24-68102', regDate: '2026-06-22', inspector: '이바이어', status: 'completed', partner: '', recheck: false },
  { id: 5, buyerId: 'BUYER_DEPT_01', type: 'OEM', name: '태평양수산가공', div: '수산', biz: '제조가공업', vhr: 'HR', owner: '정해인', licenseNo: '109-88-77665', regDate: '2026-06-23', inspector: '강바이어', status: 'completed', partner: '(주)대현수산', recheck: false },
  { id: 6, buyerId: 'BUYER_DEPT_01', type: 'GENERAL', name: '웰빙유기농식품', div: '농산', biz: '수입원', vhr: 'R', owner: '강호동', licenseNo: '101-02-03040', regDate: '2026-06-25', inspector: '송바이어', status: 'pending', partner: '', recheck: true }
];

const companyMasterList = [
  { id: 1, name: '주식회사 푸드링크', owner: '홍길동', licenseNo: '120-01-12345', address: '서울시 중구 소공동', div: '농산', biz: '제조가공업', vhr: 'VHR' },
  { id: 2, name: '삼양푸드스퀘어', owner: '김철수', licenseNo: '104-12-56789', address: '서울시 강남구 역삼동', div: '수산', biz: '소분업', vhr: 'HR' }
];

let activeBuyerItem = null;
let activeMfrItem = null;
let currentSearchType = 'buyer';
let isNameChecked = false;
let isLicenseChecked = false;
let isBuyerDetailReadOnly = false;
let buyerActiveTab = 'all';
let tempEvalAnswers = {
  'C01': { result: '', memo: '', photos: [], files: [] },
  'C02': { result: '', memo: '', photos: [], files: [] },
  'C03': { result: '', memo: '', photos: [], files: [] }
};
let tempSelectedCompanyForEval = null;
let evalRegGeneralPhotos = [];

function renderRegisterChecklistQuestions() {
  const container = document.getElementById('evalRegChecklistQuestions');
  if (!container) return;
  container.innerHTML = '';

  const dummyQuestions = [
    { id: 'C01', item: '작업자 위생모/위생복/위생화 착용 및 청결 상태', desc: '위생 복장 착용 규정 준수 여부', help: '종사자의 위생 장구(위생모 머리카락 포함, 위생복 청결, 전용 위생화 등)의 착용 및 세척 살균 상태 규정을 완벽히 충족하는지 검사합니다.' },
    { id: 'C02', item: '종사자 손 세척 및 소독 적정성', desc: '원료 취급 전 손 세척/소독 준수 여부', help: '작업장 진입 전 또는 오염 물질 취급 후, 전용 소독조 및 손 세척 전용 비누/소독기를 활용해 정상적으로 세척 및 멸균 공정을 이행하는지 점검합니다.' },
    { id: 'C03', item: '원부재료 입고 검사 및 신선도 상태', desc: '입고 유통기한 경과 여부 확인', help: '입고되는 원부자재의 냉장/냉동 적정 차량 운송 여부, 기한 만료품 입고 통제 상태, 성적서 유무 및 선도 상태를 종합 판정합니다.' }
  ];

  dummyQuestions.forEach((q, idx) => {
    const card = document.createElement('div');
    card.className = 'inspect-card';

    const data = tempEvalAnswers[q.id] || { result: '', memo: '', photos: [], files: [] };
    const isFitActive = data.result === 'fit' ? 'active' : '';
    const isUnfitActive = data.result === 'unfit' ? 'active' : '';
    const isAccordionOpen = data.result !== '';

    card.innerHTML = `
      <div class="inspect-card-header" style="position: relative;">
        <span class="item-num">점검 항목 ${idx + 1}</span>
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
          <h5 class="item-title" style="margin: 0;">${q.item}</h5>
          <button class="btn-help-guide btn-help-tooltip" data-qid="${q.id}" style="background: #e2e8f0; border: none; width: 16px; height: 16px; border-radius: 50%; cursor: pointer; color: #475569; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; font-family: sans-serif; transition: all 0.2s;" title="도움말 확인">?</button>
        </div>
        <p class="item-desc" style="margin-top: 4px;">${q.desc}</p>
      </div>

      <div class="binary-control" data-qid="${q.id}">
        <button type="button" class="binary-btn btn-fit ${isFitActive}" data-result="fit" style="outline: none;">적합</button>
        <button type="button" class="binary-btn btn-unfit ${isUnfitActive}" data-result="unfit" style="outline: none;">부적합</button>
      </div>

      <!-- 상세 입력 영역 (동적 아코디언 UI) -->
      <div id="accordion-${q.id}" class="inspect-card-extra" style="display: ${isAccordionOpen ? 'flex' : 'none'}; flex-direction: column; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e2e8f0; width: 100%; box-sizing: border-box;">
        
        <!-- 파일/사진 첨부 버튼 그룹 -->
        <div style="display: flex; align-items: center; justify-content: flex-start; flex-wrap: wrap; gap: 8px;">
          <!-- 사진 촬영 버튼 -->
          <button type="button" class="btn-item-photo btn-eval-add-photo" data-qid="${q.id}" style="height: 30px; padding: 0 10px; font-size: 12px; font-weight: 600; color: #475569; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s; outline: none;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 12px; height: 12px;">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            사진 추가
          </button>
          <input type="file" id="file-photo-${q.id}" accept="image/*" style="display: none;">

          <!-- 개선조치 파일 첨부 버튼 -->
          <button type="button" class="btn-item-photo btn-eval-add-file" data-qid="${q.id}" style="height: 30px; padding: 0 10px; font-size: 12px; font-weight: 600; color: #475569; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s; outline: none;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 12px; height: 12px;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            파일 첨부
          </button>
          <input type="file" id="file-doc-${q.id}" accept=".pdf,.doc,.docx,.xls,.xlsx,.zip" style="display: none;">
          
          <span class="item-photo-guide" style="font-size: 11px; color: #94a3b8; font-weight: 500;">* JPG, PNG, PDF (최대 5MB)</span>
        </div>

        <!-- 실시간 업로드 증빙 미리보기 그리드 -->
        <div id="preview-grid-${q.id}" class="item-photo-grid" style="display: ${ (data.photos.length > 0 || data.files.length > 0) ? 'flex' : 'none' }; gap: 8px; flex-wrap: wrap; margin-top: 4px; width: 100%;">
          <!-- 파일/사진 미리보기 칩 렌더링 -->
        </div>

        <!-- 상세 텍스트 입력 -->
        <div style="display: flex; flex-direction: column; gap: 4px; width: 100%; margin-top: 4px;">
          <textarea class="eval-memo-input item-memo-input input-form" data-qid="${q.id}" placeholder="상세 내용 및 항목별 메모 입력" style="height: 48px; padding: 6px 10px; font-size: 12.5px; border-radius: 6px; border: 1px solid #cbd5e1; resize: none; width: 100%; box-sizing: border-box; outline: none;">${data.memo}</textarea>
        </div>

      </div>
    `;

    // ? 도움말 버튼 클릭 시 중앙 팝업 생성
    card.querySelector('.btn-help-tooltip').addEventListener('click', (e) => {
      e.stopPropagation();
      openHelpPopup(q.item, q.help);
    });

    // 적합/부적합 클릭 시 아코디언 슬라이드
    card.querySelectorAll('.binary-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        card.querySelectorAll('.binary-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const qid = q.id;
        const val = e.target.getAttribute('data-result');
        
        tempEvalAnswers[qid].result = val;

        // 아코디언 부드럽게 보이기
        const accordion = card.querySelector(`#accordion-${qid}`);
        if (accordion) {
          accordion.style.display = 'flex';
        }
      });
    });

    // 텍스트 실시간 저장
    card.querySelector('.eval-memo-input').addEventListener('input', (e) => {
      const qid = e.target.getAttribute('data-qid');
      tempEvalAnswers[qid].memo = e.target.value;
    });

    // 가상 사진 추가 트리거
    const btnPhoto = card.querySelector('.btn-eval-add-photo');
    const inputPhoto = card.querySelector(`#file-photo-${q.id}`);
    btnPhoto.addEventListener('click', () => inputPhoto.click());
    inputPhoto.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        tempEvalAnswers[q.id].photos.push(file.name);
        showToast(`사진 "${file.name}"이 임시 첨부되었습니다.`);
        renderFilePreviews(q.id);
      }
    });

    // 가상 파일 첨부 트리거
    const btnFile = card.querySelector('.btn-eval-add-file');
    const inputDoc = card.querySelector(`#file-doc-${q.id}`);
    btnFile.addEventListener('click', () => inputDoc.click());
    inputDoc.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        tempEvalAnswers[q.id].files.push(file.name);
        showToast(`문서 "${file.name}"이 임시 첨부되었습니다.`);
        renderFilePreviews(q.id);
      }
    });

    container.appendChild(card);
    renderFilePreviews(q.id); // 혹시 기존 데이터가 있으면 미리보기 로드
  });
}

function openHelpPopup(title, content) {
  const exist = document.getElementById('evalHelpPopupModal');
  if (exist) exist.remove();

  const modal = document.createElement('div');
  modal.id = 'evalHelpPopupModal';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 15000; display: flex; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box; transition: all 0.25s; opacity: 0;';
  
  modal.innerHTML = `
    <div style="background: #ffffff; border-radius: 20px; width: 100%; max-width: 360px; padding: 20px; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2); display: flex; flex-direction: column; gap: 12px; transform: scale(0.9); transition: all 0.25s;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
        <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #0f172a;">점검 상세 기준 도움말</h4>
        <button type="button" class="btn-close-help" style="background: none; border: none; font-size: 20px; line-height: 1; cursor: pointer; color: #94a3b8; outline: none; padding: 0;">&times;</button>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <strong style="font-size: 13.5px; color: #0f172a; font-weight: 800; line-height: 1.4;">${title}</strong>
        <p style="margin: 0; font-size: 12.5px; color: #475569; line-height: 1.5; font-weight: 500; text-align: justify; white-space: normal; word-break: keep-all;">${content}</p>
      </div>
      <button type="button" class="btn-close-help" style="width: 100%; height: 40px; background: #0f172a; color: #ffffff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; margin-top: 6px; outline: none;">닫기</button>
    </div>
  `;

  document.body.appendChild(modal);
  
  setTimeout(() => {
    modal.style.opacity = '1';
    modal.querySelector('div').style.transform = 'scale(1)';
  }, 10);

  modal.querySelectorAll('.btn-close-help').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.style.opacity = '0';
      modal.querySelector('div').style.transform = 'scale(0.9)';
      setTimeout(() => modal.remove(), 250);
    });
  });
}

function renderFilePreviews(qid) {
  const grid = document.getElementById(`preview-grid-${qid}`);
  if (!grid) return;
  grid.innerHTML = '';

  const data = tempEvalAnswers[qid] || { result: '', memo: '', photos: [], files: [] };
  const allItems = [...data.photos.map(p => ({ name: p, isPhoto: true })), ...data.files.map(f => ({ name: f, isPhoto: false }))];

  if (allItems.length === 0) {
    grid.style.display = 'none';
    return;
  }

  grid.style.display = 'flex';
  allItems.forEach((item, idx) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'item-thumb-wrapper';
    wrapper.style.cssText = 'position: relative; width: 70px; height: 70px; border-radius: 8px; overflow: hidden; border: 1px solid #cbd5e1; margin-right: 4px;';

    const imgSrc = item.isPhoto 
      ? 'https://picsum.photos/id/20/150/150' 
      : 'https://cdn-icons-png.flaticon.com/512/281/281760.png';

    wrapper.innerHTML = `
      <img src="${imgSrc}" alt="${item.name}" class="clickable-item-thumb" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" title="${item.name}">
      <button type="button" class="btn-del-item-thumb btn-del-file" style="position: absolute; top: 4px; right: 4px; width: 18px; height: 18px; border-radius: 50%; background: rgba(15, 23, 42, 0.75); border: none; color: #ffffff; font-size: 11px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 5;">&times;</button>
    `;

    wrapper.querySelector('.btn-del-file').addEventListener('click', () => {
      if (item.isPhoto) {
        data.photos = data.photos.filter(p => p !== item.name);
      } else {
        data.files = data.files.filter(f => f !== item.name);
      }
      renderFilePreviews(qid);
    });

    grid.appendChild(wrapper);
  });
}

// 초기화 함수
function init() {
  updateApprovalBadge();
  setupNoticeAnimation();
  bindEvents();
  initBuyerEval();
  initMfrEval();
  initMasterSearch();
  initEvalMasterSearch();
}

// 공통 이벤트 및 다국어, 알림 처리
function bindEvents() {
  if (dom.selectAffiliate) {
    dom.selectAffiliate.addEventListener('change', (e) => updateChartData(e.target.value));
  }
  if (dom.btnLanguage) {
    dom.btnLanguage.addEventListener('click', (e) => {
      e.stopPropagation();
      dom.langDropdown.classList.toggle('show');
    });
  }
  document.addEventListener('click', () => dom.langDropdown?.classList.remove('show'));
  
  dom.langDropdown?.addEventListener('click', (e) => {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;
    dom.langDropdown.querySelectorAll('.dropdown-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');
    changeLanguage(item.getAttribute('data-lang'));
  });

  dom.btnNoti?.addEventListener('click', () => {
    showToast(translations[currentLang].toastNoNoti);
    if (dom.notiDot) dom.notiDot.style.display = 'none';
  });

  setTimeout(() => {
    if (dom.notiDot) dom.notiDot.style.display = 'block';
  }, 3000);

  dom.btnApproval?.addEventListener('click', () => dom.approvalModal?.classList.add('show'));
  dom.btnCloseModal?.addEventListener('click', () => dom.approvalModal?.classList.remove('show'));
  
  dom.approvalModal?.addEventListener('click', (e) => {
    if (e.target === dom.approvalModal) dom.approvalModal.classList.remove('show');
  });

  dom.approvalList?.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-action-approve');
    if (!btn) return;
    const item = btn.closest('.approval-item');
    item.style.transition = 'all 0.3s ease-out';
    item.style.opacity = '0';
    item.style.transform = 'translateX(50px)';
    setTimeout(() => {
      item.remove();
      pendingApprovalCount--;
      updateApprovalBadge();
      showToast(translations[currentLang].toastApproved);
      if (pendingApprovalCount <= 0) {
        dom.approvalList.style.display = 'none';
        if (dom.modalEmptyText) {
          dom.modalEmptyText.style.display = 'block';
          dom.modalEmptyText.textContent = translations[currentLang].modalEmpty;
        }
      }
    }, 300);
  });

  dom.btnNotice?.addEventListener('click', () => {
    showToast(`${translations[currentLang].noticeTag} 공지사항 상세 화면으로 이동합니다.`);
  });
}

// 차트 갱신 로직
function updateChartData(affiliateKey) {
  const data = affiliateData[affiliateKey];
  if (!data) return;
  [dom.valLastYear, dom.valThisYear, dom.valThisMonth].forEach(el => {
    if (el) el.style.opacity = '0';
  });
  setTimeout(() => {
    if (dom.valLastYear) dom.valLastYear.textContent = data.lastYear;
    if (dom.valThisYear) dom.valThisYear.textContent = data.thisYear;
    if (dom.valThisMonth) dom.valThisMonth.textContent = data.thisMonth;
    [dom.valLastYear, dom.valThisYear, dom.valThisMonth].forEach(el => {
      if (el) el.style.opacity = '1';
    });
  }, 200);

  if (dom.fillLastYear) resetAndAnimateBar(dom.fillLastYear, `${data.lastYear}%`);
  if (dom.fillThisYear) resetAndAnimateBar(dom.fillThisYear, `${data.thisYear}%`);
  if (dom.fillThisMonth) resetAndAnimateBar(dom.fillThisMonth, `${data.thisMonth}%`);
}

function resetAndAnimateBar(barElement, targetHeight) {
  barElement.style.animation = 'none';
  barElement.offsetHeight;
  barElement.style.setProperty('--target-height', targetHeight);
  barElement.style.animation = 'riseUp 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
}

// 다국어 번역
function changeLanguage(lang) {
  currentLang = lang;
  const trans = translations[lang];
  if (dom.flagKor) dom.flagKor.textContent = lang === 'ko' ? '🇰🇷' : '🇺🇸';
  if (dom.langLabel) dom.langLabel.textContent = lang === 'ko' ? 'Korean' : 'English';
  if (dom.txtUserRole) dom.txtUserRole.textContent = trans.userRole;
  if (dom.txtUserDept) dom.txtUserDept.textContent = trans.userDept;
  if (dom.txtShopReg) dom.txtShopReg.textContent = trans.shopReg;
  if (dom.txtMenuBuyer) dom.txtMenuBuyer.textContent = trans.menuBuyer;
  if (dom.txtMenuFactory) dom.txtMenuFactory.textContent = trans.menuFactory;
  if (dom.txtMenuInfo) dom.txtMenuInfo.textContent = trans.menuInfo;
  if (dom.txtMenuTicket) dom.txtMenuTicket.textContent = trans.menuTicket;
  if (dom.txtSuffix) dom.txtSuffix.textContent = trans.suffix;
  dom.lblAverages?.forEach(el => el.textContent = trans.average);
  if (dom.noticeTrack) {
    dom.noticeTrack.innerHTML = `<span class="notice-tag">${trans.noticeTag}</span> <span class="notice-text">${trans.noticeText}</span>`;
  }
  if (dom.modalEmptyText) dom.modalEmptyText.textContent = trans.modalEmpty;
  setupNoticeAnimation();
}

// 결재 배지 제어
function updateApprovalBadge() {
  if (dom.approvalCount) dom.approvalCount.textContent = pendingApprovalCount;
  if (dom.sidebarApprovalCount) dom.sidebarApprovalCount.textContent = `${pendingApprovalCount}건`;
  if (pendingApprovalCount <= 0) {
    if (dom.approvalCount) dom.approvalCount.style.display = 'none';
    if (dom.sidebarApprovalCount) {
      dom.sidebarApprovalCount.className = 'value text-green';
      dom.sidebarApprovalCount.textContent = translations[currentLang].modalEmpty.includes('reports') ? 'Clean' : '완료';
    }
  } else {
    if (dom.approvalCount) dom.approvalCount.style.display = 'flex';
  }
}

// 공지 애니메이션
let noticeAnimFrame = null;
function setupNoticeAnimation() {
  if (noticeAnimFrame) cancelAnimationFrame(noticeAnimFrame);
  const container = dom.btnNotice?.querySelector('.notice-container');
  if (!container || !dom.noticeTrack) return;
  const containerWidth = container.offsetWidth;
  const trackWidth = dom.noticeTrack.offsetWidth;
  if (trackWidth > containerWidth) {
    let position = containerWidth;
    const scroll = () => {
      position -= 0.8;
      if (position < -trackWidth) position = containerWidth;
      dom.noticeTrack.style.transform = `translateX(${position}px)`;
      noticeAnimFrame = requestAnimationFrame(scroll);
    };
    scroll();
  } else {
    dom.noticeTrack.style.transform = 'translateX(0)';
  }
}

// 토스트 메시지
let toastTimeout = null;
function showToast(message) {
  if (!dom.toast) return;
  dom.toast.textContent = message;
  dom.toast.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => dom.toast.classList.remove('show'), 2500);
}

// ==========================================
// Buyer 평가 모듈 (껍데기 인터랙션)
// ==========================================
function initBuyerEval() {
  const btnBuyerMenu = document.getElementById('menu_buyer');
  const btnBackToHome = document.getElementById('btnBackToHome');
  const homeView = document.getElementById('home-view');
  const buyerEvalView = document.getElementById('buyer-eval-view');
  const buyerDetailView = document.getElementById('buyer-detail-view');
  const btnBackToEvalList = document.getElementById('btnBackToEvalList');
  const btnOpenFilter = document.getElementById('btnOpenFilter');
  const btnCloseFilter = document.getElementById('btnCloseFilter');
  const filterOverlay = document.getElementById('buyerFilterOverlay');
  const btnDetailSaveDraft = document.getElementById('btnDetailSaveDraft');
  const btnDetailSubmitFinal = document.getElementById('btnDetailSubmitFinal');
  const detailImageInput = document.getElementById('detailImageInput');

  const btnTabEval = document.getElementById('btn-tab-eval');
  const btnTabCompany = document.getElementById('btn-tab-company');
  const tabContentEval = document.getElementById('tab-content-eval');
  const tabContentCompany = document.getElementById('tab-content-company');

  btnBuyerMenu?.addEventListener('click', () => {
    if (homeView) homeView.style.display = 'none';
    if (buyerEvalView) buyerEvalView.style.display = 'flex';
    if (buyerDetailView) buyerDetailView.style.display = 'none';
    
    // 탭 상태 초기화 (디폴트: 평가 관리)
    btnTabEval?.classList.add('active');
    btnTabCompany?.classList.remove('active');
    if (tabContentEval) tabContentEval.style.display = 'block';
    if (tabContentCompany) tabContentCompany.style.display = 'none';
    
    // 신규 등록 플러스(+) 버튼 노출
    const btnHeaderAdd = document.getElementById('btnHeaderAdd');
    if (btnHeaderAdd) btnHeaderAdd.style.display = 'flex';

    renderBuyerList(); // 평가 관리 탭에는 기존 바이어 평가 결과 리스트 렌더링
  });

  btnTabEval?.addEventListener('click', () => {
    btnTabEval.classList.add('active');
    btnTabCompany?.classList.remove('active');
    if (tabContentEval) tabContentEval.style.display = 'block';
    if (tabContentCompany) tabContentCompany.style.display = 'none';
    
    // 신규 등록 플러스(+) 버튼 노출
    const btnHeaderAdd = document.getElementById('btnHeaderAdd');
    if (btnHeaderAdd) btnHeaderAdd.style.display = 'flex';

    renderBuyerList(); // 평가 관리 탭에는 기존 바이어 평가 결과 리스트 렌더링
  });

  btnTabCompany?.addEventListener('click', () => {
    btnTabCompany.classList.add('active');
    btnTabEval?.classList.remove('active');
    if (tabContentEval) tabContentEval.style.display = 'none';
    if (tabContentCompany) tabContentCompany.style.display = 'block';
    
    // 신규 등록 플러스(+) 버튼 노출
    const btnHeaderAdd = document.getElementById('btnHeaderAdd');
    if (btnHeaderAdd) btnHeaderAdd.style.display = 'flex';

    renderBuyerCompanyList(); // 업체 관리 탭에는 등록 업체 리스트 렌더링
  });

  // 적합/부적합 소팅 탭 삭제에 따른 상태 고정
  buyerActiveTab = 'all';

  btnBackToHome?.addEventListener('click', () => {
    if (buyerEvalView) buyerEvalView.style.display = 'none';
    if (homeView) homeView.style.display = 'flex';
  });

  btnOpenFilter?.addEventListener('click', () => filterOverlay?.classList.add('show'));
  btnCloseFilter?.addEventListener('click', () => filterOverlay?.classList.remove('show'));
  filterOverlay?.addEventListener('click', (e) => {
    if (e.target === filterOverlay) filterOverlay.classList.remove('show');
  });

  document.getElementById('btnFilterApply')?.addEventListener('click', () => {
    filterOverlay?.classList.remove('show');
    showToast('필터 조건이 적용되었습니다. (시뮬레이션)');
    renderBuyerList();
  });

  btnBackToEvalList?.addEventListener('click', () => {
    if (buyerDetailView) buyerDetailView.style.display = 'none';
    if (buyerEvalView) buyerEvalView.style.display = 'flex';
  });

  detailImageInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      showToast(`사진 "${file.name}"이 임시 첨부되었습니다.`);
      const grid = document.getElementById('uploadPreviewGrid');
      if (grid) {
        grid.innerHTML = `<div class="preview-thumb"><img src="image_20afcc.png" alt="현장 사진 미리보기"><button class="btn-del-thumb" onclick="this.parentElement.remove()">&times;</button></div>`;
      }
    }
  });

  btnDetailSaveDraft?.addEventListener('click', () => {
    showToast('평가 내용이 임시 저장되었습니다.');
  });

  btnDetailSubmitFinal?.addEventListener('click', () => {
    showToast('최종 평가서 제출이 완료되었습니다.');
    if (activeBuyerItem) activeBuyerItem.status = 'fit';
    setTimeout(() => {
      if (buyerDetailView) buyerDetailView.style.display = 'none';
      if (buyerEvalView) buyerEvalView.style.display = 'flex';
      renderBuyerList();
    }, 500);
  });

  document.getElementById('btnDetailEdit')?.addEventListener('click', () => {
    setBuyerDetailMode(false);
  });

  document.getElementById('btnDetailSendReport')?.addEventListener('click', () => {
    const sendModal = document.getElementById('sendReportModal');
    if (sendModal) sendModal.classList.add('show');
  });

  document.getElementById('btnCloseSendModal')?.addEventListener('click', () => {
    const sendModal = document.getElementById('sendReportModal');
    if (sendModal) sendModal.classList.remove('show');
  });

  document.getElementById('sendReportModal')?.addEventListener('click', (e) => {
    const sendModal = document.getElementById('sendReportModal');
    if (e.target === sendModal) {
      sendModal.classList.remove('show');
    }
  });

  document.getElementById('btnSendEmailSubmit')?.addEventListener('click', () => {
    const emailInput = document.getElementById('inputSendEmail');
    const email = emailInput ? emailInput.value.trim() : '';
    if (!email) {
      showToast('이메일 주소를 입력해 주세요.');
      return;
    }
    showToast(`"${email}" 주소로 결과 보고서가 정상 발송되었습니다.`);
    const sendModal = document.getElementById('sendReportModal');
    if (sendModal) sendModal.classList.remove('show');
  });

  document.getElementById('btnSubmitRegister')?.addEventListener('click', () => {
    const regView = document.getElementById('buyer-register-view');
    const isEditMode = regView && regView.querySelector('.header-title')?.textContent === '업체 상세 정보';

    if (isEditMode) {
      const name = document.getElementById('regCompanyName')?.value.trim();
      showToast(`"${name}" 업체 정보 수정이 완료되었습니다.`);
      if (regView) regView.style.display = 'none';
      const evalView = document.getElementById('buyer-eval-view');
      if (evalView) evalView.style.display = 'flex';
      renderBuyerCompanyList();
    } else {
      const name = document.getElementById('regCompanyName')?.value.trim();
      if (!name) {
        showToast('업체명을 지정해 주세요.');
        return;
      }
      const expressChk = document.getElementById('regExpress');
      const isExpress = expressChk ? expressChk.checked : false;

      // Express 월 5회 제한 검사
      if (isExpress) {
        const usedCount = buyerMockData.filter(d => d.express === true).length;
        if (usedCount >= 5) {
          showToast('Express 긴급 요청건은 월 최대 5회까지만 사용 가능합니다. (초과됨)');
          return;
        }
      }

      const newId = buyerMockData.length > 0 ? Math.max(...buyerMockData.map(d => d.id)) + 1 : 1;
      const newCompany = {
        id: newId,
        buyerId: 'BUYER_DEPT_01',
        storeName: '본점 (소공점)',
        name: name,
        date: document.getElementById('regDate')?.value || new Date().toISOString().split('T')[0],
        div: document.getElementById('regDiv')?.value || '농산',
        biz: document.getElementById('regBiz')?.value || '제조가공업',
        vhr: document.querySelector('input[name="regVhr"]:checked')?.value || 'R',
        express: isExpress,
        status: 'pending',
        comment: '신규 업체 등록 완료. 현장 평가 대기 중.'
      };

      buyerMockData.unshift(newCompany);
      showToast(`"${name}" 업체가 신규 등록되었습니다.`);
      
      // 잔여 카운트 실시간 리렌더링
      updateExpressCountUI();

      if (regView) regView.style.display = 'none';
      const evalView = document.getElementById('buyer-eval-view');
      if (evalView) evalView.style.display = 'flex';
      renderBuyerCompanyList();
    }
  });

  document.getElementById('btnDetailDownloadExcel')?.addEventListener('click', () => {
    showToast('엑셀 보고서 다운로드가 시작되었습니다.');
  });

  // 이미지 팝업 슬라이더 전역 변수
  let popupImages = [];
  let popupCurrentIndex = 0;

  function updatePopupSlide() {
    const popupImg = document.getElementById('popupTargetImage');
    const prevBtn = document.getElementById('btnPopupPrev');
    const nextBtn = document.getElementById('btnPopupNext');
    const bulletsContainer = document.getElementById('popupBullets');

    if (!popupImg) return;
    popupImg.src = popupImages[popupCurrentIndex];

    const isMulti = popupImages.length > 1;
    if (prevBtn) prevBtn.style.display = isMulti ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = isMulti ? 'flex' : 'none';
    if (bulletsContainer) bulletsContainer.style.display = isMulti ? 'flex' : 'none';

    if (bulletsContainer && isMulti) {
      bulletsContainer.innerHTML = popupImages.map((_, idx) => `
        <span class="popup-bullet ${idx === popupCurrentIndex ? 'active' : ''}" data-idx="${idx}"></span>
      `).join('');
    }
  }

  // 이미지 팝업 모달 이벤트 위임 바인딩
  buyerDetailView?.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG' && (e.target.closest('#uploadPreviewGrid') || e.target.closest('.preview-thumb') || e.target.classList.contains('clickable-item-thumb'))) {
      const popupModal = document.getElementById('imagePopupModal');
      if (popupModal) {
        const parent = e.target.closest('#uploadPreviewGrid') || e.target.closest('.item-photo-grid') || e.target.closest('.preview-thumb')?.parentNode;
        if (parent) {
          const imgs = Array.from(parent.querySelectorAll('img'));
          popupImages = imgs.map(img => img.src);
          popupCurrentIndex = imgs.indexOf(e.target);
          if (popupCurrentIndex === -1) popupCurrentIndex = 0;
        } else {
          popupImages = [e.target.src];
          popupCurrentIndex = 0;
        }
        updatePopupSlide();
        popupModal.classList.add('show');
      }
    }
    // 개별 문항의 가상 파일명 링크 클릭 시 확대 팝업 연동
    if (e.target.classList.contains('clickable-photo-status')) {
      const popupModal = document.getElementById('imagePopupModal');
      const qid = e.target.getAttribute('data-qid');
      if (popupModal && qid) {
        const imgMap = {
          'C01': 'https://picsum.photos/id/43/400/300',
          'C02': 'https://picsum.photos/id/48/400/300',
          'C03': 'https://picsum.photos/id/53/400/300'
        };
        const src = imgMap[qid] || 'https://picsum.photos/id/10/400/300';
        popupImages = [src];
        popupCurrentIndex = 0;
        updatePopupSlide();
        popupModal.classList.add('show');
      }
    }
  });

  // 슬라이드 네비게이션 클릭 이벤트 등록
  document.getElementById('btnPopupPrev')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (popupImages.length <= 1) return;
    popupCurrentIndex = (popupCurrentIndex - 1 + popupImages.length) % popupImages.length;
    updatePopupSlide();
  });

  document.getElementById('btnPopupNext')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (popupImages.length <= 1) return;
    popupCurrentIndex = (popupCurrentIndex + 1) % popupImages.length;
    updatePopupSlide();
  });

  document.getElementById('popupBullets')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (e.target.classList.contains('popup-bullet')) {
      const idx = parseInt(e.target.getAttribute('data-idx'));
      if (!isNaN(idx)) {
        popupCurrentIndex = idx;
        updatePopupSlide();
      }
    }
  });

  document.getElementById('btnCloseImagePopup')?.addEventListener('click', () => {
    const popupModal = document.getElementById('imagePopupModal');
    if (popupModal) popupModal.classList.remove('show');
  });

  document.getElementById('imagePopupModal')?.addEventListener('click', (e) => {
    const popupModal = document.getElementById('imagePopupModal');
    if (e.target === popupModal) {
      popupModal.classList.remove('show');
    }
  });
}

function renderBuyerList() {
  const container = document.getElementById('buyerEvalList');
  if (!container) return;
  container.innerHTML = '';
  
  const filtered = buyerMockData.filter(item => {
    if (buyerActiveTab === 'all') return true;
    return item.status === buyerActiveTab;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="list-empty" style="text-align: center; padding: 40px 20px; color: #64748b;">
        <p>해당 상태의 평가 결과가 없습니다.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'eval-card';
    
    const statusText = item.status === 'fit' ? '적합' : item.status === 'unfit' ? '부적합' : '대기';
    const statusClass = item.status === 'fit' ? 'badge-fit' : item.status === 'unfit' ? 'badge-unfit' : 'badge-pending';

    card.innerHTML = `
      <div class="card-header-row">
        <h4 class="card-title">${item.name}</h4>
        <div class="card-badges">
          ${item.express ? `<span class="eval-badge badge-express">Express</span>` : ''}
          <span class="eval-badge ${statusClass}">${statusText}</span>
        </div>
      </div>
      <div class="card-info-grid">
        <div class="info-field"><span class="lbl">사업부 (Div.)</span><span class="val">${item.div}</span></div>
        <div class="info-field"><span class="lbl">업태</span><span class="val">${item.biz}</span></div>
        <div class="info-field"><span class="lbl">VHR 유형</span><span class="val">${item.vhr}</span></div>
        <div class="info-field"><span class="lbl">평가 등록일</span><span class="val">${item.date}</span></div>
      </div>
    `;
    card.addEventListener('click', () => openBuyerDetail(item));
    container.appendChild(card);
  });
}

function renderBuyerCompanyList() {
  const container = document.getElementById('buyerCompanyList');
  if (!container) return;
  container.innerHTML = '';
  
  buyerMockData.forEach(item => {
    const card = document.createElement('div');
    card.className = 'eval-card';
    card.style.cursor = 'pointer';

    // VHR 등급에 따른 컬러 코딩 뱃지 클래스 부여
    let vhrClass = 'badge-pending'; // R (회색)
    if (item.vhr === 'VHR') vhrClass = 'badge-unfit'; // VHR (빨강)
    else if (item.vhr === 'HR') vhrClass = 'badge-express'; // HR (주황)

    card.innerHTML = `
      <div class="card-header-row">
        <h4 class="card-title">${item.name}</h4>
        <div class="card-badges">
          ${item.express ? `<span class="eval-badge badge-express">Express</span>` : ''}
          <span class="eval-badge ${vhrClass}">${item.vhr}</span>
        </div>
      </div>
      <div class="card-info-grid">
        <div class="info-field"><span class="lbl">사업부 (Div.)</span><span class="val">${item.div}</span></div>
        <div class="info-field"><span class="lbl">업태</span><span class="val">${item.biz}</span></div>
        <div class="info-field" style="grid-column: span 2;"><span class="lbl">평가 등록일</span><span class="val">${item.date}</span></div>
      </div>
    `;
    card.addEventListener('click', () => openBuyerRegisterDetail(item));
    container.appendChild(card);
  });
}

function updateExpressCountUI() {
  const badge = document.getElementById('expressCountBadge');
  const chk = document.getElementById('regExpress');
  if (!badge) return;

  // 전체 데이터 중 Express 요청건으로 등록된 횟수 카운팅
  const usedCount = buyerMockData.filter(d => d.express === true).length;
  const limit = 5;
  const remaining = Math.max(0, limit - usedCount);

  badge.textContent = `(잔여 ${remaining}회 / 월 ${limit}회)`;

  if (remaining <= 0) {
    badge.style.background = '#f1f5f9';
    badge.style.color = '#94a3b8';
    badge.style.border = '1px solid #cbd5e1';
    if (chk) {
      chk.disabled = true;
      chk.checked = false;
    }
    badge.textContent = `(사용 불가 / 월 ${limit}회 초과)`;
  } else {
    badge.style.background = '#fee2e2';
    badge.style.color = '#ef4444';
    badge.style.border = 'none';
    if (chk) {
      // 조회수정 모드가 아닐 때만 disabled 해제 처리하기 위해 체크박스의 상태 보장
      chk.disabled = false;
    }
  }
}

function openBuyerRegisterDetail(item) {
  // 실시간 Express 잔여 횟수 뱃지 갱신
  updateExpressCountUI();

  // 만약 상세 조회 시 기존에 Express로 등록된 업체였다면 체크박스를 활성화된 상태로 노출
  const chk = document.getElementById('regExpress');
  if (chk) {
    chk.checked = item.express === true;
    // 상세조회 화면에서는 임의로 수정이 불가하도록 체크박스를 readonly(disabled) 처리
    chk.disabled = true;
  }
  const allViews = ['home-view', 'buyer-eval-view', 'buyer-detail-view', 'buyer-register-view', 'mfr-eval-view', 'mfr-register-view', 'master-search-view', 'eval-master-search-view'];
  allViews.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const regView = document.getElementById('buyer-register-view');
  if (regView) regView.style.display = 'flex';

  // 헤더 타이틀 변경: "신규 업체 등록" -> "업체 상세 정보"
  const titleEl = regView.querySelector('.header-title');
  if (titleEl) titleEl.textContent = '업체 상세 정보';

  // 입력 필드 채우기
  const regDate = document.getElementById('regDate');
  if (regDate) regDate.value = item.date || new Date().toISOString().split('T')[0];

  const regCompanyName = document.getElementById('regCompanyName');
  if (regCompanyName) regCompanyName.value = item.name || '';

  const regLicense = document.getElementById('regLicense');
  if (regLicense) regLicense.value = item.licenseNo || '120-81-22456';

  const regDiv = document.getElementById('regDiv');
  if (regDiv) regDiv.value = item.div || '농산';

  const regBiz = document.getElementById('regBiz');
  if (regBiz) regBiz.value = item.biz || '제조가공업';

  const regVhr = document.querySelector(`input[name="regVhr"][value="${item.vhr || 'R'}"]`);
  if (regVhr) regVhr.checked = true;

  // 하단 버튼 텍스트 수정 완료로 변경
  const btnSubmit = document.getElementById('btnSubmitRegister');
  if (btnSubmit) btnSubmit.textContent = '업체 정보 수정 완료';

  showToast(`"${item.name}" 업체 상세 정보를 로드했습니다.`);
}

function openBuyerDetail(item) {
  activeBuyerItem = item;
  const buyerEvalView = document.getElementById('buyer-eval-view');
  const buyerDetailView = document.getElementById('buyer-detail-view');
  if (buyerEvalView) buyerEvalView.style.display = 'none';
  if (buyerDetailView) buyerDetailView.style.display = 'flex';

  document.getElementById('detail-company-name').textContent = item.name;
  document.getElementById('detail-vhr-type').textContent = item.vhr;
  document.getElementById('detail-div').textContent = item.div;
  document.getElementById('detail-biz').textContent = item.biz;
  document.getElementById('detail-store-name').textContent = item.storeName;
  document.getElementById('detail-buyer-id').textContent = item.buyerId;
  document.getElementById('detailCommentInput').value = item.comment || '';
  
  // VHR 유형 텍스트 및 점검자/피점검자 연동
  const vhrTypeText = document.getElementById('detail-vhr-type-text');
  if (vhrTypeText) vhrTypeText.textContent = item.vhr;

  const inspectorEl = document.getElementById('detail-inspector');
  if (inspectorEl) inspectorEl.textContent = '김바이어 (BUYER_DEPT_01)';

  const managerInput = document.getElementById('detailManagerInput');
  if (managerInput) {
    managerInput.value = item.manager || (item.status !== 'pending' ? '홍길동 과장' : '');
  }
  


  const grid = document.getElementById('uploadPreviewGrid');
  if (grid) grid.innerHTML = '';

  // status가 pending이 아니면(fit/unfit 이면) 조회 전용 모드로 설정
  if (item.status && item.status !== 'pending') {
    setBuyerDetailMode(true);
  } else {
    setBuyerDetailMode(false);
  }
}

function setBuyerDetailMode(readOnly) {
  isBuyerDetailReadOnly = readOnly;
  
  const detailView = document.getElementById('buyer-detail-view');
  if (detailView) {
    if (readOnly) {
      detailView.classList.add('view-only-mode');
    } else {
      detailView.classList.remove('view-only-mode');
    }
  }
  
  const titleEl = document.getElementById('txt-buyer-detail-title');
  const draftActions = document.getElementById('detail-actions-draft');
  const completedActions = document.getElementById('detail-actions-completed');
  const commentInput = document.getElementById('detailCommentInput');
  const managerInput = document.getElementById('detailManagerInput');
  const fileInputLabel = document.querySelector('.upload-trigger-zone');
  const grid = document.getElementById('uploadPreviewGrid');

  if (titleEl) {
    titleEl.textContent = readOnly ? '평가 결과 상세' : (activeBuyerItem?.status === 'pending' ? '상세 평가 등록' : '상세 평가 수정');
  }
  
  if (draftActions) draftActions.style.display = readOnly ? 'none' : 'flex';
  if (completedActions) completedActions.style.display = readOnly ? 'flex' : 'none';
  
  if (commentInput) {
    commentInput.disabled = readOnly;
  }

  if (managerInput) {
    managerInput.disabled = readOnly;
  }
  
  // 하단 [현장 점검 사진 첨부] 영역 플레이스홀더 분기 처리
  if (fileInputLabel && grid) {
    if (readOnly) {
      fileInputLabel.style.pointerEvents = 'none';
      fileInputLabel.style.opacity = '0.6';
      
      if (activeBuyerItem && activeBuyerItem.status !== 'pending') {
        // 첨부 이미지가 있는 경우: 카메라 아이콘 숨기고 썸네일만 전면에 그리드로 노출
        fileInputLabel.style.display = 'none';
        grid.style.display = 'grid';
        
        const count = activeBuyerItem.status === 'unfit' ? 2 : 1;
        let thumbsHtml = '';
        for (let i = 1; i <= count; i++) {
          thumbsHtml += `
            <div class="preview-thumb" style="position: relative; width: 70px; height: 70px; border-radius: 8px; overflow: hidden; border: 1px solid #cbd5e1;">
              <img src="https://picsum.photos/id/${10 + i}/150/150" alt="가상 점검 사진 ${i}" style="width: 100%; height: 100%; object-fit: cover;">
              <button class="btn-del-thumb" style="position: absolute; top: 4px; right: 4px; width: 18px; height: 18px; border-radius: 50%; background: rgba(15, 23, 42, 0.75); border: none; color: #ffffff; font-size: 11px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10;">&times;</button>
            </div>
          `;
        }
        grid.innerHTML = thumbsHtml;
      } else {
        // 첨부 이미지가 없는 경우: 카메라 아이콘 유지, 플레이스홀더 문구 출력
        fileInputLabel.style.display = 'flex';
        grid.style.display = 'none';
        grid.innerHTML = '';
        const txtSpan = fileInputLabel.querySelector('span');
        if (txtSpan) txtSpan.textContent = '등록된 현장 점검 이미지가 없습니다.';
      }
    } else {
      // 수정 모드일 때: 카메라 노출, 기존 이미지 썸네일 보임 및 삭제(X) 아이콘 연동
      fileInputLabel.style.display = 'flex';
      fileInputLabel.style.pointerEvents = 'auto';
      fileInputLabel.style.opacity = '1';
      grid.style.display = 'grid';
      
      const txtSpan = fileInputLabel.querySelector('span');
      if (txtSpan) txtSpan.textContent = '현장 사진 추가 (직접 촬영/파일 선택)';
      
      if (activeBuyerItem && activeBuyerItem.status !== 'pending') {
        const count = activeBuyerItem.status === 'unfit' ? 2 : 1;
        let thumbsHtml = '';
        for (let i = 1; i <= count; i++) {
          thumbsHtml += `
            <div class="preview-thumb" style="position: relative; width: 70px; height: 70px; border-radius: 8px; overflow: hidden; border: 1px solid #cbd5e1;">
              <img src="https://picsum.photos/id/${10 + i}/150/150" alt="가상 점검 사진 ${i}" style="width: 100%; height: 100%; object-fit: cover;">
              <button class="btn-del-thumb" style="position: absolute; top: 4px; right: 4px; width: 18px; height: 18px; border-radius: 50%; background: rgba(15, 23, 42, 0.75); border: none; color: #ffffff; font-size: 11px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10;">&times;</button>
            </div>
          `;
        }
        grid.innerHTML = thumbsHtml;
        
        // 삭제 아이콘 클릭 이벤트 연동
        grid.querySelectorAll('.btn-del-thumb').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const thumb = btn.closest('.preview-thumb');
            thumb.style.transition = 'all 0.2s';
            thumb.style.opacity = '0';
            thumb.style.transform = 'scale(0.8)';
            setTimeout(() => {
              thumb.remove();
              showToast('선택한 점검 이미지가 삭제되었습니다.');
            }, 200);
          });
        });
      } else {
        grid.innerHTML = '';
      }
    }
  }

  // 체크리스트 다시 그리기
  renderChecklistQuestions();
  
  // 실시간 판정 상태 업데이트
  const verdictEl = document.getElementById('realtime-final-verdict');
  if (verdictEl && activeBuyerItem) {
    if (activeBuyerItem.status === 'fit') {
      verdictEl.textContent = '최종 적합';
      verdictEl.className = 'val-verdict verdict-fit';
    } else if (activeBuyerItem.status === 'unfit') {
      verdictEl.textContent = '최종 부적합';
      verdictEl.className = 'val-verdict verdict-unfit';
    } else {
      verdictEl.textContent = '판정 대기';
      verdictEl.className = 'val-verdict verdict-pending';
    }
  }
}

function renderChecklistQuestions() {
  const container = document.getElementById('checklistQuestions');
  if (!container) return;
  container.innerHTML = '';
  
  const dummyQuestions = [
    { id: 'C01', item: '작업자 위생모/위생복/위생화 착용 및 청결 상태', desc: '위생 복장 착용 규정 준수 여부' },
    { id: 'C02', item: '종사자 손 세척 및 소독 적정성', desc: '원료 취급 전 손 세척/소독 준수 여부' },
    { id: 'C03', item: '원부재료 입고 검사 및 신선도 상태', desc: '입고 유통기한 경과 여부 확인' }
  ];

  dummyQuestions.forEach((q, idx) => {
    const card = document.createElement('div');
    card.className = 'inspect-card';

    let initialResult = '';
    let initialMemo = '';
    let hasPhoto = false;

    if (activeBuyerItem) {
      if (activeBuyerItem.status === 'fit') {
        initialResult = 'fit';
        initialMemo = '특이사항 없음. 점검 기준 충족 및 위생 복장 양호 확인.';
        hasPhoto = idx === 0; // 예시 데이터로 첫번째 문항은 사진 가상 매핑
      } else if (activeBuyerItem.status === 'unfit') {
        initialResult = idx === 0 ? 'unfit' : 'fit';
        if (idx === 0) {
          initialMemo = '일부 종사자 위생모 미착용 및 귀걸이 장신구 착용 적발. 즉시 시정 조치.';
          hasPhoto = true; // 첫 부적합 문항은 가상 증빙 사진 매핑
        } else {
          initialMemo = '손 소독 관리 대장 및 소독기 정상 작동 확인.';
        }
      }
    }
    
    const isFitActive = initialResult === 'fit' ? 'active' : '';
    const isUnfitActive = initialResult === 'unfit' ? 'active' : '';

    card.innerHTML = `
      <div class="inspect-card-header" style="position: relative;">
        <span class="item-num">점검 항목 ${idx + 1}</span>
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
          <h5 class="item-title" style="margin: 0;">${q.item}</h5>
          <button class="btn-help-guide" data-qid="${q.id}" style="background: #e2e8f0; border: none; width: 16px; height: 16px; border-radius: 50%; cursor: pointer; color: #475569; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; font-family: sans-serif; transition: all 0.2s;" title="도움말 확인">?</button>
        </div>
        <p class="item-desc" style="margin-top: 4px;">${q.desc}</p>
      </div>
      <div class="binary-control" data-qid="${q.id}">
        <button class="binary-btn btn-fit ${isFitActive}" data-result="fit">적합</button>
        <button class="binary-btn btn-unfit ${isUnfitActive}" data-result="unfit">부적합</button>
      </div>
      
      <!-- 상세 문항별 개별 사진 첨부 및 메모 영역 (다수 첨부 지원형 구성) -->
      <div class="inspect-card-extra" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e2e8f0; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; align-items: center; justify-content: flex-start; flex-wrap: wrap; gap: 8px;">
          <button class="btn-item-photo" data-qid="${q.id}" ${isBuyerDetailReadOnly ? 'disabled' : ''} style="height: 30px; padding: 0 10px; font-size: 12px; font-weight: 600; color: #475569; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 12px; height: 12px;">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            사진 추가
          </button>
          <span class="item-photo-guide" style="font-size: 11px; color: #94a3b8; font-weight: 500; display: ${isBuyerDetailReadOnly ? 'none' : 'inline'};">* JPG, PNG (최대 5MB)</span>
        </div>
        
        <!-- 개별 문항 첨부 이미지 목록 그리드 -->
        <div class="item-photo-title" style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 2px; display: ${hasPhoto && isBuyerDetailReadOnly ? 'block' : 'none'};">첨부된 이미지 (${hasPhoto ? 2 : 0})</div>
        <div class="item-photo-grid" data-qid="${q.id}" style="display: ${hasPhoto ? 'flex' : 'none'}; gap: 8px; flex-wrap: wrap; margin-top: 4px;"></div>
        
        <textarea class="item-memo-input input-form" data-qid="${q.id}" placeholder="상세 내용 및 항목별 메모 입력" style="height: 48px; padding: 6px 10px; font-size: 12.5px; border-radius: 6px; border: 1px solid #cbd5e1; resize: none; width: 100%;" ${isBuyerDetailReadOnly ? 'disabled' : ''}>${initialMemo}</textarea>
      </div>
    `;

    const helpBtn = card.querySelector('.btn-help-guide');
    helpBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast(`[점검 기준] ${q.item}: ${q.desc}`);
    });

    const photoBtn = card.querySelector('.btn-item-photo');
    const photoGrid = card.querySelector('.item-photo-grid');

    const updateItemPhotoTitle = () => {
      const titleEl = card.querySelector('.item-photo-title');
      if (titleEl) {
        const count = photoGrid ? photoGrid.querySelectorAll('.item-thumb-wrapper').length : 0;
        titleEl.textContent = `첨부된 이미지 (${count})`;
        titleEl.style.display = (count > 0 && isBuyerDetailReadOnly) ? 'block' : 'none';
      }
    };

    // 가상으로 다수 이미지 리스트 세팅
    if (hasPhoto && photoGrid) {
      const count = 2; // 가상 다수 사진 예시
      let gridHtml = '';
      for (let i = 1; i <= count; i++) {
        gridHtml += `
          <div class="item-thumb-wrapper" style="position: relative; width: 70px; height: 70px; border-radius: 8px; overflow: hidden; border: 1px solid #cbd5e1;">
            <img src="https://picsum.photos/id/${15 + i}/150/150" alt="점검 증빙 사진 ${i}" class="clickable-item-thumb" data-qid="${q.id}" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;">
            <button class="btn-del-item-thumb" style="position: absolute; top: 4px; right: 4px; width: 18px; height: 18px; border-radius: 50%; background: rgba(15, 23, 42, 0.75); border: none; color: #ffffff; font-size: 11px; display: ${isBuyerDetailReadOnly ? 'none' : 'flex'}; align-items: center; justify-content: center; cursor: pointer; z-index: 5;">&times;</button>
          </div>
        `;
      }
      photoGrid.innerHTML = gridHtml;
      photoGrid.style.display = 'flex';
      updateItemPhotoTitle();
      
      // 수정 모드일 때 개별 삭제 바인딩
      if (!isBuyerDetailReadOnly) {
        photoGrid.querySelectorAll('.btn-del-item-thumb').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const thumbWrap = btn.closest('.item-thumb-wrapper');
            thumbWrap.style.transition = 'all 0.2s';
            thumbWrap.style.opacity = '0';
            thumbWrap.style.transform = 'scale(0.8)';
            setTimeout(() => {
              thumbWrap.remove();
              showToast('문항 증빙 사진이 삭제되었습니다.');
              updateItemPhotoTitle();
              if (photoGrid.querySelectorAll('.item-thumb-wrapper').length === 0) {
                photoGrid.style.display = 'none';
              }
            }, 200);
          });
        });
      }
    }

    if (isBuyerDetailReadOnly) {
      if (photoBtn) {
        photoBtn.style.pointerEvents = 'none';
        photoBtn.style.opacity = '0.5';
      }
    } else {
      photoBtn?.addEventListener('click', () => {
        showToast(`[${q.item}] 항목에 사진이 정상 첨부되었습니다.`);
        if (photoGrid) {
          photoGrid.style.display = 'flex';
          const newIdx = photoGrid.querySelectorAll('.item-thumb-wrapper').length + 1;
          const newThumb = document.createElement('div');
          newThumb.className = 'item-thumb-wrapper';
          newThumb.style.cssText = 'position: relative; width: 70px; height: 70px; border-radius: 8px; overflow: hidden; border: 1px solid #cbd5e1;';
          newThumb.innerHTML = `
            <img src="https://picsum.photos/id/${20 + newIdx}/150/150" alt="점검 증빙 사진" class="clickable-item-thumb" data-qid="${q.id}" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;">
            <button class="btn-del-item-thumb" style="position: absolute; top: 4px; right: 4px; width: 18px; height: 18px; border-radius: 50%; background: rgba(15, 23, 42, 0.75); border: none; color: #ffffff; font-size: 11px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 5;">&times;</button>
          `;
          
          newThumb.querySelector('.btn-del-item-thumb').addEventListener('click', (e) => {
            e.stopPropagation();
            newThumb.style.transition = 'all 0.2s';
            newThumb.style.opacity = '0';
            newThumb.style.transform = 'scale(0.8)';
            setTimeout(() => {
              newThumb.remove();
              showToast('문항 증빙 사진이 삭제되었습니다.');
              updateItemPhotoTitle();
              if (photoGrid.querySelectorAll('.item-thumb-wrapper').length === 0) {
                photoGrid.style.display = 'none';
              }
            }, 200);
          });
          photoGrid.appendChild(newThumb);
          updateItemPhotoTitle();
        }
      });
    }

    const control = card.querySelector('.binary-control');
    if (isBuyerDetailReadOnly) {
      control.style.pointerEvents = 'none';
      control.style.opacity = '0.7';
    }

    card.querySelectorAll('.binary-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (isBuyerDetailReadOnly) return;
        card.querySelectorAll('.binary-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const finalVerdict = btn.getAttribute('data-result') === 'unfit' ? 'unfit' : 'fit';
        const verdict = document.getElementById('realtime-final-verdict');
        if (verdict) {
          if (finalVerdict === 'unfit') {
            verdict.textContent = '최종 부적합';
            verdict.className = 'val-verdict verdict-unfit';
          } else {
            verdict.textContent = '최종 적합';
            verdict.className = 'val-verdict verdict-fit';
          }
        }
      });
    });
    container.appendChild(card);
  });
}

// ==========================================
// 제조사 현장 평가 모듈 (껍데기 인터랙션)
// ==========================================
function initMfrEval() {
  const menuFactory = document.getElementById('menu_factory');
  const btnMfrBackToHome = document.getElementById('btnMfrBackToHome');
  const homeView = document.getElementById('home-view');
  const mfrEvalView = document.getElementById('mfr-eval-view');
  const mfrRegisterView = document.getElementById('mfr-register-view');
  const mfrDetailView = document.getElementById('mfr-detail-view');
  const btnMfrHeaderAdd = document.getElementById('btnMfrHeaderAdd');
  const btnMfrBackToEvalFromReg = document.getElementById('btnMfrBackToEvalFromReg');
  const btnMfrSubmitRegister = document.getElementById('btnMfrSubmitRegister');
  const btnMfrSaveDraft = document.getElementById('btnMfrSaveDraft');
  const mfrSearchInput = document.getElementById('mfrSearchInput');

  // 탭 제어 엘리먼트
  const tabMfrRegSearch = document.getElementById('tabMfrRegSearch');
  const tabMfrRegForm = document.getElementById('tabMfrRegForm');
  const mfrRegSearchTab = document.getElementById('mfrRegSearchTab');
  const mfrRegFormTab = document.getElementById('mfrRegFormTab');
  const mfrRegisterActionsBar = document.getElementById('mfrRegisterActionsBar');
  const mfrRegSearchInput = document.getElementById('mfrRegSearchInput');

  // 탭 전환 이벤트 리스너
  tabMfrRegSearch?.addEventListener('click', () => {
    tabMfrRegSearch.classList.add('active');
    tabMfrRegForm?.classList.remove('active');
    if (mfrRegSearchTab) mfrRegSearchTab.style.display = 'flex';
    if (mfrRegFormTab) mfrRegFormTab.style.display = 'none';
    if (mfrRegisterActionsBar) mfrRegisterActionsBar.style.display = 'none';
  });

  tabMfrRegForm?.addEventListener('click', () => {
    tabMfrRegForm.classList.add('active');
    tabMfrRegSearch?.classList.remove('active');
    if (mfrRegSearchTab) mfrRegSearchTab.style.display = 'none';
    if (mfrRegFormTab) mfrRegFormTab.style.display = 'flex';
    if (mfrRegisterActionsBar) mfrRegisterActionsBar.style.display = 'flex';
  });

  // 제조사 검색 필터 및 렌더링
  const mfrMasterData = [
    { name: "(주)한영식품", license: "120-81-22456", category: "어묵류", address: "부산시 사하구 장림동 12", owner: "한영수", vhr: "VHR" },
    { name: "(주)우일푸드", license: "204-85-11982", category: "과자류", address: "경기도 안산시 단원구 성곡동 45", owner: "우태일", vhr: "HR" },
    { name: "(주)진성제과", license: "113-86-99304", category: "빵류", address: "서울시 금천구 가산동 29", owner: "진창성", vhr: "VHR" },
    { name: "동해수산", license: "402-81-33290", category: "수산가공품", address: "강원도 강릉시 주문진읍 78", owner: "이동해", vhr: "R" },
    { name: "(주)동원아이에프", license: "128-86-00491", category: "조미김", address: "충남 천안시 서북구 성거읍 5", owner: "김동원", vhr: "HR" }
  ];

  function renderMfrRegSearchCards() {
    const grid = document.getElementById('mfrRegSearchCardGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const query = mfrRegSearchInput ? mfrRegSearchInput.value.trim().toLowerCase() : '';
    
    const filtered = mfrMasterData.filter(item => {
      return item.name.toLowerCase().includes(query) || item.license.replace(/-/g, '').includes(query.replace(/-/g, ''));
    });

    if (filtered.length === 0 && query.length > 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; text-align: center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 42px; height: 42px; color: #94a3b8; margin-bottom: 8px;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span style="font-size: 13px; color: #64748b; font-weight: 500; margin-bottom: 16px;">검색 결과가 없습니다.</span>
          <button type="button" id="btnGoToMfrRegFromSearch" style="width: 100%; max-width: 220px; height: 44px; background: #0f172a; color: #ffffff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            신규 업체 등록
          </button>
        </div>
      `;
      document.getElementById('btnGoToMfrRegFromSearch')?.addEventListener('click', () => {
        tabMfrRegForm?.click();
      });
      return;
    } else if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; text-align: center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 42px; height: 42px; color: #94a3b8; margin-bottom: 8px;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span style="font-size: 13px; color: #64748b; font-weight: 500;">업체명 또는 사업자등록번호를 입력해 주세요.</span>
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'eval-card';
      card.style.cssText = 'background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; cursor: pointer; transition: all 0.2s; position: relative; display: flex; flex-direction: column; gap: 6px; box-shadow: var(--shadow-sm);';
      
      // VHR 뱃지 클래스
      const vhrStyle = item.vhr === 'VHR' ? 'background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2;' : (item.vhr === 'HR' ? 'background: #fffbeb; color: #d97706; border: 1px solid #fef3c7;' : 'background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;');

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0;">${item.name}</h4>
          <span style="font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; ${vhrStyle}">${item.vhr}</span>
        </div>
        <div style="font-size: 12px; color: #64748b; display: flex; flex-direction: column; gap: 2px;">
          <span>대표자: ${item.owner}</span>
          <span>사업자번호: ${item.license}</span>
          <span style="font-size: 11px; color: #94a3b8; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">소재지: ${item.address}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        // 데이터 바인딩
        const mfrRegName = document.getElementById('mfrRegName');
        const mfrRegLicense = document.getElementById('mfrRegLicense');
        const mfrRegOwner = document.getElementById('mfrRegOwner');
        const mfrRegAddress = document.getElementById('mfrRegAddress');
        const mfrRegCategory = document.getElementById('mfrRegCategory');
        const mfrRegDate = document.getElementById('mfrRegDate');

        if (mfrRegName) mfrRegName.value = item.name;
        if (mfrRegLicense) mfrRegLicense.value = item.license;
        if (mfrRegOwner) mfrRegOwner.value = item.owner;
        if (mfrRegAddress) mfrRegAddress.value = item.address;
        if (mfrRegCategory) mfrRegCategory.value = item.category;
        
        // 날짜 오늘로 디폴트 채우기
        if (mfrRegDate) {
          const today = new Date().toISOString().substring(0, 10);
          mfrRegDate.value = today;
        }

        // VHR 라디오 연동
        const vhrRadios = document.querySelectorAll('input[name="mfrRegVhr"]');
        vhrRadios.forEach(radio => {
          if (radio.value === item.vhr || (item.vhr === 'R' && radio.value === 'R')) {
            radio.checked = true;
          }
        });

        showToast(`"${item.name}" 정보가 동적으로 채워졌습니다.`);
        tabMfrRegForm?.click(); // 탭 이동
      });

      grid.appendChild(card);
    });
  }

  mfrRegSearchInput?.addEventListener('input', renderMfrRegSearchCards);
  
  menuFactory?.addEventListener('click', () => {
    if (homeView) homeView.style.display = 'none';
    if (mfrEvalView) mfrEvalView.style.display = 'flex';
    renderMfrCompanyList();
  });

  btnMfrBackToHome?.addEventListener('click', () => {
    if (mfrEvalView) mfrEvalView.style.display = 'none';
    if (homeView) homeView.style.display = 'flex';
  });

  // 실시간 검색 기능 연동
  mfrSearchInput?.addEventListener('input', () => {
    renderMfrCompanyList();
  });

  btnMfrHeaderAdd?.addEventListener('click', () => {
    if (mfrEvalView) mfrEvalView.style.display = 'none';
    if (mfrRegisterView) mfrRegisterView.style.display = 'flex';
    document.getElementById('txt-mfr-register-title').textContent = '제조사 업체 등록';
    if (btnMfrSubmitRegister) btnMfrSubmitRegister.dataset.mode = 'new';
    
    // 신규 등록 시 기본적으로 '업체 검색' 탭 활성화 및 바인딩
    tabMfrRegSearch?.click();
    if (mfrRegSearchInput) mfrRegSearchInput.value = '';
    renderMfrRegSearchCards();
    
    document.getElementById('mfrRegOemSubSection').style.display = 'flex';
  });

  btnMfrBackToEvalFromReg?.addEventListener('click', () => {
    if (mfrRegisterView) mfrRegisterView.style.display = 'none';
    if (mfrEvalView) mfrEvalView.style.display = 'flex';
  });

  const mfrRegTypeRadios = document.querySelectorAll('input[name="mfrRegType"]');
  mfrRegTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const oemSection = document.getElementById('mfrRegOemSubSection');
      if (oemSection) oemSection.style.display = e.target.value === 'OEM' ? 'flex' : 'none';
    });
  });

  btnMfrSubmitRegister?.addEventListener('click', () => {
    showToast('제조사 등록이 완료되었습니다.');
    if (mfrRegisterView) mfrRegisterView.style.display = 'none';
    if (mfrEvalView) mfrEvalView.style.display = 'flex';
    renderMfrCompanyList();
  });

  btnMfrSaveDraft?.addEventListener('click', () => {
    showToast('제조사 프로필이 임시 저장되었습니다.');
    if (mfrRegisterView) mfrRegisterView.style.display = 'none';
    if (mfrEvalView) mfrEvalView.style.display = 'flex';
    renderMfrCompanyList();
  });

  document.getElementById('btnMfrBackToEvalList')?.addEventListener('click', () => {
    if (mfrDetailView) mfrDetailView.style.display = 'none';
    if (mfrEvalView) mfrEvalView.style.display = 'flex';
  });

  document.getElementById('mfrEvalFileInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      document.getElementById('txtMfrEvalFile').textContent = file.name;
      showToast(`평가 서류 "${file.name}"이 첨부되었습니다.`);
    }
  });

  document.getElementById('mfrActionFileInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      document.getElementById('txtMfrActionFile').textContent = file.name;
      showToast(`개선 조치 보고서 "${file.name}"이 첨부되었습니다.`);
    }
  });

  document.getElementById('btnMfrDetailSaveDraft')?.addEventListener('click', () => {
    showToast('임시 저장되었습니다.');
  });

  document.getElementById('btnMfrDetailSubmitFinal')?.addEventListener('click', () => {
    showToast('현장 평가 결과 제출이 완료되었습니다.');
    if (mfrDetailView) mfrDetailView.style.display = 'none';
    if (mfrEvalView) mfrEvalView.style.display = 'flex';
  });

  initPartnerModal();
}

function bindBuyerCompaniesToMfrSelect() {
  // Obsolete - Replaced by partnerSearchModal
}

function renderMfrEvalList() {
  const container = document.getElementById('mfrEvalList');
  if (!container) return;
  container.innerHTML = '';
  
  mfrMockData.forEach(item => {
    const card = document.createElement('div');
    card.className = 'eval-card';
    const statusText = item.status === 'fit' ? '적합' : item.status === 'unfit' ? '부적합' : '평가 대기';
    const statusClass = item.status === 'fit' ? 'badge-fit' : item.status === 'unfit' ? 'badge-unfit' : 'badge-pending';
    card.innerHTML = `
      <div class="card-header-row">
        <h4 class="card-title">${item.name}</h4>
        <div class="card-badges">
          <span class="eval-badge ${item.type === 'OEM' ? 'badge-express' : 'badge-start-eval'}">${item.type}</span>
          <span class="eval-badge ${statusClass}">${statusText}</span>
        </div>
      </div>
      <div class="card-info-grid">
        <div class="info-field"><span class="lbl">사업부 (Div.)</span><span class="val">${item.div}</span></div>
        <div class="info-field"><span class="lbl">VHR 유형</span><span class="val">${item.vhr}</span></div>
        <div class="info-field"><span class="lbl">점검일자</span><span class="val">${item.regDate}</span></div>
        <div class="info-field"><span class="lbl">점검자</span><span class="val">${item.inspector}</span></div>
      </div>
    `;
    card.addEventListener('click', () => openMfrDetail(item));
    container.appendChild(card);
  });
}

function renderMfrCompanyList() {
  const container = document.getElementById('mfrCompanyList');
  if (!container) return;
  container.innerHTML = '';

  const searchInput = document.getElementById('mfrSearchInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  const filtered = mfrMockData.filter(item => {
    if (!query) return true;
    const nameMatch = item.name.toLowerCase().includes(query);
    const cleanLicense = item.licenseNo.replace(/[^0-9]/g, '');
    const cleanQuery = query.replace(/[^0-9]/g, '');
    const licenseMatch = item.licenseNo.toLowerCase().includes(query) || (cleanQuery !== '' && cleanLicense.includes(cleanQuery));
    return nameMatch || licenseMatch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="list-empty" style="text-align: center; padding: 40px 20px; color: #64748b;">
        <p>검색 결과와 일치하는 제조사가 없습니다.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'eval-card';
    card.style.cursor = 'pointer';
    
    // OEM vs GENERAL 디자인 다변화 (시각적 분간 극대화)
    const badgeStyle = item.type === 'OEM'
      ? 'background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;' // 소프트 스카이블루
      : 'background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;'; // 소프트 슬레이트

    card.innerHTML = `
      <div class="card-header-row">
        <h4 class="card-title" style="font-size: 15px; font-weight: 800; color: #0f172a;">${item.name}</h4>
        <div class="card-badges">
          <span class="eval-badge" style="${badgeStyle} font-weight: 700; font-size: 11px; padding: 3px 8px; border-radius: 8px;">${item.type}</span>
        </div>
      </div>
      <div class="card-info-grid" style="margin-top: 10px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 12px;">
        <div class="info-field"><span class="lbl" style="font-size: 11.5px; color: #64748b; font-weight: 500;">사업부 (Div.)</span><span class="val" style="font-size: 13px; font-weight: 700; color: #334155;">${item.div}</span></div>
        <div class="info-field"><span class="lbl" style="font-size: 11.5px; color: #64748b; font-weight: 500;">업태</span><span class="val" style="font-size: 13px; font-weight: 700; color: #334155;">${item.biz}</span></div>
        <div class="info-field"><span class="lbl" style="font-size: 11.5px; color: #64748b; font-weight: 500;">VHR 유형</span><span class="val" style="font-size: 13px; font-weight: 700; color: #334155;">${item.vhr}</span></div>
        <div class="info-field"><span class="lbl" style="font-size: 11.5px; color: #64748b; font-weight: 500;">등록일</span><span class="val" style="font-size: 13px; font-weight: 700; color: #334155;">${item.regDate}</span></div>
      </div>
    `;
    
    card.addEventListener('click', () => {
      openMfrProfileEdit(item);
      populateDummyEvalFiles(item);
    });
    container.appendChild(card);
  });
}

function openMfrReadOnlyDetail(item) {
  activeMfrItem = item;
  const mfrEvalView = document.getElementById('mfr-eval-view');
  const mfrReadOnlyView = document.getElementById('mfr-detail-readonly-view');
  
  if (mfrEvalView) mfrEvalView.style.display = 'none';
  if (mfrReadOnlyView) mfrReadOnlyView.style.display = 'flex';

  // 뒤로가기 버튼 연동
  const btnBack = document.getElementById('btnMfrReadOnlyBackToEval');
  if (btnBack) {
    btnBack.onclick = () => {
      mfrReadOnlyView.style.display = 'none';
      mfrEvalView.style.display = 'flex';
    };
  }

  // 1. 제조사 구분 정적 상태 고정 (OEM vs 일반)
  const oemRadio = document.getElementById('mfrRoTypeOem');
  const generalRadio = document.getElementById('mfrRoTypeGeneral');
  const oemSubSection = document.getElementById('mfrRoOemSubSection');

  if (item.type === 'OEM') {
    if (oemRadio) oemRadio.checked = true;
    if (generalRadio) generalRadio.checked = false;
    if (oemSubSection) oemSubSection.style.display = 'flex';

    // 거래업체 Chip들 나열 (지시사항 3)
    const partnersContainer = document.getElementById('mfrRoSelectedPartnersContainer');
    if (partnersContainer) {
      partnersContainer.innerHTML = '';
      const partnerName = item.partner || '주식회사 푸드링크';
      const chip = document.createElement('span');
      chip.className = 'partner-chip';
      chip.style.cssText = 'background:#cbd5e1; color:#0f172a; font-size:11px; font-weight:700; padding:4px 8px; border-radius:12px; display:inline-flex; align-items:center;';
      chip.textContent = partnerName;
      partnersContainer.appendChild(chip);
    }

    // 재점검 대상 체크박스 상태 잠금
    const recheckChk = document.getElementById('mfrRoRecheck');
    if (recheckChk) {
      recheckChk.checked = item.recheck === true;
    }
  } else {
    if (oemRadio) oemRadio.checked = false;
    if (generalRadio) generalRadio.checked = true;
    if (oemSubSection) oemSubSection.style.display = 'none';
  }

  // 2. 입력값 바인딩 및 잠금 (Read-only 스타일)
  document.getElementById('mfrRoRegDate').value = item.regDate;
  document.getElementById('mfrRoInspector').value = item.inspector || '김바이어';
  document.getElementById('mfrRoName').value = item.name;
  document.getElementById('mfrRoDiv').value = item.div;
  document.getElementById('mfrRoBiz').value = item.biz;
  document.getElementById('mfrRoVhr').value = item.vhr;
  document.getElementById('mfrRoOwner').value = item.owner || '홍길동';
  document.getElementById('mfrRoLicense').value = item.licenseNo;
  document.getElementById('mfrRoAddress').value = item.address || '서울시 중구 소공동 1번지';
  document.getElementById('mfrRoCategory').value = item.category || '빵류, 과자류';
  document.getElementById('mfrRoSales').value = item.sales || '연간 50억원';
  document.getElementById('mfrRoClients').value = item.clients || '롯데백화점 본점, 롯데마트';
  document.getElementById('mfrRoEmployees').value = item.employees || '45명';
  document.getElementById('mfrRoCert').value = item.cert || 'HACCP 인증 완료 (2026)';
  document.getElementById('mfrRoManager').value = item.manager || '김제조 공장장';
  document.getElementById('mfrRoMemo').value = item.memo || '현장 시설 및 위생 복장 보완 조치 확인 완료.';

  // 3. 파일 및 사진 첨부 플레이스홀더 분기 (지시사항 4)
  const imageGrid = document.getElementById('mfrRoImagePreviewGrid');
  if (imageGrid) {
    imageGrid.innerHTML = '';
    // 가상 이미지 데이터 매핑 (completed 상태일 경우 썸네일 노출, 없을 경우 플레이스홀더)
    if (item.status === 'completed') {
      imageGrid.innerHTML = `
        <div class="preview-thumb" style="width:70px; height:70px; border-radius:8px; overflow:hidden; border:1px solid #cbd5e1; cursor:pointer;" onclick="showImagePopup('image_20afcc.png')">
          <img src="image_20afcc.png" alt="현장 점검 사진" style="width:100%; height:100%; object-fit:cover;">
        </div>
      `;
    } else {
      imageGrid.innerHTML = `<span style="font-size:12px; color:#94a3b8; align-self:center;">등록된 현장 점검 이미지가 없습니다.</span>`;
    }
  }

  const fileGrid = document.getElementById('mfrRoFilePreviewGrid');
  if (fileGrid) {
    fileGrid.innerHTML = '';
    if (item.status === 'completed') {
      fileGrid.innerHTML = `
        <span class="partner-chip" style="background:#f1f5f9; border:1px solid #cbd5e1; color:#475569; font-size:11px; font-weight:700; padding:4px 8px; border-radius:12px; display:inline-flex; align-items:center; gap:4px; cursor:pointer;" onclick="showToast('2026_위생진단결과서.pdf 다운로드 시작')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px; height:12px;">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          </svg>
          2026_위생진단결과서.pdf
        </span>
      `;
    } else {
      fileGrid.innerHTML = `<span style="font-size:12px; color:#94a3b8; align-self:center;">첨부된 개선조치 공식 문서가 없습니다.</span>`;
    }
  }

  // 4. 최하단 액션 플로팅 바 이벤트 바인딩
  const btnEditLink = document.getElementById('btnMfrRoEditLink');
  if (btnEditLink) {
    btnEditLink.onclick = () => {
      mfrReadOnlyView.style.display = 'none';
      openMfrProfileEdit(item);
    };
  }

  const btnSend = document.getElementById('btnMfrRoSendReport');
  if (btnSend) {
    btnSend.onclick = () => {
      showToast('제조사 위생 진단 결과 보고서가 바이어 계정 이메일로 전송되었습니다.');
    };
  }

  const btnExcel = document.getElementById('btnMfrRoDownloadExcel');
  if (btnExcel) {
    btnExcel.onclick = () => {
      showToast('제조사 평가 결과 엑셀 양식(.xlsx) 다운로드를 시작합니다.');
    };
  }
}

function openMfrProfileEdit(item) {
  activeMfrItem = item;
  const mfrEvalView = document.getElementById('mfr-eval-view');
  const mfrRegisterView = document.getElementById('mfr-register-view');
  if (mfrEvalView) mfrEvalView.style.display = 'none';
  if (mfrRegisterView) mfrRegisterView.style.display = 'flex';
  
  document.getElementById('txt-mfr-register-title').textContent = '제조사 정보 상세/수정';
  
  // 상세 진입 시 신규 업체 등록(폼) 탭으로 자동 전환
  const tabMfrRegForm = document.getElementById('tabMfrRegForm');
  if (tabMfrRegForm) tabMfrRegForm.click();
  
  // 기본 정보 매핑
  document.getElementById('mfrRegName').value = item.name;
  document.getElementById('mfrRegDiv').value = item.div;
  document.getElementById('mfrRegBiz').value = item.biz;
  document.getElementById('mfrRegInspector').value = item.inspector || '김바이어';
  
  // 상세 데이터 매핑 (요구사항 3)
  document.getElementById('mfrRegOwner').value = item.owner || '홍길동';
  document.getElementById('mfrRegLicense').value = item.licenseNo;
  document.getElementById('mfrRegAddress').value = item.address || '서울시 중구 소공동 1번지';
  document.getElementById('mfrRegCategory').value = item.category || '빵류, 과자류';
  document.getElementById('mfrRegSales').value = item.sales || '50억원';
  document.getElementById('mfrRegClients').value = item.clients || '롯데백화점, 롯데마트';
  document.getElementById('mfrRegEmployees').value = item.employees || '45명';
  document.getElementById('mfrRegCert').value = item.cert || 'HACCP 인증';
  document.getElementById('mfrRegDate').value = item.regDate;
  
  // 피점검자 매핑
  const mfrRegManager = document.getElementById('mfrRegManager');
  if (mfrRegManager) {
    mfrRegManager.value = item.manager || '김제조';
  }
  
  // 기타 메모 매핑
  const mfrRegMemo = document.getElementById('mfrRegMemo');
  if (mfrRegMemo) {
    mfrRegMemo.value = item.memo || '공장 위해 관리 상태 우수.';
  }

  // OEM 라디오 및 거래업체 연동
  const oemRadio = document.querySelector('input[name="mfrRegType"][value="OEM"]');
  const generalRadio = document.querySelector('input[name="mfrRegType"][value="GENERAL"]');
  const oemSubSection = document.getElementById('mfrRegOemSubSection');
  const partnersContainer = document.getElementById('mfrSelectedPartnersContainer');

  if (item.type === 'OEM') {
    if (oemRadio) oemRadio.checked = true;
    if (oemSubSection) oemSubSection.style.display = 'flex';
    
    if (partnersContainer) {
      partnersContainer.innerHTML = '';
      const partnerName = item.partner || '주식회사 푸드링크';
      const chip = document.createElement('span');
      chip.className = 'partner-chip';
      chip.style.cssText = 'background:#cbd5e1; color:#0f172a; font-size:11px; font-weight:700; padding:4px 8px; border-radius:12px; display:inline-flex; align-items:center;';
      chip.textContent = partnerName;
      partnersContainer.appendChild(chip);
    }
  } else {
    if (generalRadio) generalRadio.checked = true;
    if (oemSubSection) oemSubSection.style.display = 'none';
  }

  // VHR 유형 라디오 매핑
  const vhrRadios = document.querySelectorAll('input[name="mfrRegVhr"]');
  vhrRadios.forEach(radio => {
    radio.checked = radio.value === item.vhr;
  });

  // 재점검 체크박스 매핑
  const recheckChk = document.getElementById('mfrRegRecheck');
  if (recheckChk) {
    recheckChk.checked = item.recheck === true;
  }
}

function openMfrDetail(item) {
  activeMfrItem = item;
  const mfrEvalView = document.getElementById('mfr-eval-view');
  const mfrDetailView = document.getElementById('mfr-detail-view');
  if (mfrEvalView) mfrEvalView.style.display = 'none';
  if (mfrDetailView) mfrDetailView.style.display = 'flex';

  document.getElementById('mfr-detail-company-select-wrapper').style.display = 'none';
  document.getElementById('mfr-detail-company-name-wrapper').style.display = 'block';
  document.getElementById('mfrDetailSummaryCard').style.display = 'block';
  document.getElementById('mfrInspectionSection').style.display = 'flex';
  document.getElementById('mfrDetailVerdictBar').style.display = 'flex';

  document.getElementById('mfrDetailCompanyNameText').textContent = item.name;
  document.getElementById('lblMfrDetailDiv').textContent = item.div;
  document.getElementById('lblMfrDetailBiz').textContent = item.biz;
  document.getElementById('lblMfrDetailVhr').textContent = item.vhr;
  document.getElementById('lblMfrDetailInspector').textContent = item.inspector || '김바이어';
  
  const managerInput = document.getElementById('mfrDetailManagerInput');
  if (managerInput) {
    managerInput.value = item.manager || '김제조';
  }

  // 1. OEM 제조사 전환 탭 및 거래업체(납품처) 연동 (지시사항 1)
  const rdoOem = document.getElementById('rdoMfrDetailOem');
  const rdoGeneral = document.getElementById('rdoMfrDetailGeneral');
  const oemSubSection = document.getElementById('mfrDetailOemSubSection');
  const partnersContainer = document.getElementById('mfrDetailSelectedPartnersContainer');

  const toggleOemSection = (type) => {
    if (type === 'OEM') {
      if (rdoOem) rdoOem.checked = true;
      if (rdoGeneral) rdoGeneral.checked = false;
      if (oemSubSection) oemSubSection.style.display = 'flex';
      
      if (partnersContainer) {
        partnersContainer.innerHTML = '';
        const partnerName = item.partner || '주식회사 푸드링크';
        const chip = document.createElement('span');
        chip.className = 'partner-chip';
        chip.style.cssText = 'background:#cbd5e1; color:#0f172a; font-size:11px; font-weight:700; padding:4px 8px; border-radius:12px; display:inline-flex; align-items:center;';
        chip.textContent = partnerName;
        partnersContainer.appendChild(chip);
      }
    } else {
      if (rdoOem) rdoOem.checked = false;
      if (rdoGeneral) rdoGeneral.checked = true;
      if (oemSubSection) oemSubSection.style.display = 'none';
    }
  };

  toggleOemSection(item.type);

  const handleRadioChange = (e) => {
    const selectedType = e.target.value;
    if (selectedType === 'OEM') {
      if (oemSubSection) oemSubSection.style.display = 'flex';
      if (partnersContainer) {
        partnersContainer.innerHTML = '';
        const chip = document.createElement('span');
        chip.className = 'partner-chip';
        chip.style.cssText = 'background:#cbd5e1; color:#0f172a; font-size:11px; font-weight:700; padding:4px 8px; border-radius:12px; display:inline-flex; align-items:center;';
        chip.textContent = '롯데백화점 본점';
        partnersContainer.appendChild(chip);
      }
    } else {
      if (oemSubSection) oemSubSection.style.display = 'none';
    }
  };

  if (rdoOem) rdoOem.onclick = handleRadioChange;
  if (rdoGeneral) rdoGeneral.onclick = handleRadioChange;

  const btnSearchPartner = document.getElementById('btnMfrDetailSearchPartner');
  if (btnSearchPartner) {
    btnSearchPartner.onclick = () => {
      if (partnersContainer) {
        const emptyTxt = document.getElementById('txtNoMfrDetailPartnerSelected');
        if (emptyTxt) emptyTxt.remove();
        
        const chip = document.createElement('span');
        chip.className = 'partner-chip';
        chip.style.cssText = 'background:#cbd5e1; color:#0f172a; font-size:11px; font-weight:700; padding:4px 8px; border-radius:12px; display:inline-flex; align-items:center; margin-right:4px;';
        chip.textContent = '롯데마트 잠실점';
        partnersContainer.appendChild(chip);
        showToast('거래업체 [롯데마트 잠실점]이 연동 칩으로 추가되었습니다.');
      }
    };
  }

  // 2. 재점검 대상 업체 여부 (지시사항 2)
  const recheckChk = document.getElementById('mfrDetailRecheck');
  if (recheckChk) {
    recheckChk.checked = item.recheck === true;
  }

  // 3. 총평 입력 바인딩 (지시사항 3)
  const commentInput = document.getElementById('mfrDetailCommentInput');
  if (commentInput) {
    commentInput.value = item.comment || '';
  }

  renderMfrChecklistQuestions();

  // 평가 및 개선 결과 영역에 더미 PDF 첨부파일 시뮬레이션
  populateDummyEvalFiles(item);
}

function populateDummyEvalFiles(item) {
  const evalGrid = document.getElementById('mfrRegImagePreviewGrid');
  const fileGrid = document.getElementById('mfrRegFilePreviewGrid');

  // 평가 등록 파일 더미
  const evalDummyFiles = [
    { name: `${item.name}_현장평가보고서_2026.pdf`, size: '2.4 MB' },
    { name: `위생점검_체크리스트_${item.name}.pdf`, size: '1.1 MB' }
  ];

  // 개선 조치 파일 더미
  const actionDummyFiles = [
    { name: `${item.name}_개선조치결과서_2026.pdf`, size: '3.7 MB' },
    { name: `시정조치_증빙자료_${item.name}.pdf`, size: '980 KB' },
    { name: `HACCP_인증서_사본.pdf`, size: '512 KB' }
  ];

  function createFileChip(file) {
    const chip = document.createElement('div');
    chip.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; width: 100%; box-sizing: border-box; transition: all 0.2s;';
    chip.innerHTML = `
      <div style="width: 36px; height: 36px; background: #fef2f2; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" style="width: 18px; height: 18px;">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      </div>
      <div style="flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0;">
        <span style="font-size: 12px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${file.name}</span>
        <span style="font-size: 10px; color: #94a3b8;">PDF • ${file.size}</span>
      </div>
      <span style="font-size: 10px; color: #10b981; font-weight: 700; background: #ecfdf5; padding: 2px 6px; border-radius: 4px; flex-shrink: 0;">업로드 완료</span>
    `;
    return chip;
  }

  if (evalGrid) {
    evalGrid.innerHTML = '';
    evalDummyFiles.forEach(f => evalGrid.appendChild(createFileChip(f)));
  }

  if (fileGrid) {
    fileGrid.innerHTML = '';
    actionDummyFiles.forEach(f => fileGrid.appendChild(createFileChip(f)));
  }
}

function renderMfrChecklistQuestions() {
  const container = document.getElementById('mfrChecklistQuestions');
  if (!container) return;
  container.innerHTML = '';

  const dummyQuestions = [
    { id: '1', category: '위생관리', item: '작업장 세척 소독 및 청결 상태 유지' },
    { id: '2', category: '보관관리', item: '보관 창고 온도 모니터링 적정성' }
  ];

  dummyQuestions.forEach((q, idx) => {
    const card = document.createElement('div');
    card.className = 'inspect-card';
    card.innerHTML = `
      <div class="inspect-card-header" style="position: relative;">
        <span class="item-num">점검 항목 ${idx + 1}</span>
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
          <h5 class="item-title" style="margin: 0;">${q.item}</h5>
          <button class="btn-help-guide" style="background: #e2e8f0; border: none; width: 16px; height: 16px; border-radius: 50%; cursor: pointer; color: #475569; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; font-family: sans-serif; transition: all 0.2s;" title="도움말 확인">?</button>
        </div>
        <p class="item-desc" style="margin-top: 4px;">[${q.category}] 현장 위해 요소 및 위생 지침 기준 적정성</p>
      </div>
      <div class="binary-control" data-qid="${q.id}">
        <button class="binary-btn btn-fit" data-result="fit">적합</button>
        <button class="binary-btn btn-unfit" data-result="unfit">부적합</button>
      </div>
      
      <div class="inspect-card-extra" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e2e8f0; display: flex; flex-direction: column; gap: 8px;">
        <button class="btn-item-detail-page" style="height: 36px; width: 100%; border: 1px dashed #cbd5e1; background: #ffffff; color: #475569; font-size: 12px; font-weight: 700; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; transition: all 0.2s;">
          상세 내용 및 증빙 사진 추가
        </button>
      </div>
    `;

    card.querySelector('.btn-help-guide').addEventListener('click', (e) => {
      e.stopPropagation();
      showToast(`[점검 기준] ${q.item}: ${q.category} 지침에 의거하여 청결/온도 기준을 준수해야 합니다.`);
    });

    card.querySelectorAll('.binary-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        card.querySelectorAll('.binary-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const badge = document.getElementById('mfrVerdictBadge');
        if (badge) {
          // 가상 동적 최종 판정 연계
          const isFit = e.target.classList.contains('btn-fit');
          badge.textContent = isFit ? '최종 적합' : '최종 부적합';
          badge.className = isFit ? 'val-verdict verdict-fit' : 'val-verdict verdict-unfit';
        }
      });
    });

    card.querySelector('.btn-item-detail-page').addEventListener('click', () => {
      const detailRegView = document.getElementById('mfr-item-detail-view');
      const mfrDetailView = document.getElementById('mfr-detail-view');
      if (mfrDetailView) mfrDetailView.style.display = 'none';
      if (detailRegView) detailRegView.style.display = 'flex';
      
      document.getElementById('mfrItemRegCategory').textContent = q.category;
      document.getElementById('mfrItemRegTitle').textContent = q.item;
      document.getElementById('mfrItemRegComment').value = '';
      
      const grid = document.getElementById('mfrItemRegPreviewGrid');
      if (grid) grid.innerHTML = '';
    });

    container.appendChild(card);
  });
}

// 제조사 문항별 상세 입력 닫기 및 저장
document.getElementById('btnMfrBackToDetailFromItem')?.addEventListener('click', () => {
  document.getElementById('mfr-item-detail-view').style.display = 'none';
  document.getElementById('mfr-detail-view').style.display = 'flex';
});

document.getElementById('btnMfrSaveItemDetails')?.addEventListener('click', () => {
  showToast('상세 내용이 저장되었습니다.');
  document.getElementById('mfr-item-detail-view').style.display = 'none';
  document.getElementById('mfr-detail-view').style.display = 'flex';
});

document.getElementById('mfrItemRegImageInput')?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    showToast(`사진 "${file.name}"이 임시 첨부되었습니다.`);
    const grid = document.getElementById('mfrItemRegPreviewGrid');
    if (grid) {
      grid.innerHTML = `<div class="preview-thumb"><img src="image_20afcc.png" alt="현장 사진 미리보기"><button class="btn-del-thumb" onclick="this.parentElement.remove()">&times;</button></div>`;
    }
  }
});


let previousMasterSearchViewId = 'buyer-register-view';

function openMasterSearch(type, prevId, title) {
  currentSearchType = type;
  previousMasterSearchViewId = prevId;
  const masterSearchPageTitle = document.getElementById('master-search-page-title');
  const masterSearchView = document.getElementById('master-search-view');
  const masterSearchInput = document.getElementById('masterSearchInput');

  if (masterSearchPageTitle) masterSearchPageTitle.textContent = title;
  
  const allViews = ['home-view', 'buyer-eval-view', 'buyer-detail-view', 'buyer-register-view', 'mfr-eval-view', 'mfr-register-view'];
  allViews.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  if (masterSearchView) masterSearchView.style.display = 'flex';
  if (masterSearchInput) masterSearchInput.value = '';
  renderMasterSearchCards();
}

function initMasterSearch() {
  const btnBuyerSearchMaster = document.getElementById('btnBuyerSearchMaster');
  const btnMfrCheckName = document.getElementById('btnMfrCheckName');
  const btnMfrCheckLicense = document.getElementById('btnMfrCheckLicense');
  const masterSearchView = document.getElementById('master-search-view');
  const btnBackFromMasterSearch = document.getElementById('btnBackFromMasterSearch');
  const masterSearchPageTitle = document.getElementById('master-search-page-title');
  const masterSearchInput = document.getElementById('masterSearchInput');
  const tabSearchCompany = document.getElementById('tabSearchCompany');
  const tabRegisterCompany = document.getElementById('tabRegisterCompany');
  const searchTabContent = document.getElementById('searchTabContent');
  const registerTabContent = document.getElementById('registerTabContent');
  const btnCreateNewMasterPage = document.getElementById('btnCreateNewMasterPage');
  
  let previousViewId = 'buyer-register-view';

  const openSearch = (type, prevId, title) => {
    currentSearchType = type;
    previousViewId = prevId;
    if (masterSearchPageTitle) masterSearchPageTitle.textContent = title;
    
    const allViews = ['home-view', 'buyer-eval-view', 'buyer-detail-view', 'buyer-register-view', 'mfr-eval-view', 'mfr-register-view'];
    allViews.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    if (masterSearchView) masterSearchView.style.display = 'flex';
    if (masterSearchInput) masterSearchInput.value = '';
    renderMasterSearchCards();
    
    // 진입 시 기본 탭 '업체 검색' 강제 트리거
    tabSearchCompany?.click();
  };

  btnBuyerSearchMaster?.addEventListener('click', () => openSearch('buyer', 'buyer-register-view', '신규 업체 등록'));
  btnMfrCheckName?.addEventListener('click', () => {
    const nameVal = document.getElementById('mfrRegName')?.value.trim();
    if (!nameVal) {
      showToast('제조사명을 입력해 주세요.');
      return;
    }
    showToast(`'${nameVal}'은(는) 등록 가능한 제조사명입니다.`);
  });

  btnMfrCheckLicense?.addEventListener('click', () => {
    const licenseVal = document.getElementById('mfrRegLicense')?.value.trim();
    if (!licenseVal) {
      showToast('사업자등록번호를 입력해 주세요.');
      return;
    }
    showToast(`'${licenseVal}'은(는) 등록 가능한 사업자번호입니다.`);
  });

  btnBackFromMasterSearch?.addEventListener('click', () => {
    if (masterSearchView) masterSearchView.style.display = 'none';
    const prev = document.getElementById(previousViewId);
    if (prev) prev.style.display = 'flex';
  });

  const masterRegisterActionsBar = document.getElementById('masterRegisterActionsBar');

  tabSearchCompany?.addEventListener('click', () => {
    tabSearchCompany.classList.add('active');
    tabRegisterCompany?.classList.remove('active');
    if (searchTabContent) searchTabContent.style.display = 'flex';
    if (registerTabContent) registerTabContent.style.display = 'none';
    if (masterRegisterActionsBar) masterRegisterActionsBar.style.display = 'none';
  });

  tabRegisterCompany?.addEventListener('click', () => {
    tabRegisterCompany.classList.add('active');
    tabSearchCompany?.classList.remove('active');
    if (searchTabContent) searchTabContent.style.display = 'none';
    if (registerTabContent) registerTabContent.style.display = 'flex';
    if (masterRegisterActionsBar) masterRegisterActionsBar.style.display = 'flex';
  });

  masterSearchInput?.addEventListener('input', () => renderMasterSearchCards());

  // 중복확인 단추들 (껍데기화: 무조건 통과 피드백 표시)
  document.getElementById('btnCheckMasterName')?.addEventListener('click', () => {
    const feedback = document.getElementById('nameCheckFeedback');
    if (feedback) {
      feedback.textContent = '사용 가능한 업체명입니다. (확인 완료)';
      feedback.className = 'success';
    }
    showToast('업체명 중복 검사 완료');
    isNameChecked = true;
  });

  document.getElementById('btnCheckMasterLicense')?.addEventListener('click', () => {
    const feedback = document.getElementById('licenseCheckFeedback');
    if (feedback) {
      feedback.textContent = '사용 가능한 사업자등록번호입니다. (확인 완료)';
      feedback.className = 'success';
    }
    showToast('사업자등록번호 중복 검사 완료');
    isLicenseChecked = true;
  });

  btnCreateNewMasterPage?.addEventListener('click', () => {
    const name = document.getElementById('newMasterName').value.trim();
    if (!name) {
      showToast('신규 업체명을 입력해 주세요.');
      return;
    }
    showToast(`신규 업체 "${name}" 등록이 완료되었습니다.`);
    
    // 자동 맵핑 처리
    const prefix = currentSearchType === 'buyer' ? 'reg' : 'mfrReg';
    const nameInput = document.getElementById(prefix + 'CompanyName') || document.getElementById('mfrRegName');
    
    if (nameInput) nameInput.value = name;
    
    if (masterSearchView) masterSearchView.style.display = 'none';
    const prev = document.getElementById(previousViewId);
    if (prev) prev.style.display = 'flex';
  });

  // 임시저장 버튼 리스너 연동
  document.getElementById('btnCreateNewMasterDraft')?.addEventListener('click', () => {
    const name = document.getElementById('newMasterName').value.trim();
    if (!name) {
      showToast('임시 저장할 업체명을 최소 한 글자 이상 입력해 주세요.');
      return;
    }
    showToast(`"${name}" 업체 등록 정보가 임시 저장되었습니다.`);
  });

  // 업태/VHR 유형 라벨 우측 도움말 가이드 (?) 클릭 연동
  masterSearchView?.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-info-badge')) {
      e.stopPropagation();
      const title = e.target.getAttribute('title') || '안내';
      if (title.includes('업태')) {
        showToast('[업태 분류 기준] 제조가공업 / 소분업 / 유통업 / 수입원 구분에 따른 기준 가이드라인입니다.');
      } else if (title.includes('VHR')) {
        showToast('[VHR 수준 기준] 위해 수준 및 유해 물질 등급에 따른 VHR(고위험), HR(중위험), R(일반) 분류 규격입니다.');
      }
    }
  });
}

function renderMasterSearchCards() {
  const grid = document.getElementById('masterSearchCardGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  const searchInput = document.getElementById('masterSearchInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  
  const filteredList = companyMasterList.filter(c => {
    if (!query) return true;
    const nameMatch = c.name.toLowerCase().includes(query);
    const cleanLicense = c.licenseNo.replace(/[^0-9]/g, '');
    const cleanQuery = query.replace(/[^0-9]/g, '');
    const licenseMatch = c.licenseNo.toLowerCase().includes(query) || (cleanQuery !== '' && cleanLicense.includes(cleanQuery));
    return nameMatch || licenseMatch;
  });

  if (filteredList.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #94a3b8; font-size: 13.5px;">
        검색 결과와 일치하는 업체가 없습니다.
      </div>
    `;
    return;
  }
  
  filteredList.forEach(c => {
    const card = document.createElement('div');
    card.className = 'master-company-card';
    card.style.padding = '12px 16px';
    card.innerHTML = `
      <span class="card-badge badge-vhr" style="top: 12px; right: 16px;">${c.vhr}</span>
      <h4 class="card-company-name" style="margin: 0 0 6px 0; font-size: 14px; font-weight: 800;">${c.name}</h4>
      <div class="card-info-row" style="font-size: 11px; color: #64748b;">
        <span>사업자번호: <strong>${c.licenseNo}</strong></span>
      </div>
    `;
    card.addEventListener('click', () => {
      const prefix = currentSearchType === 'buyer' ? 'reg' : 'mfrReg';
      const nameInput = document.getElementById(prefix + 'CompanyName') || document.getElementById('mfrRegName');
      const licenseInput = document.getElementById(prefix + 'License') || document.getElementById('mfrRegLicense');
      
      if (nameInput) nameInput.value = c.name;
      if (licenseInput) licenseInput.value = c.licenseNo;

      const masterSearchView = document.getElementById('master-search-view');
      const prev = document.getElementById(currentSearchType === 'buyer' ? 'buyer-register-view' : 'mfr-register-view');
      
      if (masterSearchView) masterSearchView.style.display = 'none';
      if (prev) prev.style.display = 'flex';
      showToast(`"${c.name}" 정보가 입력 폼에 맵핑되었습니다.`);
    });
    grid.appendChild(card);
  });
}

let previousEvalSearchViewId = 'buyer-eval-view';

function openEvalMasterSearch(type, prevId, title) {
  previousEvalSearchViewId = prevId;
  const pageTitle = document.getElementById('eval-master-search-page-title');
  const evalSearchView = document.getElementById('eval-master-search-view');
  const searchInput = document.getElementById('evalMasterSearchInput');

  if (pageTitle) pageTitle.textContent = title;
  
  // 모든 뷰 숨김
  const allViews = ['home-view', 'buyer-eval-view', 'buyer-detail-view', 'buyer-register-view', 'mfr-eval-view', 'mfr-register-view', 'master-search-view'];
  allViews.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  if (evalSearchView) evalSearchView.style.display = 'flex';
  if (searchInput) searchInput.value = '';
  
  // 상태 변수 초기화
  tempSelectedCompanyForEval = null;
  evalRegGeneralPhotos = [];
  const generalComment = document.getElementById('evalRegGeneralComment');
  if (generalComment) generalComment.value = '';
  renderEvalRegGeneralPreviews();

  const emptyCard = document.getElementById('evalRegSummaryCardEmpty');
  const summaryCard = document.getElementById('evalRegSummaryCard');
  if (emptyCard) emptyCard.style.display = 'flex';
  if (summaryCard) summaryCard.style.display = 'none';
  const questionsContainer = document.getElementById('evalRegChecklistQuestions');
  if (questionsContainer) questionsContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 13px;">평가 대상 업체를 선택하시면 점검 항목이 노출됩니다.</div>';

  renderEvalMasterSearchCards();
  
  // 기본 탭 '업체 검색' 강제 트리거
  document.getElementById('tabEvalSearchCompany')?.click();
}

function initEvalMasterSearch() {
  const evalSearchView = document.getElementById('eval-master-search-view');
  const btnBack = document.getElementById('btnBackFromEvalMasterSearch');
  const searchInput = document.getElementById('evalMasterSearchInput');
  const tabSearch = document.getElementById('tabEvalSearchCompany');
  const tabRegister = document.getElementById('tabEvalRegisterCompany');
  const searchContent = document.getElementById('searchEvalTabContent');
  const registerContent = document.getElementById('registerEvalTabContent');
  const actionsBar = document.getElementById('evalMasterRegisterActionsBar');
  const btnSubmit = document.getElementById('btnCreateNewEvalMasterPage');
  const btnDraft = document.getElementById('btnCreateNewEvalMasterDraft');

  btnBack?.addEventListener('click', () => {
    if (evalSearchView) evalSearchView.style.display = 'none';
    const prev = document.getElementById(previousEvalSearchViewId);
    if (prev) prev.style.display = 'flex';
  });

  tabSearch?.addEventListener('click', () => {
    tabSearch.classList.add('active');
    tabRegister?.classList.remove('active');
    if (searchContent) searchContent.style.display = 'flex';
    if (registerContent) registerContent.style.display = 'none';
    if (actionsBar) actionsBar.style.display = 'none';
  });

  tabRegister?.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabSearch?.classList.remove('active');
    if (searchContent) searchContent.style.display = 'none';
    if (registerContent) registerContent.style.display = 'flex';
    if (actionsBar) actionsBar.style.display = 'flex';
  });

  document.getElementById('btnGoToSearchTabFromEval')?.addEventListener('click', () => {
    tabSearch?.click();
  });

  searchInput?.addEventListener('input', () => renderEvalMasterSearchCards());

  // 종합 현장 사진 다건 업로드 이벤트 바인딩
  const generalImageInput = document.getElementById('evalRegGeneralImageInput');
  generalImageInput?.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      evalRegGeneralPhotos.push(file.name);
    });
    showToast(`${files.length}건의 현장 사진이 종합 추가되었습니다.`);
    renderEvalRegGeneralPreviews();
  });

  btnSubmit?.addEventListener('click', () => {
    if (!tempSelectedCompanyForEval) {
      showToast('평가할 업체를 먼저 검색하여 지정해 주세요.');
      return;
    }

    const answersList = Object.values(tempEvalAnswers);
    const incomplete = answersList.some(ans => ans.result === '');
    if (incomplete) {
      showToast('모든 점검 항목에 대해 적합 또는 부적합 판정을 선택해 주세요.');
      return;
    }

    const isUnfit = answersList.some(ans => ans.result === 'unfit');
    const finalStatus = isUnfit ? 'unfit' : 'fit';
    const newId = buyerMockData.length > 0 ? Math.max(...buyerMockData.map(d => d.id)) + 1 : 1;
    const unfitMemos = answersList.filter(ans => ans.result === 'unfit' && ans.memo).map(ans => ans.memo);
    
    // 점검 미비 사항 취합
    let finalComment = isUnfit 
      ? `일부 위생 항목 미비 발견: ${unfitMemos.join(', ') || '개선 조치 권고.'}` 
      : '특이사항 없으며 위생 상태 매우 양호함.';

    // 종합 상세 내용 기재 영역 연동
    const generalComment = document.getElementById('evalRegGeneralComment')?.value.trim() || '';
    if (generalComment) {
      finalComment += ` [종합 의견] ${generalComment}`;
    }

    const newEval = {
      id: newId,
      buyerId: 'BUYER_DEPT_01',
      storeName: '본점 (소공점)',
      name: tempSelectedCompanyForEval.name,
      date: new Date().toISOString().split('T')[0],
      div: tempSelectedCompanyForEval.div,
      biz: tempSelectedCompanyForEval.biz,
      vhr: tempSelectedCompanyForEval.vhr,
      express: false,
      status: finalStatus,
      comment: finalComment
    };

    buyerMockData.unshift(newEval);
    showToast(`"${tempSelectedCompanyForEval.name}" 평가 등록이 완료되었습니다.`);

    if (evalSearchView) evalSearchView.style.display = 'none';
    const buyerEvalView = document.getElementById('buyer-eval-view');
    if (buyerEvalView) buyerEvalView.style.display = 'flex';
    
    renderBuyerList(); // 리스트 갱신 (업체 관리 탭의 평가 결과 리스트)
  });

  btnDraft?.addEventListener('click', () => {
    showToast('평가 작성 중인 내용이 임시 저장되었습니다.');
  });
}

function renderEvalRegGeneralPreviews() {
  const grid = document.getElementById('evalRegGeneralPreviewGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (evalRegGeneralPhotos.length === 0) {
    grid.style.display = 'none';
    return;
  }

  grid.style.display = 'flex';
  evalRegGeneralPhotos.forEach((photoName, idx) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'item-thumb-wrapper';
    wrapper.style.cssText = 'position: relative; width: 70px; height: 70px; border-radius: 8px; overflow: hidden; border: 1px solid #cbd5e1; margin-right: 4px;';

    // 더미 사진 리스트 번갈아가며 로드
    const imgSrc = `https://picsum.photos/id/${30 + idx}/150/150`;

    wrapper.innerHTML = `
      <img src="${imgSrc}" alt="${photoName}" class="clickable-item-thumb" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" title="${photoName}">
      <button type="button" class="btn-del-item-thumb btn-del-file" style="position: absolute; top: 4px; right: 4px; width: 18px; height: 18px; border-radius: 50%; background: rgba(15, 23, 42, 0.75); border: none; color: #ffffff; font-size: 11px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 5;">&times;</button>
    `;

    wrapper.querySelector('.btn-del-file').addEventListener('click', () => {
      evalRegGeneralPhotos = evalRegGeneralPhotos.filter(name => name !== photoName);
      renderEvalRegGeneralPreviews();
    });

    grid.appendChild(wrapper);
  });
}

function renderEvalMasterSearchCards() {
  const grid = document.getElementById('evalMasterSearchCardGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  const searchInput = document.getElementById('evalMasterSearchInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  
  const filteredList = companyMasterList.filter(c => {
    if (!query) return true;
    const nameMatch = c.name.toLowerCase().includes(query);
    const cleanLicense = c.licenseNo.replace(/[^0-9]/g, '');
    const cleanQuery = query.replace(/[^0-9]/g, '');
    const licenseMatch = c.licenseNo.toLowerCase().includes(query) || (cleanQuery !== '' && cleanLicense.includes(cleanQuery));
    return nameMatch || licenseMatch;
  });

  if (filteredList.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #94a3b8; font-size: 13.5px;">
        검색 결과와 일치하는 업체가 없습니다.
      </div>
    `;
    return;
  }
  
  filteredList.forEach(c => {
    const card = document.createElement('div');
    card.className = 'master-company-card';
    card.style.padding = '12px 16px';
    card.innerHTML = `
      <span class="card-badge badge-vhr" style="top: 12px; right: 16px;">${c.vhr}</span>
      <h4 class="card-company-name" style="margin: 0 0 6px 0; font-size: 14px; font-weight: 800;">${c.name}</h4>
      <div class="card-info-row" style="font-size: 11px; color: #64748b;">
        <span>사업자번호: <strong>${c.licenseNo}</strong></span>
      </div>
    `;
    card.addEventListener('click', () => {
      tempSelectedCompanyForEval = c;
      tempEvalAnswers = {
        'C01': { result: '', memo: '', photos: [], files: [] },
        'C02': { result: '', memo: '', photos: [], files: [] },
        'C03': { result: '', memo: '', photos: [], files: [] }
      };

      const emptyCard = document.getElementById('evalRegSummaryCardEmpty');
      const summaryCard = document.getElementById('evalRegSummaryCard');
      if (emptyCard) emptyCard.style.display = 'none';
      if (summaryCard) summaryCard.style.display = 'flex';

      const cName = document.getElementById('evalRegCompanyName');
      const cVhr = document.getElementById('evalRegCompanyVhr');
      const cDiv = document.getElementById('evalRegCompanyDiv');
      const cBiz = document.getElementById('evalRegCompanyBiz');
      const cLicense = document.getElementById('evalRegCompanyLicense');

      if (cName) cName.textContent = c.name;
      if (cVhr) {
        cVhr.textContent = c.vhr;
        let vhrStyle = 'background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;'; // R
        if (c.vhr === 'VHR') vhrStyle = 'background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2;';
        else if (c.vhr === 'HR') vhrStyle = 'background: #fffbeb; color: #d97706; border: 1px solid #fef3c7;';
        cVhr.style.cssText = vhrStyle + ' font-weight: 800; font-size: 11px; padding: 3px 8px; border-radius: 6px;';
      }
      if (cDiv) cDiv.textContent = c.div;
      if (cBiz) cBiz.textContent = c.biz;
      if (cLicense) cLicense.textContent = c.licenseNo;

      renderRegisterChecklistQuestions();
      document.getElementById('tabEvalRegisterCompany')?.click();
      showToast(`"${c.name}" 평가 화면이 준비되었습니다.`);
    });
    grid.appendChild(card);
  });
}

// 8대 메뉴 클릭 시 햅틱 피드백 가상 동작 (토스트 노출) - 바이어/제조사를 제외한 메뉴들
const menuButtons = document.querySelectorAll('.menu-item, .btn-shop-reg');
menuButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const id = btn.id;
    if (id === 'menu_buyer' || id === 'menu_factory') return;
    const name = btn.querySelector('.menu-title, span')?.textContent || '모듈';
    showToast(`[${name}] 모듈로 진입합니다. (프로토타입 데모)`);
  });
});

// 바이어 평가 헤더 플러스 버튼 클릭 -> 탭에 따라 각각의 독립된 검색 뷰 열기
document.getElementById('btnHeaderAdd')?.addEventListener('click', () => {
  const isEvalTabActive = document.getElementById('btn-tab-eval')?.classList.contains('active');
  if (isEvalTabActive) {
    // 평가 관리 플러스 클릭 시 ➡️ 독립 뷰인 eval-master-search-view 노출
    openEvalMasterSearch('buyer', 'buyer-eval-view', '평가 대상 업체 검색');
  } else {
    // 업체 관리 플러스 클릭 시 ➡️ 기존 master-search-view 노출
    openMasterSearch('buyer', 'buyer-eval-view', '신규 업체 등록');
    
    // 신규 모드로 타이틀 및 버튼 복원
    const regView = document.getElementById('buyer-register-view');
    if (regView) {
      const titleEl = regView.querySelector('.header-title');
      if (titleEl) titleEl.textContent = '신규 업체 등록';
      const btnSubmit = document.getElementById('btnSubmitRegister');
      if (btnSubmit) btnSubmit.textContent = '업체 등록 완료';
    }

    // Express 체크박스 초기화 및 카운트 실시간 업데이트
    const expressChk = document.getElementById('regExpress');
    if (expressChk) {
      expressChk.checked = false;
      expressChk.disabled = false;
    }
    updateExpressCountUI();

    const regCompanyName = document.getElementById('regCompanyName');
    if (regCompanyName) regCompanyName.value = '';
    const regLicense = document.getElementById('regLicense');
    if (regLicense) regLicense.value = '';
  }
});

// 바이어 등록 뒤로가기
document.getElementById('btnBackToEvalFromReg')?.addEventListener('click', () => {
  const regView = document.getElementById('buyer-register-view');
  if (regView) regView.style.display = 'none';
  const evalView = document.getElementById('buyer-eval-view');
  if (evalView) evalView.style.display = 'flex';
});

// 거래업체 더미데이터 리스트 (12개)
const partnerDummyList = [
  { id: 'P01', name: '(주)롯데웰푸드', category: '과자/빙과/육가공' },
  { id: 'P02', name: '(주)농심', category: '라면/스낵/그로서리' },
  { id: 'P03', name: '(주)오뚜기', category: '라면/조미/즉석식품' },
  { id: 'P04', name: '(주)CJ제일제당', category: '육가공/가공식품' },
  { id: 'P05', name: '(주)풀무원', category: '두부/신선식품/가공' },
  { id: 'P06', name: '(주)동원F&B', category: '참치/수산가공/유제품' },
  { id: 'P07', name: '(주)대상', category: '장류/조미료/가공식품' },
  { id: 'P08', name: '(주)SPC삼립', category: '베이커리/디저트' },
  { id: 'P09', name: '(주)매일유업', category: '유제품/음료/치즈' },
  { id: 'P10', name: '(주)남양유업', category: '우유/분유/커피음료' },
  { id: 'P11', name: '(주)하림', category: '닭고기/오리/육가공' },
  { id: 'P12', name: '(주)빙그레', category: '아이스크림/유제품' }
];

let tempSelectedPartners = new Set();

function initPartnerModal() {
  const btnMfrSearchPartner = document.getElementById('btnMfrSearchPartner');
  const mfrPartnerSearchModal = document.getElementById('mfrPartnerSearchModal');
  const btnMfrClosePartnerModal = document.getElementById('btnMfrClosePartnerModal');
  const btnMfrCancelPartnerSelect = document.getElementById('btnMfrCancelPartnerSelect');
  const btnMfrApplyPartnerSelect = document.getElementById('btnMfrApplyPartnerSelect');
  const mfrPartnerSearchInput = document.getElementById('mfrPartnerSearchInput');
  const chkPartnerSelectAll = document.getElementById('chk-partner-select-all');

  function updateApplyButtonText() {
    if (btnMfrApplyPartnerSelect) {
      btnMfrApplyPartnerSelect.textContent = `선택 적용 (${tempSelectedPartners.size}개)`;
    }
  }

  // 모달 열기
  btnMfrSearchPartner?.addEventListener('click', () => {
    tempSelectedPartners.clear();
    // 기존에 컨테이너에 선택된 칩이 있으면 그 값들을 불러오기
    const chips = document.querySelectorAll('#mfrSelectedPartnersContainer .partner-chip-name');
    chips.forEach(c => tempSelectedPartners.add(c.textContent.trim()));

    if (mfrPartnerSearchInput) mfrPartnerSearchInput.value = '';
    if (chkPartnerSelectAll) chkPartnerSelectAll.checked = (tempSelectedPartners.size === partnerDummyList.length);
    
    renderPartnerModalList('');
    updateApplyButtonText();
    
    if (mfrPartnerSearchModal) mfrPartnerSearchModal.classList.add('show');
  });

  // 모달 닫기
  btnMfrClosePartnerModal?.addEventListener('click', () => {
    if (mfrPartnerSearchModal) mfrPartnerSearchModal.classList.remove('show');
  });
  btnMfrCancelPartnerSelect?.addEventListener('click', () => {
    if (mfrPartnerSearchModal) mfrPartnerSearchModal.classList.remove('show');
  });

  // 실시간 검색
  mfrPartnerSearchInput?.addEventListener('input', (e) => {
    renderPartnerModalList(e.target.value.trim());
  });

  // 전체 선택 / 해제
  chkPartnerSelectAll?.addEventListener('change', (e) => {
    const checked = e.target.checked;
    const checkboxes = document.querySelectorAll('#mfrPartnerSearchList input[type="checkbox"]');
    checkboxes.forEach(chk => {
      const val = chk.value;
      chk.checked = checked;
      
      // 디자인 클래스 및 데이터 갱신
      const labelCard = chk.closest('label');
      if (checked) {
        tempSelectedPartners.add(val);
        if (labelCard) {
          labelCard.style.borderColor = '#0f172a';
          labelCard.style.background = '#f1f5f9';
        }
      } else {
        tempSelectedPartners.delete(val);
        if (labelCard) {
          labelCard.style.borderColor = '#e2e8f0';
          labelCard.style.background = '#f8fafc';
        }
      }
    });
    updateApplyButtonText();
  });

  // 선택 완료 확정
  btnMfrApplyPartnerSelect?.addEventListener('click', () => {
    const container = document.getElementById('mfrSelectedPartnersContainer');
    if (!container) return;

    container.innerHTML = '';
    if (tempSelectedPartners.size === 0) {
      container.innerHTML = '<span style="font-size: 12px; color: #94a3b8; align-self: center; margin-left: 4px;" id="txtNoPartnerSelected">선택된 거래업체가 없습니다.</span>';
      const mfrRegPartner = document.getElementById('mfrRegPartner');
      if (mfrRegPartner) mfrRegPartner.value = '';
    } else {
      const namesArray = Array.from(tempSelectedPartners);
      const mfrRegPartner = document.getElementById('mfrRegPartner');
      if (mfrRegPartner) mfrRegPartner.value = namesArray.join(',');

      namesArray.forEach(name => {
        const chip = document.createElement('div');
        chip.className = 'partner-chip';
        chip.style.cssText = 'display: inline-flex; align-items: center; gap: 4px; padding: 6px 10px; background: #e2e8f0; color: #475569; border-radius: 8px; font-size: 11px; font-weight: 700; margin: 2px;';
        chip.innerHTML = `
          <span class="partner-chip-name">${name}</span>
          <span class="btn-remove-partner" style="cursor: pointer; font-size: 12px; line-height: 1; font-weight: 800; color: #94a3b8; transition: color 0.2s;" onmouseover="this.style.color='#f43f5e'" onmouseout="this.style.color='#94a3b8'">&times;</span>
        `;
        chip.querySelector('.btn-remove-partner').addEventListener('click', () => {
          tempSelectedPartners.delete(name);
          chip.remove();
          if (container.querySelectorAll('.partner-chip').length === 0) {
            container.innerHTML = '<span style="font-size: 12px; color: #94a3b8; align-self: center; margin-left: 4px;" id="txtNoPartnerSelected">선택된 거래업체가 없습니다.</span>';
            if (mfrRegPartner) mfrRegPartner.value = '';
          } else {
            if (mfrRegPartner) mfrRegPartner.value = Array.from(tempSelectedPartners).join(',');
          }
        });
        container.appendChild(chip);
      });
    }

    if (mfrPartnerSearchModal) mfrPartnerSearchModal.classList.remove('show');
    showToast(`${tempSelectedPartners.size}개의 거래업체가 지정되었습니다.`);
  });
}

function renderPartnerModalList(keyword = '') {
  const listDiv = document.getElementById('mfrPartnerSearchList');
  if (!listDiv) return;

  listDiv.innerHTML = '';
  const filtered = partnerDummyList.filter(p => p.name.includes(keyword) || p.category.includes(keyword));

  if (filtered.length === 0) {
    listDiv.innerHTML = '<p style="text-align: center; color: #94a3b8; font-size: 12px; margin: 20px 0;">검색 결과가 없습니다.</p>';
    return;
  }

  filtered.forEach(p => {
    const isChecked = tempSelectedPartners.has(p.name);
    const card = document.createElement('label');
    card.style.cssText = 'display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; cursor: pointer; transition: all 0.2s;';
    card.innerHTML = `
      <input type="checkbox" value="${p.name}" ${isChecked ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: #0f172a; cursor: pointer;">
      <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
        <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${p.name}</span>
        <span style="font-size: 10px; color: #64748b;">${p.category}</span>
      </div>
    `;

    const chk = card.querySelector('input[type="checkbox"]');
    chk.addEventListener('change', (e) => {
      const btnMfrApplyPartnerSelect = document.getElementById('btnMfrApplyPartnerSelect');
      if (e.target.checked) {
        tempSelectedPartners.add(p.name);
        card.style.borderColor = '#0f172a';
        card.style.background = '#f1f5f9';
      } else {
        tempSelectedPartners.delete(p.name);
        card.style.borderColor = '#e2e8f0';
        card.style.background = '#f8fafc';
      }
      
      // 전체 선택 상태 업데이트
      const chkPartnerSelectAll = document.getElementById('chk-partner-select-all');
      if (chkPartnerSelectAll) {
        chkPartnerSelectAll.checked = (tempSelectedPartners.size === partnerDummyList.length);
      }
      
      if (btnMfrApplyPartnerSelect) {
        btnMfrApplyPartnerSelect.textContent = `선택 적용 (${tempSelectedPartners.size}개)`;
      }
    });

    if (isChecked) {
      card.style.borderColor = '#0f172a';
      card.style.background = '#f1f5f9';
    }

    listDiv.appendChild(card);
  });
}

// 초기화 시작
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupNoticeAnimation);

// 즉시 실행 (HMR 핫리로드 발생 시 DOMContentLoaded가 다시 실행되지 않는 상황 보완)
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  init();
}
