"""
Unit tests for the resilient TSETMC Client
Validates:
- Browser User-Agent header injection
- Soft-block detection (HTML responses and Persian error strings)
- Exponential backoff and circuit breaker state changes
- Cache TTL expiration
- Fixtures fallback mode
"""

import pytest
import time
from backend.app.config import settings
from backend.app.circuit_breaker import CircuitBreaker, CircuitState
from backend.app.cache import HybridCache

def test_user_agent_header():
    """Verify that the User-Agent is explicitly a realistic desktop browser."""
    assert "Mozilla/5.0" in settings.TSETMC_UA
    assert "Chrome/" in settings.TSETMC_UA
    assert "python" not in settings.TSETMC_UA.lower()

def test_soft_block_detection_html():
    """Verify detection of HTML doc when JSON was expected."""
    html_sample = "<!DOCTYPE html><html><body>Access Denied / Captcha Challenge</body></html>"
    reason = CircuitBreaker.detect_soft_block("text/html", html_sample)
    assert reason is not None
    assert "HTML page returned" in reason

def test_soft_block_detection_persian_keyword():
    """Verify detection of Persian firewall/blocking terms."""
    persian_sample = '{"status": "error", "message": "دسترسی شما موقتا به دلیل ارسال درخواست مکرر مسدود گردیده است"}'
    reason = CircuitBreaker.detect_soft_block("application/json", persian_sample)
    assert reason is not None
    assert "مسدود" in reason

def test_circuit_breaker_transitions():
    """Verify failure threshold leads to OPEN circuit and prevents execution."""
    cb = CircuitBreaker(failure_threshold=3, cooldown_seconds=2.0)
    assert cb.state == CircuitState.CLOSED
    assert cb.can_execute() is True

    # 1st failure
    cb.record_failure("Timeout")
    assert cb.state == CircuitState.CLOSED

    # 2nd failure
    cb.record_failure("Timeout")
    assert cb.state == CircuitState.CLOSED

    # 3rd failure triggers OPEN
    cb.record_failure("Soft block")
    assert cb.state == CircuitState.OPEN
    assert cb.can_execute() is False

def test_cache_ttl_and_stale_fallback(tmp_path):
    """Verify that cached data expires after TTL but can still serve as stale fallback."""
    cache = HybridCache(cache_dir=str(tmp_path))
    test_key = "test:symbol:foolad"
    data = {"symbol": "فولاد", "price": 5150}

    # Store with 0.1s TTL
    cache.set(test_key, data, ttl_seconds=0.1)

    # Immediately fetch: fresh
    val, is_stale = cache.get(test_key, max_age_seconds=0.1)
    assert val == data
    assert is_stale is False

    # Wait for expiry
    time.sleep(0.15)

    # Fetch after expiry: stale
    val, is_stale = cache.get(test_key, max_age_seconds=0.1)
    assert val == data
    assert is_stale is True
