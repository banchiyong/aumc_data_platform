# 아주대학교병원 의료빅데이터센터 연구용 데이터 추출·가공 서비스 신청 및 관리 시스템

## 📌 프로젝트 개요

**프로젝트명**: 아주대학교병원 의료빅데이터센터 연구용 데이터 추출·가공 서비스 신청 및 관리 시스템

**목적**: 
연구자가 임상/의료 빅데이터 활용을 위해 데이터 추출·가공을 신청하고, 관리자가 이를 검토·승인·처리하여 연구에 필요한 데이터를 안전하게 제공할 수 있도록 지원하는 플랫폼 구축

**대상 사용자**:
- 연구자(데이터 신청 및 활용자)
- 관리자(신청 검토 및 데이터 제공 담당자)

**기대 효과**:
- 신청·승인·가공 프로세스의 전산화 및 투명성 확보
- 연구자-관리자 간 원활한 커뮤니케이션 및 진행 상태 추적
- 데이터 보안 및 접근 이력 관리 강화

## 📌 기능 요구사항

### 1. 사용자 관리
- **연구자 계정**: 회원가입, 로그인, 정보 수정, 비활성화 요청
- **관리자 계정**: 계정 생성/삭제, 권한 관리, 활성/비활성화, 대시보드 접근

### 2. 신청 프로세스 (Workflow)
- **상태 흐름**: DRAFT → SUBMITTED → UNDER_REVIEW → (APPROVED/REJECTED/REVISION_REQUESTED) → PROCESSING → COMPLETED
- **연구자 신청**: 연구 과제 정보, 데이터 요구사항, 가공 옵션 선택
- **관리자 검토**: 승인, 반려, 수정 요청 (사유 필수 입력)
- **데이터 처리**: ETL/가공 작업 진행 및 완료 처리

### 3. 연구자 기능
- 신청서 작성/제출
- 신청 현황 확인 (진행 단계 타임라인)
- 수정 요청 시 재작성 및 재제출
- 완료된 데이터 다운로드
- 다운로드 내역 확인

### 4. 관리자 기능
- **신청 관리**: 목록 조회, 상세 검토, 상태 변경
- **계정 관리**: 사용자 계정 CRUD, 권한 변경
- **데이터 처리 관리**: 진행 상태 모니터링
- **통계/리포트**: 신청 건수, 승인율, 처리 기간 분석

### 5. 시스템 공통 요구사항
- **보안**: JWT 기반 인증, SSL 통신, 접근 제어
- **로그/감사**: 모든 액션 이력 기록
- **UI/UX**: 데스크탑 기준 반응형 UI
- **확장성**: FastAPI 기반 RESTful API

## 🛠 기술 스택

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (개발 환경)
- **ORM**: SQLAlchemy
- **Authentication**: JWT (PyJWT)
- **Migration**: Alembic
- **Port**: 10402

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: shadcn/ui
- **HTTP Client**: 서버사이드 fetch API
- **Port**: 10401

### 중요 아키텍처 결정사항
- **모든 백엔드 API 호출은 서버사이드에서 진행** (Next.js Server Components / Server Actions 활용)
- **클라이언트에서 직접 백엔드 API 호출 금지** (보안 강화)
- **백엔드 포트**: 10402
- **프론트엔드 포트**: 10401

## 📁 프로젝트 구조

```
data_portal/
├── backend/               # FastAPI 백엔드
│   ├── app/
│   │   ├── api/          # API 엔드포인트
│   │   ├── core/         # 설정, 보안
│   │   ├── db/           # 데이터베이스 모델, 스키마
│   │   ├── services/     # 비즈니스 로직
│   │   └── main.py       # FastAPI 앱 진입점
│   └── requirements.txt
│
├── frontend/             # Next.js 프론트엔드
│   ├── app/              # App Router
│   │   ├── api/          # API Routes (백엔드 통신)
│   │   ├── (auth)/       # 인증 관련 페이지
│   │   ├── researcher/   # 연구자 페이지
│   │   ├── admin/        # 관리자 페이지
│   │   └── layout.tsx    # 루트 레이아웃
│   ├── components/       # UI 컴포넌트
│   ├── lib/              # 유틸리티, 서버 액션
│   └── package.json
│
└── docker-compose.yml    # 개발 환경 설정
```

