# 아주대학교병원 의료빅데이터센터 데이터 포털

연구용 데이터 추출·가공 서비스 신청 및 관리 시스템

## 시작하기

### 요구사항

- Python 3.11+
- Node.js 18+
- npm 9+

### 백엔드 설치 및 실행

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 10402
```

### 프론트엔드 설치 및 실행

```bash
cd frontend
npm install
npm run dev -- -p 10401
```

### Docker로 실행 (선택사항)

```bash
docker-compose up
```

## 접속 정보

- 프론트엔드: http://localhost:10401
- 백엔드 API: http://localhost:10402
- API 문서: http://localhost:10402/docs

## 기본 계정

시스템 초기 실행 시 회원가입을 통해 계정을 생성하세요.

## 주요 기능

### 연구자
- 데이터 추출·가공 신청서 작성 및 제출
- 신청 현황 확인 및 추적
- 승인된 데이터 다운로드

### 관리자
- 신청서 검토 및 승인/반려
- 사용자 계정 관리
- 시스템 통계 모니터링

## 개발 문서

자세한 개발 가이드는 [CLAUDE.md](CLAUDE.md)를 참조하세요.