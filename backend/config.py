import os
from dataclasses import dataclass
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

@dataclass
class DatabaseConfig:
    """데이터베이스 설정"""
    host: str = os.getenv('DB_HOST')
    port: int = int(os.getenv('DB_PORT'))
    database: str = os.getenv('DB_NAME')
    user: str = os.getenv('DB_USER')
    password: str = os.getenv('DB_PASS')

@dataclass
class ABCLabConfig:
    """ABC Lab API 설정"""
    # api_url: str = "https://api.abclab.ktds.com/v1/chat-messages"
    # api_key: str = "app-ok1DMMGxuFnlgsuBcdQ0pWHu"
    # timeout: int = 180
    # user: str = "osr0907"
    api_url: str = os.getenv('ABC_LAB_API_URL')
    api_key: str = os.getenv('ABC_LAB_API_KEY')
    timeout: int = int(os.getenv('ABC_LAB_TIMEOUT'))
    user: str = os.getenv('ABC_LAB_USER')

@dataclass
class AppConfig:
    """애플리케이션 설정"""
    host: str = os.getenv('FLASK_HOST', '127.0.0.1')
    port: int = int(os.getenv('FLASK_PORT', 15000))
    debug: bool = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    secret_key: str = os.getenv('SECRET_KEY')

# 설정 인스턴스
db_config = DatabaseConfig()
abc_lab_config = ABCLabConfig()
app_config = AppConfig()