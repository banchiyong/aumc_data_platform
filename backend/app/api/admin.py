from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import List
from datetime import datetime, timedelta

from app.db.session import get_db
from app.core.deps import get_current_admin_user
from app.models import (
    User,
    UserRole,
    Application,
    ApplicationStatus,
    ApplicationLog,
    LogAction,
    AutomationRequest,
    AutomationRequestStatus,
    AutomationRequestLog,
)
from app.schemas.user import User as UserSchema, UserUpdate
from app.schemas.application import ApplicationDelete

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=List[UserSchema])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User)
        .where(User.dcyn == 'N')  # Soft delete 필터 추가
        .offset(skip)
        .limit(limit)
        .order_by(User.created_at.desc())
    )
    users = result.scalars().all()
    return users


@router.put("/users/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(
            and_(
                User.id == user_id,
                User.dcyn == 'N'
            )
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "password" and value:
            from app.core.security import get_password_hash
            setattr(user, "hashed_password", get_password_hash(value))
        elif field == "role" and value:
            from app.models.user import UserRole
            setattr(user, field, UserRole(value))
        else:
            setattr(user, field, value)
    
    await db.commit()
    await db.refresh(user)
    
    return user


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    result = await db.execute(
        select(User).where(
            and_(
                User.id == user_id,
                User.dcyn == 'N'  # 이미 삭제되지 않은 사용자만
            )
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Soft delete 적용
    user.dcyn = 'Y'
    user.is_active = False  # 비활성화도 함께 처리
    await db.commit()
    
    return {"message": "User deleted successfully"}


@router.post("/users/{user_id}/toggle-active", response_model=UserSchema)
async def toggle_user_active(
    user_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate yourself"
        )
    
    result = await db.execute(
        select(User).where(
            and_(
                User.id == user_id,
                User.dcyn == 'N'
            )
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = not user.is_active
    await db.commit()
    await db.refresh(user)
    
    return user


@router.get("/statistics")
async def get_statistics(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    now_utc = datetime.utcnow()
    thirty_days_ago = now_utc - timedelta(days=30)
    six_months_ago = now_utc - timedelta(days=180)
    
    total_users = await db.execute(select(func.count(User.id)).where(User.dcyn == 'N'))
    active_users = await db.execute(
        select(func.count(User.id)).where(User.dcyn == 'N', User.is_active == True)
    )
    admin_users = await db.execute(
        select(func.count(User.id)).where(User.dcyn == 'N', User.role == UserRole.ADMIN)
    )
    pending_users = await db.execute(
        select(func.count(User.id)).where(User.dcyn == 'N', User.is_active == False)
    )
    recent_logins_7d = await db.execute(
        select(func.count(User.id)).where(
            User.dcyn == 'N',
            User.last_login_at.isnot(None),
            User.last_login_at >= datetime.utcnow() - timedelta(days=7),
        )
    )
    recent_logins_30d = await db.execute(
        select(func.count(User.id)).where(
            User.dcyn == 'N',
            User.last_login_at.isnot(None),
            User.last_login_at >= datetime.utcnow() - timedelta(days=30),
        )
    )

    total_applications = await db.execute(select(func.count(Application.id)).where(Application.dcyn == 'N'))

    application_status_counts = await db.execute(
        select(Application.status, func.count(Application.id))
        .where(Application.dcyn == 'N')
        .group_by(Application.status)
    )
    
    recent_applications = await db.execute(
        select(func.count(Application.id))
        .where(Application.dcyn == 'N')
        .where(Application.created_at >= thirty_days_ago)
    )
    
    # 월별 신청 통계 (최근 6개월)
    from sqlalchemy import extract
    monthly_stats = await db.execute(
        select(
            extract('year', Application.created_at).label('year'),
            extract('month', Application.created_at).label('month'),
            func.count(Application.id).label('count')
        )
        .where(Application.dcyn == 'N')
        .where(Application.created_at >= six_months_ago)
        .group_by('year', 'month')
        .order_by('year', 'month')
    )
    
    monthly_data = [
        {"year": year, "month": month, "count": count}
        for year, month, count in monthly_stats
    ]
    
    application_status_dict = {
        status.value if hasattr(status, 'value') else status: count
        for status, count in application_status_counts
    }

    approved_count = application_status_dict.get(ApplicationStatus.APPROVED.value, 0)
    rejected_count = application_status_dict.get(ApplicationStatus.REJECTED.value, 0)
    total_reviewed = approved_count + rejected_count

    approval_rate = (approved_count / total_reviewed * 100) if total_reviewed > 0 else 0

    avg_processing_time = await db.execute(
        select(
            func.avg(
                func.julianday(Application.reviewed_at) - 
                func.julianday(Application.submitted_at)
            )
        )
        .where(Application.dcyn == 'N')
        .where(Application.status == ApplicationStatus.APPROVED)
        .where(Application.reviewed_at.isnot(None))
        .where(Application.submitted_at.isnot(None))
    )
    avg_data_time = avg_processing_time.scalar() or 0

    total_automation = await db.execute(
        select(func.count(AutomationRequest.id)).where(AutomationRequest.dcyn == 'N')
    )
    automation_status_counts = await db.execute(
        select(AutomationRequest.status, func.count(AutomationRequest.id))
        .where(AutomationRequest.dcyn == 'N')
        .group_by(AutomationRequest.status)
    )
    recent_automation = await db.execute(
        select(func.count(AutomationRequest.id))
        .where(AutomationRequest.dcyn == 'N')
        .where(AutomationRequest.created_at >= thirty_days_ago)
    )
    automation_monthly_stats = await db.execute(
        select(
            extract('year', AutomationRequest.created_at).label('year'),
            extract('month', AutomationRequest.created_at).label('month'),
            func.count(AutomationRequest.id).label('count')
        )
        .where(AutomationRequest.dcyn == 'N')
        .where(AutomationRequest.created_at >= six_months_ago)
        .group_by('year', 'month')
        .order_by('year', 'month')
    )
    automation_monthly_data = [
        {"year": year, "month": month, "count": count}
        for year, month, count in automation_monthly_stats
    ]
    automation_status_dict = {
        status.value if hasattr(status, 'value') else status: count
        for status, count in automation_status_counts
    }
    approved_automation_count = automation_status_dict.get(AutomationRequestStatus.APPROVED.value, 0)
    rejected_automation_count = automation_status_dict.get(AutomationRequestStatus.REJECTED.value, 0)
    total_reviewed_automation = approved_automation_count + rejected_automation_count
    automation_approval_rate = (
        approved_automation_count / total_reviewed_automation * 100
        if total_reviewed_automation > 0
        else 0
    )
    roi_saved_count = await db.execute(
        select(func.count(AutomationRequest.id)).where(
            AutomationRequest.dcyn == 'N',
            AutomationRequest.roi_saved_at.isnot(None),
        )
    )

    total_users_count = total_users.scalar() or 0
    active_users_count = active_users.scalar() or 0
    admin_users_count = admin_users.scalar() or 0
    pending_users_count = pending_users.scalar() or 0
    recent_logins_7d_count = recent_logins_7d.scalar() or 0
    recent_logins_30d_count = recent_logins_30d.scalar() or 0
    total_applications_count = total_applications.scalar() or 0
    recent_applications_count = recent_applications.scalar() or 0
    total_automation_count = total_automation.scalar() or 0
    recent_automation_count = recent_automation.scalar() or 0
    roi_saved_count_value = roi_saved_count.scalar() or 0

    return {
        "total_users": total_users_count,
        "active_users": active_users_count,
        "total_applications": total_applications_count,
        "recent_applications": recent_applications_count,
        "status_breakdown": application_status_dict,
        "approval_rate": round(approval_rate, 2),
        "pending_review": application_status_dict.get(ApplicationStatus.SUBMITTED.value, 0) + 
                         application_status_dict.get(ApplicationStatus.UNDER_REVIEW.value, 0),
        "monthly_statistics": monthly_data,
        "average_processing_days": round(avg_data_time, 1),
        "data_services": {
            "total": total_applications_count,
            "recent_30d": recent_applications_count,
            "pending_review": application_status_dict.get(ApplicationStatus.SUBMITTED.value, 0)
            + application_status_dict.get(ApplicationStatus.UNDER_REVIEW.value, 0),
            "approval_rate": round(approval_rate, 2),
            "average_processing_days": round(avg_data_time, 1),
            "status_breakdown": application_status_dict,
            "monthly_statistics": monthly_data,
        },
        "automation_services": {
            "total": total_automation_count,
            "recent_30d": recent_automation_count,
            "pending_review": automation_status_dict.get(AutomationRequestStatus.SUBMITTED.value, 0)
            + automation_status_dict.get(AutomationRequestStatus.UNDER_REVIEW.value, 0),
            "approval_rate": round(automation_approval_rate, 2),
            "completed": automation_status_dict.get(AutomationRequestStatus.COMPLETED.value, 0),
            "roi_saved": roi_saved_count_value,
            "status_breakdown": automation_status_dict,
            "monthly_statistics": automation_monthly_data,
        },
        "user_statistics": {
            "total": total_users_count,
            "active": active_users_count,
            "inactive": total_users_count - active_users_count,
            "admins": admin_users_count,
            "researchers": total_users_count - admin_users_count,
            "pending_approval": pending_users_count,
            "recent_logins_7d": recent_logins_7d_count,
            "recent_logins_30d": recent_logins_30d_count,
        },
    }


@router.delete("/applications/{application_id}")
async def delete_application(
    application_id: str,
    delete_request: ApplicationDelete,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """신청서 삭제 (Soft Delete)"""
    # 신청서 조회
    result = await db.execute(
        select(Application).where(
            and_(
                Application.id == application_id,
                Application.dcyn == 'N'  # 이미 삭제되지 않은 신청서만
            )
        )
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Soft delete 처리
    application.dcyn = 'Y'  # 삭제 플래그 설정
    application.deleted_at = datetime.utcnow()
    application.deleted_by = current_user.id
    application.deletion_reason = delete_request.reason
    
    # 로그 기록
    log = ApplicationLog(
        application_id=application_id,
        user_id=current_user.id,
        action=LogAction.DELETED,
        reason=delete_request.reason,
        created_at=datetime.utcnow()
    )
    db.add(log)
    
    await db.commit()
    
    return {"message": "Application deleted successfully"}
