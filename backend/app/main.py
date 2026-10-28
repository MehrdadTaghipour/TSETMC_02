"""
TSETMC FastAPI Service
Exposes stable, versioned API endpoints with unified _meta headers and Iranian capital market data.
"""

from datetime import datetime
from typing import Optional
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from backend.app.circuit_breaker import circuit_breaker
from backend.app.config import settings
from backend.app.tsetmc_client import tsetmc_client

app = FastAPI(
    title="TSETMC Live API",
    description="سرویس جامع دریافت و تجمیع داده‌های بازار بورس اوراق بهادار تهران (TSETMC)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def build_meta(meta_dict: dict) -> dict:
    now = datetime.utcnow()
    return {
        "demo": meta_dict.get("demo", False),
        "source": meta_dict.get("source", "tsetmc"),
        "fetched_at": now.isoformat() + "Z",
        "cached": meta_dict.get("cached", False),
        "stale": meta_dict.get("stale", False),
        "market_status": "OPEN" if settings.is_market_open() else "CLOSED",
        "circuit_breaker": circuit_breaker.state.value,
        "consecutive_failures": circuit_breaker.consecutive_failures
    }

@app.get("/api/health")
async def get_health():
    """Returns upstream connectivity, circuit breaker health, and relay status."""
    return {
        "status": "UP",
        "upstream": "ONLINE" if circuit_breaker.state.value != "OPEN" else "DEGRADED",
        "circuit_breaker_state": circuit_breaker.state.value,
        "consecutive_failures": circuit_breaker.consecutive_failures,
        "last_failure_reason": circuit_breaker.last_block_reason,
        "relay_configured": bool(settings.RELAY_URL),
        "mock_mode": settings.MOCK_MODE,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/market-watch")
async def get_market_watch(
    sector: Optional[str] = Query(None, description="کد صنعت"),
    market: Optional[int] = Query(0, description="کد بازار: ۰ همه، ۱ بورس، ۲ فرابورس")
):
    """Full market snapshot (one consolidated call)."""
    data, meta = await tsetmc_client.get_market_watch()
    if isinstance(data, list):
        if sector:
            data = [s for s in data if str(s.get("sectorCode")) == sector]
        if market == 1:
            data = [s for s in data if "بورس" in s.get("market", "")]
        elif market == 2:
            data = [s for s in data if "فرابورس" in s.get("market", "")]
    return {"_meta": build_meta(meta), "data": data}

@app.get("/api/indices")
async def get_indices():
    """Overall market indices (TEDPIX, Equal Weighted, Farabourse)."""
    data, meta = await tsetmc_client.get_indices()
    return {"_meta": build_meta(meta), "data": data}

@app.get("/api/sectors")
async def get_sectors():
    """Sector-level market aggregation."""
    data, meta = await tsetmc_client.get_sectors()
    return {"_meta": build_meta(meta), "data": data}

@app.get("/api/symbol/{ins_code}")
async def get_symbol(ins_code: str):
    """Per-symbol quote header and fundamentals."""
    data, meta = await tsetmc_client.get_symbol_detail(ins_code)
    return {"_meta": build_meta(meta), "data": data}

@app.get("/api/symbol/{ins_code}/orderbook")
async def get_order_book(ins_code: str):
    """5-level bid/ask order book depth."""
    data, meta = await tsetmc_client.get_order_book(ins_code)
    return {"_meta": build_meta(meta), "data": data}

@app.get("/api/symbol/{ins_code}/client-type")
async def get_client_type(ins_code: str):
    """Real vs Legal (حقیقی و حقوقی) transaction volume and ownership transfer."""
    data, meta = await tsetmc_client.get_client_type(ins_code)
    return {"_meta": build_meta(meta), "data": data}

@app.get("/api/symbol/{ins_code}/history")
async def get_history(ins_code: str, days: int = Query(30, ge=1, le=365)):
    """Daily trading history with Jalali/Gregorian dates."""
    data, meta = await tsetmc_client.get_history(ins_code, days)
    return {"_meta": build_meta(meta), "data": data}

@app.get("/api/most-viewed")
async def get_most_viewed():
    """Most viewed / trending symbols."""
    data, meta = await tsetmc_client.get_market_watch()
    if isinstance(data, list):
        sorted_symbols = sorted(data, key=lambda x: x.get("tradeCount", 0), reverse=True)[:10]
    else:
        sorted_symbols = []
    return {"_meta": build_meta(meta), "data": sorted_symbols}

@app.get("/api/search")
async def search_symbols(q: str = Query(..., min_length=1)):
    """Symbol autocomplete over local cache."""
    data, meta = await tsetmc_client.get_market_watch()
    results = []
    if isinstance(data, list):
        q_lower = q.lower()
        for s in data:
            if (q_lower in s.get("symbol", "").lower() or
                q_lower in s.get("name", "").lower() or
                q_lower in s.get("symbolEn", "").lower() or
                q_lower in s.get("nameEn", "").lower()):
                results.append(s)
    return {"_meta": build_meta(meta), "data": results[:15]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
