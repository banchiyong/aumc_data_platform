"""
Rate limiting configuration for API endpoints
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, Response
from fastapi.responses import JSONResponse
import time

# Create limiter instance
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
    headers_enabled=True  # Add rate limit headers to responses
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


# Rate limit decorators for different endpoint types
# These can be used selectively on endpoints that need specific limits

# Strict limit for password reset to prevent abuse
password_reset_limit = limiter.limit("3 per hour")

# Moderate limit for authentication endpoints
auth_limit = limiter.limit("10 per hour")

# Standard limit for general API endpoints
api_limit = limiter.limit("100 per hour")

# Relaxed limit for read-only endpoints
read_limit = limiter.limit("200 per hour")

# Increased limit for admin operations
admin_limit = limiter.limit("60 per hour")