from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, overridable via environment variables."""

    model_config = SettingsConfigDict(env_prefix="DEVTOOLS_", env_file=".env", extra="ignore")

    app_name: str = "devv.tools API"
    debug: bool = False
    # Comma-separated list of allowed CORS origins
    cors_origins: str = "http://localhost:8080,http://localhost:4173,https://www.devv.tools,https://devv.tools"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
