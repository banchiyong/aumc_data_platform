from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime

from app.db.session import get_db
from app.core.deps import get_current_admin_user
from app.models import Notice, User
from app.schemas.notice import Notice as NoticeSchema, NoticeCreate, NoticeUpdate, NoticeWithAuthor

router = APIRouter(prefix="/api/notices", tags=["notices"])


@router.get("/", response_model=List[NoticeWithAuthor])
async def list_notices(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notice).where(Notice.dcyn == "N").order_by(Notice.is_pinned.desc(), Notice.created_at.desc()))
    notices = result.scalars().all()

    items = []
    for notice in notices:
      author_result = await db.execute(select(User).where(User.id == notice.created_by))
      author = author_result.scalar_one_or_none()
      items.append(NoticeWithAuthor(**notice.__dict__, author_name=author.name if author else "관리자"))
    return items


@router.get("/admin", response_model=List[NoticeWithAuthor])
async def admin_list_notices(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    return await list_notices(db)


@router.post("/admin", response_model=NoticeSchema)
async def create_notice(
    notice_in: NoticeCreate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    notice = Notice(**notice_in.model_dump(), created_by=current_user.id)
    db.add(notice)
    await db.commit()
    await db.refresh(notice)
    return notice


@router.put("/admin/{notice_id}", response_model=NoticeSchema)
async def update_notice(
    notice_id: str,
    notice_update: NoticeUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Notice).where(Notice.id == notice_id, Notice.dcyn == "N"))
    notice = result.scalar_one_or_none()

    if not notice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notice not found")

    update_data = notice_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(notice, field, value)

    await db.commit()
    await db.refresh(notice)
    return notice


@router.delete("/admin/{notice_id}")
async def delete_notice(
    notice_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Notice).where(Notice.id == notice_id, Notice.dcyn == "N"))
    notice = result.scalar_one_or_none()

    if not notice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notice not found")

    notice.dcyn = "Y"
    notice.updated_at = datetime.utcnow()
    await db.commit()
    return {"message": "Notice deleted successfully"}
