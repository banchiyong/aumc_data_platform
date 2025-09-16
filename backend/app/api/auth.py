from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime, timedelta

from app.db.session import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.core.deps import get_current_user
from app.core.rate_limit import auth_limit, password_reset_limit
from app.core.crypto import decrypt_password
from app.models.user import User
from app.models.token import RefreshToken
from app.schemas.user import UserCreate, UserLogin, User as UserSchema
from app.schemas.token import Token
from app.core.config import settings

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=UserSchema)
async def register(
    user_in: UserCreate, 
    db: AsyncSession = Depends(get_db)
):
    """
    새 사용자 계정 생성
    
    **중요**: 이메일과 비밀번호는 클라이언트에서 AES 암호화하여 전송해야 합니다.
    - 평문 이메일/비밀번호는 허용되지 않습니다.
    - 암호화 키: 'data-portal-secure-key-2024'
    - 암호화 방식: AES (CryptoJS 호환)
    """
    # 암호화된 이메일 복호화
    try:
        decrypted_email = decrypt_password(user_in.email)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Validate email domain - must be @aumc.ac.kr
    if not decrypted_email.endswith("@aumc.ac.kr"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="아주대학교병원 메일(@aumc.ac.kr)만 사용 가능합니다"
        )
    
    result = await db.execute(
        select(User).where(
            and_(
                User.email == decrypted_email,
                User.dcyn == 'N'
            )
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # 암호화된 비밀번호 복호화
    try:
        decrypted_password = decrypt_password(user_in.password)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password format"
        )
    
    user = User(
        email=decrypted_email,
        hashed_password=get_password_hash(decrypted_password),
        name=user_in.name,
        department=user_in.department,
        position=user_in.position,
        phone=user_in.phone
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user


@router.post("/login", response_model=Token)
@auth_limit
async def login(request: Request, response: Response, user_credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    # 암호화된 이메일 복호화
    try:
        decrypted_email = decrypt_password(user_credentials.email)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    result = await db.execute(
        select(User).where(
            and_(
                User.email == decrypted_email,
                User.dcyn == 'N'
            )
        )
    )
    user = result.scalar_one_or_none()
    
    # 암호화된 비밀번호 복호화
    try:
        decrypted_password = decrypt_password(user_credentials.password)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password format"
        )
    
    if not user or not verify_password(decrypted_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    user.last_login_at = datetime.utcnow()
    
    access_token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    refresh_token_str = create_refresh_token(data={"sub": user.id})
    
    refresh_token = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    db.add(refresh_token)
    await db.commit()
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token_str
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str, db: AsyncSession = Depends(get_db)):
    payload = decode_token(refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token == refresh_token,
            RefreshToken.expires_at > datetime.utcnow()
        )
    )
    token_obj = result.scalar_one_or_none()
    
    if not token_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    result = await db.execute(
        select(User).where(
            and_(
                User.id == token_obj.user_id,
                User.dcyn == 'N'
            )
        )
    )
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not found or inactive"
        )
    
    await db.delete(token_obj)
    
    access_token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    new_refresh_token_str = create_refresh_token(data={"sub": user.id})
    
    new_refresh_token = RefreshToken(
        user_id=user.id,
        token=new_refresh_token_str,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    db.add(new_refresh_token)
    await db.commit()
    
    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token_str
    )


@router.get("/me", response_model=UserSchema)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/password-reset/request")
@password_reset_limit
async def request_password_reset(
    request: Request,
    response: Response,
    email: str,
    db: AsyncSession = Depends(get_db)
):
    """Request password reset token"""
    # Find user by email
    result = await db.execute(
        select(User).where(
            and_(
                User.email == email,
                User.dcyn == 'N',
                User.is_active == True
            )
        )
    )
    user = result.scalar_one_or_none()
    
    # Always return success to prevent email enumeration
    if not user:
        return {"message": "If the email exists, a password reset link has been sent"}
    
    # Import here to avoid circular dependency
    from app.models.password_reset import PasswordResetToken
    from app.services.email import email_service
    
    # Invalidate any existing tokens for this user
    existing_tokens = await db.execute(
        select(PasswordResetToken).where(
            and_(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.used == False,
                PasswordResetToken.dcyn == 'N'
            )
        )
    )
    for token in existing_tokens.scalars():
        token.used = True
    
    # Create new token
    reset_token = PasswordResetToken.generate_token(user.id)
    db.add(reset_token)
    await db.commit()
    
    # Send email (in production, use proper email service)
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token.token}"
    await email_service.send_password_reset_email(
        email=user.email,
        reset_url=reset_url,
        user_name=user.name
    )
    
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/password-reset/confirm")
@password_reset_limit
async def reset_password(
    request: Request,
    response: Response,
    token: str,
    new_password: str,
    db: AsyncSession = Depends(get_db)
):
    """Reset password using token"""
    from app.models.password_reset import PasswordResetToken
    
    # Find valid token
    result = await db.execute(
        select(PasswordResetToken).where(
            and_(
                PasswordResetToken.token == token,
                PasswordResetToken.dcyn == 'N'
            )
        )
    )
    reset_token = result.scalar_one_or_none()
    
    if not reset_token or not reset_token.is_valid():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )
    
    # Get user
    result = await db.execute(
        select(User).where(
            and_(
                User.id == reset_token.user_id,
                User.dcyn == 'N'
            )
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )
    
    # Update password
    user.hashed_password = get_password_hash(new_password)
    
    # Mark token as used
    reset_token.used = True
    
    await db.commit()
    
    return {"message": "Password has been reset successfully"}