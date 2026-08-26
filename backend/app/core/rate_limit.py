"""
Oddiy in-memory rate-limiting: bir email'dan 1 daqiqa ichida
3 tadan ortiq xabar yuborish cheklangan.
"""
from collections import defaultdict
from time import time


class RateLimiter:
    """In-memory sliding-window rate limiter."""

    def __init__(self, max_requests: int = 3, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window = window_seconds
        self._hits: dict[str, list[float]] = defaultdict(list)

    def is_allowed(self, key: str) -> bool:
        now = time()
        cutoff = now - self.window
        self._hits[key] = [t for t in self._hits[key] if t > cutoff]
        if len(self._hits[key]) >= self.max_requests:
            return False
        self._hits[key].append(now)
        return True


contact_limiter = RateLimiter(max_requests=3, window_seconds=60)
