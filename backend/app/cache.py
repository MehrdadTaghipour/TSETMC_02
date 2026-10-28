"""
Two-Tier Cache Layer (In-Memory with Disk Fallback)
Provides low latency during active market queries and preserves stale snapshots
when TSETMC experiences blocks or connectivity issues.
"""

import time
import json
import os
from typing import Any, Optional, Tuple

class HybridCache:
    def __init__(self, cache_dir: str = "/tmp/tsetmc_cache"):
        self.cache_dir = cache_dir
        self._memory_store = {}
        os.makedirs(self.cache_dir, exist_ok=True)

    def get(self, key: str, max_age_seconds: Optional[float] = None) -> Tuple[Optional[Any], bool]:
        """
        Retrieves value from memory or disk.
        Returns: (data, is_stale)
        """
        now = time.time()
        # 1. Check in-memory store
        if key in self._memory_store:
            entry = self._memory_store[key]
            age = now - entry["timestamp"]
            ttl = entry.get("ttl", 10.0)
            if max_age_seconds is not None:
                ttl = max_age_seconds
            
            if age <= ttl:
                return entry["data"], False
            # Still valid as stale fallback
            return entry["data"], True

        # 2. Check disk store
        safe_key = key.replace(":", "_").replace("/", "_")
        disk_path = os.path.join(self.cache_dir, f"{safe_key}.json")
        if os.path.exists(disk_path):
            try:
                with open(disk_path, "r", encoding="utf-8") as f:
                    entry = json.load(f)
                age = now - entry["timestamp"]
                # Store in memory for next fast lookup
                self._memory_store[key] = entry
                ttl = entry.get("ttl", 10.0)
                if max_age_seconds is not None:
                    ttl = max_age_seconds
                is_stale = age > ttl
                return entry["data"], is_stale
            except Exception:
                pass

        return None, False

    def set(self, key: str, data: Any, ttl_seconds: float = 10.0) -> None:
        """
        Stores value in memory and asynchronously to disk.
        """
        now = time.time()
        entry = {
            "timestamp": now,
            "ttl": ttl_seconds,
            "data": data
        }
        self._memory_store[key] = entry
        
        # Write to disk cache
        try:
            safe_key = key.replace(":", "_").replace("/", "_")
            disk_path = os.path.join(self.cache_dir, f"{safe_key}.json")
            with open(disk_path, "w", encoding="utf-8") as f:
                json.dump(entry, f, ensure_ascii=False)
        except Exception:
            pass

    def clear(self) -> None:
        self._memory_store.clear()

cache = HybridCache()
