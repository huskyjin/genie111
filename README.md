# [디자인 가이드] 하이지니 백화점 상품 안전성 Buyer 평가 모듈 UI

본 가이드는 하이지니 백화점 상품 안전성 관리 시스템의 핵심 기능인 **'Buyer 평가'** 모듈의 UX/UI 스펙과 구현된 프론트엔드 코드 사양을 정의합니다. 제공된 디자인 리소스(`image_20afe6.png`, `image_20afcc.png`)를 100% 매칭하여 모바일 최적화 웹 UI로 구축되었습니다.

---

## 🎨 1. 디자인 시스템 정의 (Design Tokens)

### 1) 컬러 팔레트 (Color Palette)
*   **배경색 (Background):** `#ffffff` (화이트 배경 기반의 깔끔하고 미니멀한 톤)
*   **포인트 브랜드 컬러 (Brand Color):** `#2563eb` (신뢰감을 주는 파란색 계열, 적용하기 등 주요 강조 요소 적용)
*   **중립 그레이 톤 (Neutral Grays):**
    *   `#f8fafc` (탭 컨테이너 배경 등 보조 영역)
    *   `#cbd5e1` (입력 폼 및 체크박스 테두리선)
    *   `#f1f5f9` (얇은 구분선 및 카드 테두리)
    *   `#475569` (서브 타이틀 및 레이블 텍스트)
*   **상태 표현 컬러 (Status Colors):**
    *   **적합:** 배경 `#f0fdf4` / 글자 `#16a34a` (초록)
    *   **부적합:** 배경 `#fef2f2` / 글자 `#dc2626` (빨강)
    *   **대기:** 배경 `#fffbeb` / 글자 `#d97706` (주황)
    *   **Express 긴급:** 배경 `rgba(237, 28, 36, 0.08)` / 글자 `#ed1c24` (롯데 레드 테두리선 강조)

### 2) 타이포그래피 (Typography)
*   **메인 서체:** Noto Sans KR (국문) / Inter (영문 및 숫자)
*   **카드 타이틀:** `16px`, `Font-Weight: 700` (Bold)
*   **입력 폼 레이블:** `13px`, `Font-Weight: 700` (Bold, `#475569`)
*   **콘텐츠 정보 및 뱃지:** `13px`, `Font-Weight: 600` (Medium) / `11px` (뱃지 텍스트)

### 3) Layout 및 여백 (Layout & Spacing)
*   **카드 테두리 및 라운딩:** `border-radius: 18px`, `border: 1px solid #f1f5f9` (가볍고 슬림한 경계선 처리)
*   **입력 폼 박스:** `height: 44px`, `border-radius: 12px`, `border: 1px solid #cbd5e1` (얇은 그레이 박스 스타일)
*   **컨테이너 여백:** 콘텐츠 영역 내부 패딩 `15px`~`20px`을 균등 부여하여 높은 시인성과 호흡감 제공.

---

## 📱 2. 화면 구성 사양 (UI Specification)

### 📋 [화면 1] 필터 조건 검색 오버레이 (image_20afe6.png 스타일)
*   **날짜 범위 선택:** 시작일과 종료일 input[type="date"]를 가로형 세그먼트로 정밀 배치.
*   **드롭다운 선택:** 사업부(Div.) 및 업태(Biz) 선택 셀렉트 박스. 우측에 커스텀 화살표 SVG 디렉티브 배치.
*   **VHR 유형 다중 선택:** 커스텀 가로형 체크박스 세그먼트 (VHR, HR, R). 브라우저 기본 체크박스를 숨기고 브랜드 블루로 커스텀 스타일링된 `.chk-box` 적용.
*   **Express 긴급 구분:** 하이라이트된 붉은색 톤 체크박스 카드로 구현하여 한눈에 중요도를 파악할 수 있도록 구성.
*   **하단 버튼 액션:** 초기화(좌측, 연그레이 톤) 및 적용하기(우측, 브랜드 블루 톤)로 중요도 계층 분리.

### 🗂️ [화면 2] 평가 결과 리스트 (image_20afcc.png 스타일)
*   **상태 구분 탭:** 전체 / 적합 / 부적합 3단 알약 스타일(Pill Type)의 탭 메뉴. 선택된 항목은 흰색 배경 카드로 음각 돌출 효과 부여.
*   **결과 리스트 카드:**
    *   **헤더 영역:** 업체명과 우측 정렬된 뱃지 레이아웃 (Express 배지 및 적합/부적합 상태 배지 병렬 노출).
    *   **상세 그리드:** 카드 하단을 dashed 선으로 구분한 뒤, 2열 격자형(Grid) 정보 필드 배치.
        *   *(사업부, 업태, VHR 유형, 평가 등록일)*
    *   **클릭 피드백:** 카드 클릭 시 부드럽게 줄어드는 모바일 햅틱 스케일 효과(`scale(0.98)`)와 모의 상세 화면 진입 토스트 메시지 표출.
    *   **검색 결과 없음 (Empty State):** 필터링 결과가 0건일 때 미니멀한 알림 아이콘과 경고 텍스트 템플릿 출력.

---

## 📸 3. 원본 피그마 시안 비교

| 필터 검색 조건 페이지 (image_20afe6) | 결과 리스트 조회 페이지 (image_20afcc) |
| :---: | :---: |
| ![필터 시안](file:///c:/Users/user/Downloads/mprd_project_2026/higenie_v2/image_20afe6.png) | ![리스트 시안](file:///c:/Users/user/Downloads/mprd_project_2026/higenie_v2/image_20afcc.png) |

---

## 💻 4. 적용된 핵심 소스 코드 구조

### 1) HTML 마크업 (Fragment)
```html
<div id="buyer-eval-view" class="view-container" style="display: none;">
  <!-- 헤더 -->
  <header class="main-header buyer-header">
    <button id="btnBackToHome">...</button>
    <h2>Buyer 평가</h2>
    <button id="btnOpenFilter">...</button>
  </header>
  <!-- 탭 메뉴 -->
  <div class="tab-container">
    <button class="tab-item active" data-tab="all">전체</button>
    ...
  </div>
  <!-- 결과 카드 목록 -->
  <div class="buyer-eval-list" id="buyerEvalList"></div>
</div>
```

### 2) CSS 스타일 가이드 (Fragment)
```css
.eval-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.btn-filter-apply {
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
  border-radius: 14px;
}
```

### 3) JS 시뮬레이터 (Fragment)
```javascript
// 모의 데이터를 필터 객체와 비교하여 동적으로 리스트 카드를 빌드 및 마크업 삽입
const filtered = buyerMockData.filter(item => {
  if (buyerActiveTab !== 'all' && item.status !== buyerActiveTab) return false;
  if (item.date < buyerFilters.dateStart || item.date > buyerFilters.dateEnd) return false;
  ...
  return true;
});
```
