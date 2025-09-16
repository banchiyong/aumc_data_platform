# 아주대학교병원 의료빅데이터센터 데이터 포털 보안 검토 보고서

## 개요
본 보고서는 아주대학교병원 의료빅데이터센터 데이터 포털 시스템의 전체적인 보안 상태를 검토하고 개선 방향을 제시합니다.

검토일: 2025-09-11
검토 범위: Backend (FastAPI), Frontend (Next.js), Database (SQLite)

## 1. 보안 현황 평가

### 1.1 인증 및 인가 (Authentication & Authorization)

#### 긍정적인 측면
- ✅ JWT 토큰 기반 인증 구현
- ✅ bcrypt를 사용한 안전한 비밀번호 해싱
- ✅ httpOnly 쿠키 사용으로 XSS 공격 방지
- ✅ Refresh Token 구현으로 보안성 향상
- ✅ 역할 기반 접근 제어 (RBAC) 구현 (USER, ADMIN)

#### 개선 필요 사항
- ⚠️ ACCESS_TOKEN_EXPIRE_MINUTES=15분은 적절하나, 민감한 의료 데이터 특성상 더 짧게 설정 고려
- ⚠️ SECRET_KEY가 환경변수로 관리되나, 키 로테이션 메커니즘 부재
- ⚠️ 비밀번호 복잡도 정책 미적용
- ⚠️ 다중 인증(MFA) 미구현

### 1.2 입력 검증 및 SQL Injection 방지

#### 긍정적인 측면
- ✅ SQLAlchemy ORM 사용으로 SQL Injection 방지
- ✅ Pydantic 모델을 통한 타입 검증
- ✅ 이메일 도메인 검증 (@aumc.ac.kr)

#### 개선 필요 사항
- ⚠️ 파일명 검증은 있으나, 파일 내용 검증 부족
- ⚠️ 텍스트 필드에 대한 XSS 방지 처리 미확인
- ⚠️ Rate Limiting 미구현

### 1.3 파일 업로드 보안

#### 긍정적인 측면
- ✅ 파일 크기 제한 (10MB)
- ✅ 허용된 확장자만 업로드 가능 (pdf, doc, docx, hwp)
- ✅ UUID 기반 고유 파일명 생성으로 경로 탐색 공격 방지
- ✅ 업로드 디렉토리 격리

#### 개선 필요 사항
- ⚠️ 파일 내용 검증 미구현 (Magic Number 검증 필요)
- ⚠️ 바이러스 스캔 미구현
- ⚠️ 업로드된 파일의 직접 접근 URL 노출 가능성

### 1.4 API 엔드포인트 접근 제어

#### 긍정적인 측면
- ✅ 모든 민감한 엔드포인트에 인증 적용
- ✅ 관리자 전용 엔드포인트 분리
- ✅ 사용자별 데이터 접근 제한

#### 개선 필요 사항
- ⚠️ API 사용량 제한 미구현
- ⚠️ 감사 로그 미흡 (일부 작업만 로깅)
- ⚠️ API 버전 관리 미구현

### 1.5 민감한 정보 노출

#### 긍정적인 측면
- ✅ 환경변수를 통한 설정 관리
- ✅ 비밀번호 해싱 적용
- ✅ 소프트 삭제(dcyn) 구현으로 데이터 보존

#### 개선 필요 사항
- ⚠️ 에러 메시지에 상세 정보 노출 가능성
- ⚠️ 디버그 모드 활성화 상태 (개발환경)
- ⚠️ 데이터베이스 백업 암호화 미구현

### 1.6 CORS 및 보안 헤더

#### 긍정적인 측면
- ✅ CORS 미들웨어 구현
- ✅ secure 쿠키 플래그 설정 (프로덕션)
- ✅ sameSite 쿠키 속성 설정

#### 개선 필요 사항
- ⚠️ CORS allow_origins="*" 설정 (너무 관대함)
- ⚠️ CSP(Content Security Policy) 헤더 미설정
- ⚠️ X-Frame-Options 헤더 미설정
- ⚠️ X-Content-Type-Options 헤더 미설정

## 2. 위험도 평가

