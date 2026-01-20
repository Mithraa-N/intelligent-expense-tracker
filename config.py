"""
Configuration settings for the Intelligent Expense Tracker API
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings and configuration"""
    
    # API Settings
    API_TITLE: str = "Intelligent Expense Tracker API"
    API_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True
    
    # CORS Settings
    CORS_ORIGINS: list = ["*"]
    CORS_CREDENTIALS: bool = True
    CORS_METHODS: list = ["*"]
    CORS_HEADERS: list = ["*"]
    
    # ML Model Settings
    MIN_EXPENSES_FOR_FORECAST: int = 10
    DEFAULT_FORECAST_DAYS: int = 30
    ANOMALY_CONTAMINATION: float = 0.1
    
    # Data Settings
    MAX_EXPENSES_IN_MEMORY: int = 10000
    
    # Logging
    LOG_LEVEL: str = "info"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create global settings instance
settings = Settings()
