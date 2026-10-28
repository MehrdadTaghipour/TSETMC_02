"""
Circuit Breaker & Soft-Block Detector
Protects the client IP from being permanently blacklisted by TSETMC and maintains
graceful degradation when upstream starts returning HTML blocks or captchas.
"""

import time
from enum import Enum
from typing import Optional

class CircuitState(str, Enum):
    CLOSED = "CLOSED"        # Normal operations: requests flow through
    HALF_OPEN = "HALF_OPEN"  # Testing upstream health with a probe request
    OPEN = "OPEN"            # Block active or server down: fail fast / serve cached or fixture

class SoftBlockException(Exception):
    """Raised when TSETMC returns a soft block (HTML or Persian message instead of JSON)."""
    pass

class CircuitBreaker:
    def __init__(self, failure_threshold: int = 3, cooldown_seconds: float = 30.0):
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self.state: CircuitState = CircuitState.CLOSED
        self.consecutive_failures: int = 0
        self.last_failure_time: float = 0.0
        self.last_success_time: float = time.time()
        self.current_backoff: float = 5.0
        self.last_block_reason: Optional[str] = None

    def can_execute(self) -> bool:
        """Determines if a real outbound call to TSETMC is allowed."""
        now = time.time()
        if self.state == CircuitState.CLOSED:
            return True
        elif self.state == CircuitState.OPEN:
            if now - self.last_failure_time >= self.cooldown_seconds:
                # Transition to HALF_OPEN to test with a single probe
                self.state = CircuitState.HALF_OPEN
                return True
            return False
        elif self.state == CircuitState.HALF_OPEN:
            # Allow single probe
            return True
        return False

    def record_success(self) -> None:
        """Called when an outbound request succeeds with valid JSON data."""
        self.state = CircuitState.CLOSED
        self.consecutive_failures = 0
        self.current_backoff = 5.0
        self.last_success_time = time.time()
        self.last_block_reason = None

    def record_failure(self, reason: str = "Request Failed") -> None:
        """Called when an outbound request times out, errors, or encounters a soft-block."""
        self.consecutive_failures += 1
        self.last_failure_time = time.time()
        self.last_block_reason = reason

        # Increase exponential backoff
        self.current_backoff = min(120.0, self.current_backoff * 2.0)

        if self.consecutive_failures >= self.failure_threshold:
            self.state = CircuitState.OPEN
            self.cooldown_seconds = self.current_backoff

    @staticmethod
    def detect_soft_block(content_type: str, body_text: str) -> Optional[str]:
        """
        Inspects response headers and content for TSETMC anti-bot / blocking signatures.
        """
        lower_body = body_text.lower()
        
        # Check 1: Expected JSON but got HTML document
        if "<!doctype html" in lower_body or "<html" in lower_body:
            return "HTML page returned instead of JSON (likely bot challenge or 403 block)"
        
        # Check 2: Persian block keywords commonly used by Iranian firewall/CDN
        persian_block_keywords = [
            "مسدود",
            "دسترسی غیرمجاز",
            "خطای دسترسی",
            "تعداد درخواست بیش از حد مجاز",
            "کپچا",
            "سامانه موقتا از دسترس خارج است"
        ]
        for kw in persian_block_keywords:
            if kw in body_text:
                return f"Persian blocking keyword detected: '{kw}'"

        return None

circuit_breaker = CircuitBreaker()
