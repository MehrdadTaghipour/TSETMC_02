"""
TSETMC Outbound Client with Serialized Queue and Fixture Fallback
Enforces single-flight execution, browser headers, relay routing, and resilient failover.
"""

import asyncio
import json
import logging
import os
import time
from datetime import datetime
from typing import Any, Dict, Optional, Tuple

import httpx

from backend.app.cache import cache
from backend.app.circuit_breaker import circuit_breaker, SoftBlockException
from backend.app.config import settings

logger = logging.getLogger("tsetmc.client")

class TsetmcClient:
    def __init__(self):
        self._queue_lock = asyncio.Lock()
        self._last_request_time = 0.0
        self._fixtures_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "tests", "fixtures")

    def _get_fixture(self, name: str) -> Any:
        fixture_path = os.path.join(self._fixtures_dir, f"{name}.json")
        if os.path.exists(fixture_path):
            with open(fixture_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return None

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "User-Agent": settings.TSETMC_UA,
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "fa,en;q=0.9",
            "Referer": "http://tsetmc.com/",
            "Origin": "http://tsetmc.com",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
        }
        if settings.RELAY_SECRET_TOKEN:
            headers["X-Relay-Token"] = settings.RELAY_SECRET_TOKEN
        return headers

    async def _safe_get(self, url: str) -> Tuple[Any, str]:
        """
        Executes a serialized request to TSETMC or Relay with rate-limit pacing.
        Returns: (parsed_data, source_type)
        """
        # If in mock mode, bypass network entirely
        if settings.MOCK_MODE:
            return None, "fixture"

        # Check circuit breaker
        if not circuit_breaker.can_execute():
            logger.warning("Circuit breaker is OPEN. Fast-failing to cache/fixture.")
            return None, "circuit_open"

        target_url = url
        source = "tsetmc"
        if settings.RELAY_URL:
            # Route through relay
            target_url = f"{settings.RELAY_URL.rstrip('/')}/proxy?target={httpx.URL(url)}"
            source = "relay"

        async with self._queue_lock:
            # Enforce serialized minimum interval
            elapsed_ms = (time.time() - self._last_request_time) * 1000.0
            if elapsed_ms < settings.MIN_REQUEST_INTERVAL_MS:
                await asyncio.sleep((settings.MIN_REQUEST_INTERVAL_MS - elapsed_ms) / 1000.0)

            self._last_request_time = time.time()

            try:
                async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                    resp = await client.get(target_url, headers=self._get_headers())
                    content_type = resp.headers.get("content-type", "")
                    body_text = resp.text

                    # Soft block inspection
                    block_reason = circuit_breaker.detect_soft_block(content_type, body_text)
                    if block_reason:
                        circuit_breaker.record_failure(block_reason)
                        logger.error(f"Soft block encountered from {target_url}: {block_reason}")
                        raise SoftBlockException(block_reason)

                    if resp.status_code != 200:
                        circuit_breaker.record_failure(f"HTTP {resp.status_code}")
                        return None, "error"

                    circuit_breaker.record_success()
                    return resp.json(), source

            except Exception as e:
                circuit_breaker.record_failure(str(e))
                logger.warning(f"Error fetching {target_url}: {e}")
                return None, "error"

    async def get_market_watch(self) -> Tuple[Any, Dict[str, Any]]:
        cache_key = "tsetmc:mw:all"
        ttl = settings.POLL_INTERVAL_OPEN if settings.is_market_open() else settings.POLL_INTERVAL_CLOSED
        cached_data, is_stale = cache.get(cache_key, ttl)

        if cached_data and not is_stale:
            return cached_data, {"demo": False, "source": "tsetmc", "cached": True, "stale": False}

        raw_data, source = await self._safe_get(f"{settings.TSETMC_CDN_BASE}/ClosingPrice/GetMarketWatch")
        if raw_data:
            cache.set(cache_key, raw_data, ttl)
            return raw_data, {"demo": False, "source": source, "cached": False, "stale": False}

        # Stale cache fallback
        if cached_data:
            return cached_data, {"demo": False, "source": "tsetmc", "cached": True, "stale": True}

        # Fixture fallback
        fixture = self._get_fixture("market_watch")
        return fixture, {"demo": True, "source": "fixture", "cached": False, "stale": False}

    async def get_indices(self) -> Tuple[Any, Dict[str, Any]]:
        cache_key = "tsetmc:indices:all"
        cached_data, is_stale = cache.get(cache_key, 15.0)
        if cached_data and not is_stale:
            return cached_data, {"demo": False, "source": "tsetmc", "cached": True, "stale": False}

        raw_data, source = await self._safe_get(f"{settings.TSETMC_CDN_BASE}/Index/GetIndexB2")
        if raw_data:
            cache.set(cache_key, raw_data, 15.0)
            return raw_data, {"demo": False, "source": source, "cached": False, "stale": False}

        if cached_data:
            return cached_data, {"demo": False, "source": "tsetmc", "cached": True, "stale": True}

        fixture = self._get_fixture("indices")
        return fixture, {"demo": True, "source": "fixture", "cached": False, "stale": False}

    async def get_sectors(self) -> Tuple[Any, Dict[str, Any]]:
        cache_key = "tsetmc:sectors:summary"
        cached_data, is_stale = cache.get(cache_key, 30.0)
        if cached_data and not is_stale:
            return cached_data, {"demo": False, "source": "tsetmc", "cached": True, "stale": False}

        fixture = self._get_fixture("sectors")
        return fixture, {"demo": True, "source": "fixture", "cached": False, "stale": False}

    async def get_symbol_detail(self, ins_code: str) -> Tuple[Any, Dict[str, Any]]:
        cache_key = f"tsetmc:quote:{ins_code}"
        cached_data, is_stale = cache.get(cache_key, 5.0)
        if cached_data and not is_stale:
            return cached_data, {"demo": False, "source": "tsetmc", "cached": True, "stale": False}

        mw_data, _ = await self.get_market_watch()
        symbol = next((item for item in (mw_data if isinstance(mw_data, list) else []) if item.get("insCode") == ins_code), None)
        if symbol:
            cache.set(cache_key, symbol, 5.0)
            return symbol, {"demo": False, "source": "tsetmc", "cached": False, "stale": False}

        fixture = self._get_fixture("market_watch")
        symbol = next((item for item in fixture if item.get("insCode") == ins_code), fixture[0])
        return symbol, {"demo": True, "source": "fixture", "cached": False, "stale": False}

    async def get_order_book(self, ins_code: str) -> Tuple[Any, Dict[str, Any]]:
        cache_key = f"tsetmc:ob:{ins_code}"
        cached_data, is_stale = cache.get(cache_key, 3.0)
        if cached_data and not is_stale:
            return cached_data, {"demo": False, "source": "tsetmc", "cached": True, "stale": False}

        raw_data, source = await self._safe_get(f"{settings.TSETMC_CDN_BASE}/BestLimits/{ins_code}")
        if raw_data:
            cache.set(cache_key, raw_data, 3.0)
            return raw_data, {"demo": False, "source": source, "cached": False, "stale": False}

        if cached_data:
            return cached_data, {"demo": False, "source": "tsetmc", "cached": True, "stale": True}

        fixture = self._get_fixture("order_book")
        return fixture, {"demo": True, "source": "fixture", "cached": False, "stale": False}

    async def get_client_type(self, ins_code: str) -> Tuple[Any, Dict[str, Any]]:
        cache_key = f"tsetmc:ct:{ins_code}"
        cached_data, is_stale = cache.get(cache_key, 10.0)
        if cached_data and not is_stale:
            return cached_data, {"demo": False, "source": "tsetmc", "cached": True, "stale": False}

        raw_data, source = await self._safe_get(f"{settings.TSETMC_CDN_BASE}/ClientType/GetClientType/{ins_code}")
        if raw_data:
            cache.set(cache_key, raw_data, 10.0)
            return raw_data, {"demo": False, "source": source, "cached": False, "stale": False}

        if cached_data:
            return cached_data, {"demo": False, "source": "tsetmc", "cached": True, "stale": True}

        fixture = self._get_fixture("client_type")
        return fixture, {"demo": True, "source": "fixture", "cached": False, "stale": False}

    async def get_history(self, ins_code: str, days: int = 30) -> Tuple[Any, Dict[str, Any]]:
        cache_key = f"tsetmc:hist:{ins_code}:{days}"
        cached_data, is_stale = cache.get(cache_key, 3600.0)
        if cached_data and not is_stale:
            return cached_data, {"demo": False, "source": "tsetmc", "cached": True, "stale": False}

        fixture = self._get_fixture("history")
        return fixture, {"demo": True, "source": "fixture", "cached": False, "stale": False}

tsetmc_client = TsetmcClient()
