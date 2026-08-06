from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "HireMind AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # JWT Settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Database
    DATABASE_URL: str = "sqlite:///../hiremind.db"
    
    # External APIs
    GROQ_API_KEY: str
    
    class Config:
        env_file = ".env"

settings = Settings()
