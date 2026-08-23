from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(
        default="Smart Attendance Management System",
        validation_alias="APP_NAME"
    )

    app_version: str = Field(
        default="1.0.0",
        validation_alias="APP_VERSION"
    )

    environment: str = Field(
        default="development",
        validation_alias="ENVIRONMENT"
    )

    database_url: str = Field(
        validation_alias="DATABASE_URL"
    )

    secret_key: str = Field(
        validation_alias="SECRET_KEY"
    )

    algorithm: str = Field(
        default="HS256",
        validation_alias="ALGORITHM"
    )

    access_token_expire_minutes: int = Field(
        default=60,
        validation_alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )

    attendance_required_percentage: float = Field(
        default=75.0,
        validation_alias="ATTENDANCE_REQUIRED_PERCENTAGE"
    )

    qr_expiry_seconds: int = Field(
        default=120,
        validation_alias="QR_EXPIRY_SECONDS"
    )

    debug: bool = Field(
        default=False,
        validation_alias="DEBUG"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    QR_EXPIRY_SECONDS: int = 120

    ATTENDANCE_REQUIRED_PERCENTAGE: float = 75.0

    ATTENDANCE_SAFE_PERCENTAGE: float = 85.0
    ATTENDANCE_NORMAL_PERCENTAGE: float = 75.0
    ATTENDANCE_WARNING_PERCENTAGE: float = 65.0

    


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()