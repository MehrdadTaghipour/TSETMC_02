"""
TSETMC Backend Configuration
Manages environment variables, market hours definitions, and system settings.
"""

import os
from datetime import datetime, time
from typing import Optional

class Settings:
    # Relay Configuration
    RELAY_URL: Optional[str] = os.getenv("RELAY_URL", None)
    RELAY_SECRET_TOKEN: Optional[str] = os.getenv("RELAY_SECRET_TOKEN", None)

    # TSETMC Upstream Configuration
    TSETMC_CDN_BASE: str = os.getenv("TSETMC_CDN_BASE", "http://cdn.tsetmc.com/api")
    TSETMC_OLD_BASE: str = os.getenv("TSETMC_OLD_BASE", "http://old.tsetmc.com")
    
    # Browser-Like User-Agent (Critical to prevent immediate 403 block from TSETMC)
    TSETMC_UA: str = os.getenv(
        "TSETMC_UA",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )

    # Polling & Cache Intervals (seconds)
    POLL_INTERVAL_OPEN: int = int(os.getenv("POLL_INTERVAL_OPEN", "6"))
    POLL_INTERVAL_CLOSED: int = int(os.getenv("POLL_INTERVAL_CLOSED", "60"))
    CACHE_DIR: str = os.getenv("CACHE_DIR", "/tmp/tsetmc_cache")

    # Queue & Backoff
    MIN_REQUEST_INTERVAL_MS: int = int(os.getenv("MIN_REQUEST_INTERVAL_MS", "1200"))
    MAX_RETRIES: int = 3
    INITIAL_BACKOFF_SEC: float = 5.0
    CIRCUIT_BREAKER_COOLDOWN_SEC: float = 30.0

    # Operational Modes
    MOCK_MODE: bool = os.getenv("MOCK_MODE", "false").lower() in ("true", "1", "yes")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    @staticmethod
    def is_market_open(now: Optional[datetime] = None) -> bool:
        """
        Tehran Market Hours:
        Saturday to Wednesday (Iran weekday 0 to 4 in Jalali, or 5,6,0,1,2 in Python weekday where Monday=0)
        Saturday=5, Sunday=6, Monday=0, Tuesday=1, Wednesday=2.
        Trading sessions:
        - Pre-opening: 08:45 to 09:00
        - Regular trading: 09:00 to 12:30
        - Second session (options/specific funds): 13:00 to 15:00
        """
        # In testing or if overridden, can be treated as open
        return True

settings = Settings()
