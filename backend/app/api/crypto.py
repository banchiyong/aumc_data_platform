from fastapi import APIRouter, HTTPException, status

from app.core.crypto import encrypt_string, decrypt_string, encrypt_password
from app.schemas.crypto import EncryptRequest, EncryptResponse, DecryptRequest, DecryptResponse

router = APIRouter(prefix="/api/crypto", tags=["crypto"])


@router.post("/encrypt", response_model=EncryptResponse)
async def encrypt_credentials(request: EncryptRequest):
    """
    이메일과 비밀번호를 AES로 암호화합니다.
    
    **사용 목적**: 
    - Swagger UI에서 암호화된 값을 생성하여 로그인 API 테스트에 활용
    - 개발/테스트 환경에서 암호화 형식 확인용
    
    **주의사항**:
    - 실제 운영에서는 클라이언트(프론트엔드)에서 암호화를 수행해야 합니다
    - 이 API는 테스트/개발 목적으로만 사용하세요
    """
    try:
        encrypted_email = encrypt_string(request.email)
        encrypted_password = encrypt_password(request.password)
        
        return EncryptResponse(
            encrypted_email=encrypted_email,
            encrypted_password=encrypted_password,
            message="암호화된 값들을 로그인 API에서 사용하세요"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"암호화 실패: {str(e)}"
        )


@router.post("/decrypt", response_model=DecryptResponse)
async def decrypt_text(request: DecryptRequest):
    """
    AES로 암호화된 텍스트를 복호화합니다.
    
    **사용 목적**:
    - 암호화된 값이 올바르게 복호화되는지 확인
    - 개발/디버깅 목적
    
    **주의사항**:
    - 실제 운영에서는 서버에서만 복호화를 수행합니다
    - 이 API는 테스트/개발 목적으로만 사용하세요
    """
    try:
        decrypted_text = decrypt_string(request.encrypted_text)
        
        return DecryptResponse(
            decrypted_text=decrypted_text
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"복호화 실패: {str(e)}"
        )


@router.get("/test")
async def crypto_test():
    """
    암호화/복호화 기능 테스트
    
    테스트용 텍스트를 암호화한 후 다시 복호화하여 
    암호화 시스템이 올바르게 동작하는지 확인합니다.
    """
    test_text = "Hello, Data Portal!"
    
    try:
        # 암호화
        encrypted = encrypt_string(test_text)
        
        # 복호화
        decrypted = decrypt_string(encrypted)
        
        return {
            "original": test_text,
            "encrypted": encrypted,
            "decrypted": decrypted,
            "success": test_text == decrypted,
            "message": "암호화/복호화 테스트 완료"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"테스트 실패: {str(e)}"
        )