### 높음 (즉시 조치 필요)
1. **CORS 설정**: 모든 origin 허용은 CSRF 공격에 취약
2. **파일 내용 검증 부재**: 악성 파일 업로드 가능성
3. **Rate Limiting 부재**: DDoS 및 브루트포스 공격 취약

### 중간 (단기 개선 필요)
1. **보안 헤더 미설정**: XSS, Clickjacking 등 공격 가능성
2. **API 사용량 제한 부재**: 리소스 고갈 공격 가능성
3. **감사 로그 미흡**: 보안 사고 추적 어려움

### 낮음 (장기 개선 고려)
1. **MFA 미구현**: 계정 탈취 위험
2. **비밀번호 정책 미적용**: 약한 비밀번호 사용 가능
3. **백업 암호화 미구현**: 데이터 유출 위험

## 3. 개선 권고사항

### 3.1 즉시 적용 가능한 개선사항

#### CORS 설정 강화
```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:10401", "http://amm.iptime.org:10401"],  # 특정 도메인만 허용
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

#### 보안 헤더 추가
```python
# backend/app/middleware/security.py
from fastapi import Request
from fastapi.middleware.trustedhost import TrustedHostMiddleware

async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

#### Rate Limiting 구현
```python
# backend/app/middleware/rate_limit.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# 로그인 엔드포인트에 적용
@router.post("/login")
@limiter.limit("5 per minute")
async def login(...):
    ...
```

### 3.2 단기 개선 계획 (1-2개월)

1. **파일 검증 강화**
   - Magic Number 검증 구현
   - 파일 내용 스캔 (python-magic 라이브러리)
   - 업로드 파일 격리 저장소 구현

2. **감사 로깅 강화**
   - 모든 데이터 접근 로깅
   - 실패한 로그인 시도 기록
   - 관리자 작업 상세 로깅

3. **비밀번호 정책**
   - 최소 8자, 대소문자, 숫자, 특수문자 포함
   - 이전 비밀번호 재사용 방지
   - 주기적 변경 권고

### 3.3 장기 개선 계획 (3-6개월)

1. **다중 인증(MFA) 구현**
   - TOTP 기반 2단계 인증
   - 백업 코드 제공

2. **데이터 암호화**
   - 민감한 데이터 필드 암호화
   - 데이터베이스 백업 암호화
   - 전송 중 암호화 강화 (TLS 1.3)

3. **보안 모니터링**
   - 침입 탐지 시스템
   - 실시간 알림 시스템
   - 정기적인 보안 감사

## 4. 의료 데이터 특화 보안 고려사항

### 4.1 컴플라이언스
- 개인정보보호법 준수 확인 필요
- 의료법 관련 규정 검토 필요
- 데이터 보관 기간 정책 수립 필요

### 4.2 추가 보안 강화
- 환자 데이터 비식별화 처리
- 데이터 접근 최소 권한 원칙 적용
- 정기적인 접근 권한 검토

## 5. 결론

현재 시스템은 기본적인 보안 기능을 갖추고 있으나, 의료 데이터를 다루는 시스템으로서 추가적인 보안 강화가 필요합니다. 특히 CORS 설정, Rate Limiting, 파일 검증 등 즉시 적용 가능한 개선사항들을 우선적으로 처리하고, 단계적으로 보안 수준을 향상시킬 것을 권고합니다.

## 6. 체크리스트

### 필수 보안 요구사항
- [ ] CORS 설정 강화
- [ ] Rate Limiting 구현
- [ ] 보안 헤더 설정
- [ ] 파일 내용 검증
- [ ] 상세 감사 로깅
- [ ] 비밀번호 정책 적용
- [ ] API 사용량 제한
- [ ] 에러 메시지 최소화

### 권장 보안 요구사항
- [ ] MFA 구현
- [ ] 데이터 암호화
- [ ] 백업 암호화
- [ ] 보안 모니터링
- [ ] 정기적 보안 감사
- [ ] 침투 테스트
- [ ] 보안 교육

---

작성자: Claude Assistant
검토일: 2025-09-11
다음 검토 예정일: 2025-12-11 (3개월 후)