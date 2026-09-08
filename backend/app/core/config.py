from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    project_name: str = "ClothesTrade"
    database_url: str = "postgresql+psycopg://postgres:postgres@db:5432/clothestrade"
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 60 * 24
    uploads_dir: str = "/app/uploads"
    telegram_bot_token: str | None = None
    telegram_chat_id: str | None = None


settings = Settings()