## 🚀 개발 가이드

### 환경 설정

1. **백엔드 실행**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 10402
```

2. **프론트엔드 실행**
```bash
cd frontend
npm install
npm run dev -- -p 10401
```

3. **데이터베이스 마이그레이션**
```bash
cd backend
alembic upgrade head
```

### API 엔드포인트

#### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/refresh` - 토큰 갱신
- `GET /api/auth/me` - 현재 사용자 정보

#### 신청 관리
- `GET /api/applications` - 신청 목록 조회
- `POST /api/applications` - 신청서 작성
- `GET /api/applications/{id}` - 신청 상세 조회
- `PUT /api/applications/{id}` - 신청서 수정
- `POST /api/applications/{id}/submit` - 신청서 제출
- `POST /api/applications/{id}/review` - 신청 검토 (관리자)
- `GET /api/applications/{id}/download` - 결과 데이터 다운로드

#### 사용자 관리 (관리자)
- `GET /api/admin/users` - 사용자 목록
- `PUT /api/admin/users/{id}` - 사용자 정보 수정
- `DELETE /api/admin/users/{id}` - 사용자 삭제
- `POST /api/admin/users/{id}/toggle-active` - 계정 활성/비활성화

#### 통계 (관리자)
- `GET /api/admin/statistics` - 통계 대시보드 데이터

### Next.js 서버사이드 API 호출 패턴

```typescript
// app/lib/api.ts - 서버사이드 API 클라이언트
async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`http://localhost:10402${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error('API request failed');
  }
  
  return response.json();
}

// app/researcher/applications/page.tsx - Server Component 예시
export default async function ApplicationsPage() {
  const applications = await fetchAPI('/api/applications');
  return <ApplicationsList applications={applications} />;
}

// app/lib/actions.ts - Server Actions 예시
'use server';

