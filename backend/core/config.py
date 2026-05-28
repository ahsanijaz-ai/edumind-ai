from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "EduMind AI Backend"
    API_V1_STR: str = "/api/v1"
    
    # Supabase / Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./test.db" # Default local, replace with Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    # Security
    SECRET_KEY: str = "SUPER_SECRET_KEY_REPLACE_ME_IN_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 1 week
    
    # Gemini AI
    GEMINI_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
