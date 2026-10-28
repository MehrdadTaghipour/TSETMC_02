"""
Iranian IP Relay Proxy Server
Deploy this minimal service on an Iranian VPS (e.g., Shatel, Asiatech, Afranet, Mobinnet).
It receives signed requests from foreign-hosted instances and forwards them with authentic
local Iranian IP connectivity to TSETMC CDN and legacy servers.
"""

import os
import httpx
from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.responses import Response

app = FastAPI(title="TSETMC Iran Relay Proxy", version="1.0.0")

RELAY_SECRET_TOKEN = os.getenv("RELAY_SECRET_TOKEN", "default_secret_token_change_me")
ALLOWED_HOSTS = ["cdn.tsetmc.com", "old.tsetmc.com", "tsetmc.com"]

DEFAULT_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)

@app.get("/health")
def health():
    return {"status": "RELAY_ONLINE", "location": "Iran"}

@app.get("/proxy")
async def proxy_tsetmc(
    target: str = Query(..., description="Target TSETMC URL"),
    x_relay_token: str = Header(None, alias="X-Relay-Token")
):
    # Verify authorization
    if RELAY_SECRET_TOKEN and x_relay_token != RELAY_SECRET_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized relay access")

    # Safety check on target host
    target_url = httpx.URL(target)
    if target_url.host not in ALLOWED_HOSTS:
        raise HTTPException(status_code=400, detail="Target host not in allowed TSETMC domain list")

    headers = {
        "User-Agent": DEFAULT_UA,
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "fa-IR,fa;q=0.9,en;q=0.8",
        "Referer": "http://tsetmc.com/",
        "Origin": "http://tsetmc.com"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            resp = await client.get(target, headers=headers)
            return Response(
                content=resp.content,
                status_code=resp.status_code,
                media_type=resp.headers.get("content-type", "application/json")
            )
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Upstream TSETMC error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("relay.server:app", host="0.0.0.0", port=8080)