export async function submitApplication(formData: FormData) {
  const response = await fetchAPI('/api/applications', {
    method: 'POST',
    body: JSON.stringify(Object.fromEntries(formData)),
  });
  
  revalidatePath('/researcher/applications');
  return response;
}
```

### 상태 관리

신청서 상태:
- `DRAFT` - 작성 중
- `SUBMITTED` - 제출됨
- `UNDER_REVIEW` - 검토 중
- `APPROVED` - 승인됨
- `REJECTED` - 반려됨
- `REVISION_REQUESTED` - 수정 요청
- `PROCESSING` - 처리 중
- `COMPLETED` - 완료

사용자 역할:
- `RESEARCHER` - 연구자
- `ADMIN` - 관리자

## 📝 코딩 컨벤션

### Python (Backend)
- PEP 8 스타일 가이드 준수
- Type hints 사용
- Docstring 작성
- 파일명: snake_case
- 클래스명: PascalCase
- 함수/변수명: snake_case

### TypeScript (Frontend)
- ESLint + Prettier 설정
- 함수형 컴포넌트 사용
- Server Components 우선 사용
- Client Components는 필요한 경우만 사용
- 파일명: kebab-case
- 컴포넌트명: PascalCase
- 함수/변수명: camelCase

## 🔒 보안 고려사항

1. **서버사이드 API 호출**: 모든 백엔드 통신은 Next.js 서버에서 수행
2. JWT 토큰 만료 시간 설정 (Access: 15분, Refresh: 7일)
3. httpOnly 쿠키로 토큰 관리
4. CORS 설정으로 허용된 origin만 접근
5. SQL Injection 방지 (SQLAlchemy ORM 사용)
6. XSS 방지 (React 자동 이스케이핑)
7. CSRF 보호 (Server Actions 사용)
8. 민감 정보 환경 변수 관리

## 📋 데이터 관리 정책

### Soft Delete (논리적 삭제)
- **데이터는 물리적으로 삭제하지 않음**
- 모든 테이블에 `dcyn` 컬럼 추가 (Y=삭제됨, N=활성)
- DELETE 요청 시 `dcyn='Y'`로 업데이트
- 모든 조회 쿼리에 `dcyn='N'` 필터 적용
- 삭제 이력은 ApplicationLogs에 기록

### 파일 관리
- 업로드 파일은 UUID 기반 고유 이름으로 저장
- 파일명 형식: `{file_type}_{uuid}_{timestamp}_{original_filename}`
- 저장 경로: `uploads/applications/{application_id}/`
- 파일 다운로드 시 원본 파일명으로 제공

## 📊 데이터베이스 스키마

### Users 테이블
- id (PK, UUID)
- email (UNIQUE, NOT NULL)
- password (hashed, NOT NULL)
- name (NOT NULL)
- role (ENUM: RESEARCHER/ADMIN)
- department
- position
- phone
- is_active (BOOLEAN, DEFAULT true)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- last_login_at (TIMESTAMP)
- dcyn (CHAR(1), DEFAULT 'N', NOT NULL)

### Applications 테이블
- id (PK, UUID)
- user_id (FK -> Users.id)
- project_name (NOT NULL)
- applicant_name (NOT NULL) - 신청 시점 사용자 이름
- applicant_department - 신청 시점 부서
- applicant_email (NOT NULL) - 신청 시점 이메일
- applicant_phone - 신청 시점 연락처
- principal_investigator (NOT NULL) - 책임연구자
- pi_department - 책임연구자 소속
- irb_number (NOT NULL) - IRB 승인번호
- irb_document_path - IRB 통지서 파일 경로
- research_plan_path - 연구계획서 파일 경로
- desired_completion_date - 희망 완료일자
- service_types (JSON) - 서비스 유형 배열
- unstructured_data_type - 비정형 데이터 유형
- target_patients (TEXT) - 대상환자
- request_details (TEXT) - 요청 상세 내용
- status (ENUM) - 상태
- rejection_reason - 반려 사유
- revision_request_reason - 수정 요청 사유
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- submitted_at (TIMESTAMP)
- reviewed_at (TIMESTAMP)
- reviewed_by (FK -> Users.id)
- completed_at (TIMESTAMP)
- dcyn (CHAR(1), DEFAULT 'N', NOT NULL)

### ApplicationLogs 테이블
- id (PK, UUID)
- application_id (FK -> Applications.id)
- user_id (FK -> Users.id)
- action (ENUM: CREATED/UPDATED/SUBMITTED/APPROVED/REJECTED/REVISION_REQUESTED/PROCESSING/COMPLETED/DELETED)
- reason
- details (JSON)
- created_at (TIMESTAMP)
- dcyn (CHAR(1), DEFAULT 'N', NOT NULL)

### Downloads 테이블
- id (PK, UUID)
- application_id (FK -> Applications.id)
- user_id (FK -> Users.id)
- file_name
- file_size
- file_path
- downloaded_at (TIMESTAMP)
- dcyn (CHAR(1), DEFAULT 'N', NOT NULL)

### RefreshTokens 테이블
- id (PK, UUID)
- user_id (FK -> Users.id)
- token (UNIQUE, NOT NULL)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
- dcyn (CHAR(1), DEFAULT 'N', NOT NULL)

## 🚦 개발 우선순위

1. **Phase 1 - 기본 구조 (현재)**
   - FastAPI 백엔드 구조 설정
   - Next.js 프론트엔드 구조 설정
   - SQLite 데이터베이스 설정
   - 기본 모델 정의

2. **Phase 2 - 인증 시스템**
   - 회원가입/로그인 API
   - JWT 토큰 인증
   - 서버사이드 인증 미들웨어
   - 보호된 라우트 구현

3. **Phase 3 - 핵심 기능**
   - 신청서 CRUD
   - 상태 관리 워크플로우
   - 파일 업로드/다운로드

4. **Phase 4 - 관리자 기능**
   - 관리자 대시보드
   - 사용자 관리
   - 신청서 검토 기능
   - 통계 및 리포트

5. **Phase 5 - 고도화**
   - 알림 시스템
   - 검색 및 필터링
   - 배치 처리
   - 성능 최적화

## 🔧 트러블슈팅 가이드

### 신청 목록이 로딩되지 않는 문제

이 문제는 주로 다음 두 가지 원인으로 발생합니다:

#### 1. 스키마 검증 오류 (ResponseValidationError)
**증상**: 백엔드 로그에 `ResponseValidationError` 또는 `desired_completion_date` 검증 오류 표시

**원인**: 
- 기존 데이터의 `desired_completion_date`가 현재 날짜 기준 1주일 이후 검증 규칙에 위배
- 응답 스키마에서 입력 검증 로직이 실행됨

**해결책**:
```python
# 1. 문제가 되는 날짜 데이터 수정
python3 -c "
import sqlite3
from datetime import date, timedelta

