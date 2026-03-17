# 🏠 아파트 갈아타기 계산기

공공데이터포털(data.go.kr) 실거래가 API를 이용하여 **내 아파트**와 **목표 아파트**의 매매 가격 차이를 계산하는 웹 앱입니다.

> 이 프로젝트는 **[Google Antigravity](https://blog.google/technology/google-deepmind/gemini-model-thinking-updates-march-2025/)** 를 통해 만들어졌습니다.

---

## ✨ 주요 기능

- **실거래가 조회** — 국토교통부 아파트매매 실거래 상세 자료 API 연동
- **지역 및 아파트 검색** — 시/도, 구/군 선택 및 아파트명 직접 검색 지원
- **기간 자동 필터** — 이름만 검색 시 최근 6개월 거래 내역 자동 조회 가능
- **다국어 지원 (i18n)** — 한국어(KR) 및 영어(EN) 언어 토글 기능
- **평수 필터** — 전용면적(㎡)을 평으로 변환하여 필터링
- **단지별 필터** — 아파트 단지별 거래 건수 및 타입 수 표시
- **갈아타기 비교** — 두 아파트의 실거래가 차이를 한눈에 확인
- **상세 비교표** — 면적, 층, 건축년도, 거래일 등 상세 비교
- **시세 추이 차트** — 두 아파트의 최근 6개월간 평균 거래가 비교 차트 제공
- **주변 시세 비교** — 내 아파트와 목표 아파트 각각의 주변 단지 평당가 순위 비교
- **카카오맵 연동** — 선택한 아파트의 위치를 지도에 표시 (옵션)

## 📸 스크린샷

<p align="center">
  <em>시/도, 구/군, 거래년월을 선택하고 조회 버튼을 누르면 실거래 데이터를 볼 수 있습니다.</em>
</p>

---

## 🚀 시작하기

### 1. 프로젝트 클론

```bash
git clone https://github.com/YOUR_USERNAME/apartment-gap-calculator.git
cd apartment-gap-calculator
```

### 2. API 키 발급 (무료)

이 앱은 [공공데이터포털](https://www.data.go.kr)의 API를 사용합니다. 무료로 키를 발급받을 수 있습니다.

1. [data.go.kr](https://www.data.go.kr) 회원가입 및 로그인
2. [국토교통부_아파트매매 실거래 상세 자료](https://www.data.go.kr/data/15057511/openapi.do) 페이지로 이동
3. **활용 신청** 클릭 (즉시 승인)
4. **마이페이지 → 오픈API** 에서 **Decoding 키** 복사

> ⚠️ 신규 발급된 키는 활성화까지 **최대 1시간**이 소요될 수 있습니다.

### 3. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 다음과 같이 필수 및 선택 API 키를 입력합니다:

```
# [필수] data.go.kr Decoding 키
API_KEY=your_decoding_key_here

# [선택] 카카오 지도 표출을 위한 JavaScript API 키 (안 넣으면 지도 기능 숨김)
KAKAO_KEY=your_kakao_javascript_key_here
```

### 4. 서버 실행

```bash
node server.js
```

브라우저에서 **http://localhost:3456** 접속하면 바로 사용할 수 있습니다.

---

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | HTML, CSS (Vanilla), JavaScript |
| **Backend** | Node.js (내장 모듈만 사용, 별도 의존성 없음) |
| **API** | 공공데이터포털 — 국토교통부 아파트매매 실거래 상세 자료 |
| **디자인** | 다크 모드, 글래스모피즘, Inter 폰트 |

## 📁 프로젝트 구조

```
├── server.js        # Node.js 서버 (정적 파일 + API 프록시)
├── index.html       # 메인 페이지
├── main.js          # 클라이언트 로직 (검색, 필터, 갈아타기 비교)
├── style.css        # 디자인 시스템
├── .env             # API 키 (gitignore 대상)
├── .env.example     # .env 예시 파일
├── .gitignore
└── package.json
```

## 📡 API 구조

서버(`server.js`)가 data.go.kr API의 프록시 역할을 합니다:

```
브라우저  →  localhost:3456/api/apt-trade  →  apis.data.go.kr
                     (XML → JSON 변환)
```

| 파라미터 | 설명 | 예시 |
|----------|------|------|
| `LAWD_CD` | 법정동 코드 (5자리) | `11680` (강남구) |
| `DEAL_YMD` | 거래년월 (6자리) | `202602` |
| `numOfRows` | 조회 건수 | `1000` |

## 📄 라이선스

MIT License

## 🙏 데이터 출처

- [공공데이터포털](https://www.data.go.kr) — 국토교통부 아파트매매 실거래 상세 자료
