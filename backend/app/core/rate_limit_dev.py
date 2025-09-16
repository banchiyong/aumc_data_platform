"""
Development-friendly rate limiting configuration
빠른 테스트를 위한 개발용 설정
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, Response
from fastapi.responses import JSONResponse
import time
import os

# 환경에 따른 설정 분기
IS_TESTING = os.getenv("TESTING", "false").lower() == "true"

# Create limiter instance
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["1000 per day", "500 per hour"] if IS_TESTING else ["200 per day", "50 per hour"],
    storage_uri="memory://",
    headers_enabled=True
)


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """Custom handler for rate limit exceeded errors"""
    response = JSONResponse(
        status_code=429,
        content={
            "detail": f"Rate limit exceeded: {exc.detail}",
            "retry_after": getattr(exc, "retry_after", 60)
        }
    )
    response.headers["Retry-After"] = str(getattr(exc, "retry_after", 60))
    response.headers["X-RateLimit-Limit"] = str(exc.limit)
    response.headers["X-RateLimit-Remaining"] = "0"
    response.headers["X-RateLimit-Reset"] = str(int(time.time()) + getattr(exc, "retry_after", 60))
    return response


# 개발/테스트용 느슨한 제한
if IS_TESTING:
    # 테스트 모드: 분 단위로 변경
    password_reset_limit = limiter.limit("10 per minute")  # 1분에 10회
    auth_limit = limiter.limit("30 per minute")            # 1분에 30회
    api_limit = limiter.limit("100 per minute")            # 1분에 100회
    admin_limit = limiter.limit("50 per minute")           # 1분에 50회
    read_limit = limiter.limit("200 per minute")           # 1분에 200회
else:
    # 프로덕션 모드: 시간 단위 유지
    password_reset_limit = limiter.limit("3 per hour")
    auth_limit = limiter.limit("10 per hour")
    api_limit = limiter.limit("100 per hour")
    admin_limit = limiter.limit("30 per hour")
    read_limit = limiter.limit("200 per hour")