conn = sqlite3.connect('data_portal.db')
cursor = conn.cursor()

new_date = (date.today() + timedelta(days=8)).isoformat()
cursor.execute('''
    UPDATE applications 
    SET desired_completion_date = ? 
    WHERE desired_completion_date IS NOT NULL 
    AND desired_completion_date < ?
''', (new_date, (date.today() + timedelta(days=7)).isoformat()))

conn.commit()
conn.close()
"

# 2. 응답 스키마에서 검증 제거 (app/schemas/application.py)
# Application 클래스가 BaseModel을 직접 상속하도록 수정하여 
# ApplicationBase의 field_validator를 상속받지 않도록 함
```

#### 2. 데이터베이스 스키마 불일치 (OperationalError)
**증상**: 백엔드 로그에 `no such column: applications.컬럼명` 오류

**원인**: 
- 모델에 정의된 컬럼이 실제 데이터베이스 테이블에 존재하지 않음
- 수동으로 모델을 수정했지만 마이그레이션을 실행하지 않음

**해결책**:
```python
# 누락된 컬럼 추가
python3 -c "
import sqlite3

conn = sqlite3.connect('data_portal.db')
cursor = conn.cursor()

# 필요한 컬럼들 추가
missing_columns = [
    ('rejected_at', 'DATETIME'),
    ('deleted_at', 'DATETIME'), 
    ('deleted_by', 'VARCHAR'),
    ('deletion_reason', 'TEXT'),
    ('is_deleted', 'BOOLEAN DEFAULT 0')
]

for col_name, col_type in missing_columns:
    try:
        cursor.execute(f'ALTER TABLE applications ADD COLUMN {col_name} {col_type}')
        print(f'✅ Added {col_name}')
    except Exception as e:
        print(f'⚠️ {col_name}: {e}')

conn.commit()
conn.close()
"
```

#### 3. 예방 조치

**개발 시 주의사항**:
1. **스키마 수정 시**: 
   - 입력 검증(`ApplicationBase`, `ApplicationCreate`)과 응답 스키마(`Application`, `ApplicationInDB`)를 분리
   - 응답 스키마에서는 검증 로직을 포함하지 않음

2. **데이터베이스 모델 수정 시**:
   - 새 컬럼 추가 후 반드시 데이터베이스 마이그레이션 실행
   - `PRAGMA table_info(applications)`로 현재 스키마 확인

3. **기존 데이터 처리**:
   - 새로운 검증 규칙은 신규 데이터에만 적용
   - 기존 데이터에 대해서는 별도 마이그레이션 스크립트 작성

**확인 명령어**:
```bash
# 백엔드 서버 상태 확인
curl -s http://localhost:10402/docs

# 데이터베이스 스키마 확인  
python3 -c "
import sqlite3
conn = sqlite3.connect('data_portal.db')
cursor = conn.cursor()
cursor.execute('PRAGMA table_info(applications)')
print([col[1] for col in cursor.fetchall()])
conn.close()
"

# 프론트엔드 빌드 에러 확인
cd frontend && npm run build
```

## 📁 Git 리포지토리 정보

**GitHub Repository**: https://github.com/banchiyong/aumc_data_platform
- **Owner**: banchiyong
- **Repository Name**: aumc_data_platform  
- **Branch**: main
- **Visibility**: Public

### Git 명령어
```bash
# 클론
git clone https://github.com/banchiyong/aumc_data_platform.git

# 변경사항 커밋
git add .
git commit -m "커밋 메시지"

# 푸시
git push origin main

# 풀
git pull origin main
```