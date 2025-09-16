import base64
import os
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad, pad
from Crypto.Random import get_random_bytes
import hashlib

# 암호화 키 (프론트엔드와 동일해야 함)
SECRET_KEY = os.getenv('CRYPTO_KEY', 'data-portal-secure-key-2024')

def get_aes_key(key: str) -> bytes:
    """AES 키를 32바이트로 생성"""
    return hashlib.sha256(key.encode()).digest()

def decrypt_password(encrypted_password: str) -> str:
    """
    AES로 암호화된 비밀번호를 복호화
    CryptoJS.AES.decrypt와 호환되는 방식
    """
    try:
        # CryptoJS 형식의 암호화된 데이터 파싱
        encrypted_data = base64.b64decode(encrypted_password)
        
        # CryptoJS는 "Salted__" + 8바이트 salt + 암호화된 데이터 형식
        if encrypted_data.startswith(b'Salted__'):
            salt = encrypted_data[8:16]
            ciphertext = encrypted_data[16:]
            
            # CryptoJS의 키 생성 방식 (EVP_BytesToKey)
            key_iv = derive_key_iv(SECRET_KEY.encode(), salt)
            key = key_iv[:32]
            iv = key_iv[32:48]
            
            # AES 복호화
            cipher = AES.new(key, AES.MODE_CBC, iv)
            decrypted = cipher.decrypt(ciphertext)
            
            # 패딩 제거
            decrypted = unpad(decrypted, AES.block_size)
            return decrypted.decode('utf-8')
        else:
            raise ValueError("Invalid encrypted data format")
            
    except Exception as e:
        raise ValueError(f"Password decryption failed: {str(e)}")

def derive_key_iv(password: bytes, salt: bytes) -> bytes:
    """
    CryptoJS의 EVP_BytesToKey와 동일한 키 생성 방식
    """
    derived = b''
    while len(derived) < 48:  # 32 bytes for key + 16 bytes for IV
        hasher = hashlib.md5()
        if derived:
            hasher.update(derived[-16:])
        hasher.update(password)
        hasher.update(salt)
        derived += hasher.digest()
    
    return derived

def decrypt_string(encrypted_text: str) -> str:
    """일반 문자열 복호화 (비밀번호와 동일한 방식)"""
    return decrypt_password(encrypted_text)

def encrypt_string(plaintext: str) -> str:
    """
    CryptoJS와 호환되는 방식으로 문자열 암호화
    """
    try:
        # 랜덤 salt 생성
        salt = get_random_bytes(8)
        
        # CryptoJS의 키 생성 방식 (EVP_BytesToKey)
        key_iv = derive_key_iv(SECRET_KEY.encode(), salt)
        key = key_iv[:32]
        iv = key_iv[32:48]
        
        # 패딩 추가
        padded_plaintext = pad(plaintext.encode('utf-8'), AES.block_size)
        
        # AES 암호화
        cipher = AES.new(key, AES.MODE_CBC, iv)
        ciphertext = cipher.encrypt(padded_plaintext)
        
        # CryptoJS 형식으로 결합: "Salted__" + salt + ciphertext
        encrypted_data = b'Salted__' + salt + ciphertext
        
        # Base64 인코딩
        return base64.b64encode(encrypted_data).decode('utf-8')
        
    except Exception as e:
        raise ValueError(f"String encryption failed: {str(e)}")

def encrypt_password(plaintext: str) -> str:
    """비밀번호 암호화 (일반 문자열과 동일한 방식)"""
    return encrypt_string(plaintext)