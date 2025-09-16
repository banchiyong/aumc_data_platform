"""
Email service for sending password reset emails
Note: This is a mock implementation. In production, integrate with actual email service
like SendGrid, AWS SES, or SMTP server.
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    async def send_password_reset_email(
        email: str, 
        reset_url: str,
        user_name: str
    ) -> bool:
        """
        Send password reset email to user.
        
        In production, this should:
        1. Connect to email service (SMTP, SendGrid, etc.)
        2. Use HTML email template
        3. Handle errors properly
        4. Log email sending events
        """
        try:
            # Mock implementation - just log the email
            logger.info(f"Password reset email sent to {email}")
            logger.info(f"Reset URL: {reset_url}")
            
            # In production, you would send actual email here
            email_content = f"""
            안녕하세요 {user_name}님,
            
            비밀번호 재설정을 요청하셨습니다.
            아래 링크를 클릭하여 새로운 비밀번호를 설정해주세요:
            
            {reset_url}
            
            이 링크는 1시간 동안 유효합니다.
            
            본인이 요청하지 않으셨다면 이 이메일을 무시해주세요.
            
            감사합니다.
            아주대학교병원 의료빅데이터센터
            """
            
            # For development, print to console
            print("=" * 50)
            print("PASSWORD RESET EMAIL")
            print("=" * 50)
            print(f"To: {email}")
            print(f"Subject: 비밀번호 재설정 안내")
            print("Content:")
            print(email_content)
            print("=" * 50)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send password reset email: {str(e)}")
            return False


email_service = EmailService()