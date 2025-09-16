#!/usr/bin/env python3
"""
데이터베이스 초기화 스크립트
"""

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.db.base import Base
from app.models import *  # 모든 모델 import

DATABASE_URL = "sqlite+aiosqlite:///./data_portal.db"

async def init_database():
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        # 모든 테이블 생성
        await conn.run_sync(Base.metadata.create_all)
        print("✅ 데이터베이스 테이블 생성 완료")
    
    await engine.dispose()

if __name__ == "__main__":
    print("🔄 데이터베이스 초기화 시작...")
    asyncio.run(init_database())