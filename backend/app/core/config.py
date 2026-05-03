from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    PROJECT_NAME: str = "KULTI"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    DATABASE_URL: str = "postgresql+psycopg://kulti:kulti@localhost:5432/kulti"
    POSTGRES_USER: str = "kulti"
    POSTGRES_PASSWORD: str = "kulti"
    POSTGRES_DB: str = "kulti"

    model_config = SettingsConfigDict(env_file=ROOT_DIR / ".env", extra="ignore")


settings = Settings()
