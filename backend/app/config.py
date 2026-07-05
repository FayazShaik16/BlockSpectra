import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # App Settings
    APP_NAME: str = "BlockSpectra Intelligence Engine"
    DEBUG: bool = True
    PORT: int = 8000

    # OpenRouter API settings
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash")

    # DB Config (falls back to local SQLite if DATABASE_URL is not specified)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./blockspectra.db")

    # Blockchain Provider API Keys
    ETHERSCAN_API_KEY: str = os.getenv("ETHERSCAN_API_KEY", "")
    ARBISCAN_API_KEY: str = os.getenv("ARBISCAN_API_KEY", "")
    OP_ETHERSCAN_API_KEY: str = os.getenv("OP_ETHERSCAN_API_KEY", "")
    POLYGONSCAN_API_KEY: str = os.getenv("POLYGONSCAN_API_KEY", "")
    BSCSCAN_API_KEY: str = os.getenv("BSCSCAN_API_KEY", "")
    SNOWTRACE_API_KEY: str = os.getenv("SNOWTRACE_API_KEY", "")
    SOLANA_RPC_URL: str = os.getenv("SOLANA_RPC_URL", "https://api.mainnet-beta.solana.com")

settings = Settings()
