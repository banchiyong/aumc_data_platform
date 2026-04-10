from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text

from app.core.config import settings
from app.core.rate_limit import limiter, rate_limit_exceeded_handler
from app.db.session import engine
from app.db.base import Base
from app.api import auth, applications, automation_requests, notices, admin, crypto
from app.models import *


async def ensure_automation_request_columns(conn) -> None:
    if conn.dialect.name != "sqlite":
        return

    result = await conn.execute(text("PRAGMA table_info(automation_requests)"))
    columns = {row[1] for row in result.fetchall()}

    if "current_worker_annual_salary" not in columns:
        await conn.execute(text("ALTER TABLE automation_requests ADD COLUMN current_worker_annual_salary INTEGER"))

    if "current_misc_operating_cost" not in columns:
        await conn.execute(
            text(
                "ALTER TABLE automation_requests "
                "ADD COLUMN current_misc_operating_cost INTEGER NOT NULL DEFAULT 0"
            )
        )

    if "special_notes" not in columns:
        await conn.execute(text("ALTER TABLE automation_requests ADD COLUMN special_notes TEXT"))

    if "roi_basis_json" not in columns:
        await conn.execute(text("ALTER TABLE automation_requests ADD COLUMN roi_basis_json TEXT"))

    if "roi_result_json" not in columns:
        await conn.execute(text("ALTER TABLE automation_requests ADD COLUMN roi_result_json TEXT"))

    if "roi_amount_with_dev" not in columns:
        await conn.execute(text("ALTER TABLE automation_requests ADD COLUMN roi_amount_with_dev INTEGER"))

    if "roi_amount_without_dev" not in columns:
        await conn.execute(text("ALTER TABLE automation_requests ADD COLUMN roi_amount_without_dev INTEGER"))

    if "roi_ratio_with_dev" not in columns:
        await conn.execute(text("ALTER TABLE automation_requests ADD COLUMN roi_ratio_with_dev REAL"))

    if "roi_ratio_without_dev" not in columns:
        await conn.execute(text("ALTER TABLE automation_requests ADD COLUMN roi_ratio_without_dev REAL"))

    if "roi_saved_at" not in columns:
        await conn.execute(text("ALTER TABLE automation_requests ADD COLUMN roi_saved_at DATETIME"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await ensure_automation_request_columns(conn)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 origin 허용 (개발 환경)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(automation_requests.router)
app.include_router(notices.router)
app.include_router(admin.router)
app.include_router(crypto.router)


@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
