from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    AUTH_SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    PROJECT_NAME: str = "KULTI"
    GEMINI_API_KEY: str
    GEMINI_MODEL: str
    DATABASE_URL: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str

    model_config = SettingsConfigDict(env_file=ROOT_DIR / ".env", extra="ignore")

settings = Settings()
