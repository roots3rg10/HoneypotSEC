import asyncio
import calendar
import re
import time
from datetime import datetime
from fastapi import APIRouter
import httpx
import feedparser

router = APIRouter(prefix="/api/news", tags=["news"])

FEEDS = [
    {"name": "The Hacker News",   "url": "https://feeds.feedburner.com/TheHackersNews", "color": "cyan"},
    {"name": "BleepingComputer",  "url": "https://www.bleepingcomputer.com/feed/",      "color": "rose"},
    {"name": "Krebs on Security", "url": "https://krebsonsecurity.com/feed/",           "color": "amber"},
    {"name": "Dark Reading",      "url": "https://www.darkreading.com/rss.xml",         "color": "indigo"},
]

_cache: dict = {"data": [], "ts": 0.0}
_CACHE_TTL = 1800.0


def _strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", " ", text or "").strip()


def _clean(text: str, max_len: int = 300) -> str:
    cleaned = _strip_html(text)
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned[:max_len].rstrip()


def _pub_to_iso(entry) -> str:
    pub = entry.get("published_parsed")
    if pub:
        ts = calendar.timegm(pub)
        return datetime.utcfromtimestamp(ts).isoformat() + "Z"
    return ""


async def _fetch_one(client: httpx.AsyncClient, feed: dict) -> list[dict]:
    try:
        r = await client.get(feed["url"], timeout=10.0, follow_redirects=True)
        parsed = feedparser.parse(r.text)
        items = []
        for entry in parsed.entries[:10]:
            items.append({
                "id":        entry.get("id") or entry.get("link", ""),
                "title":     _clean(entry.get("title", ""), 150),
                "summary":   _clean(entry.get("summary", ""), 280),
                "link":      entry.get("link", ""),
                "source":    feed["name"],
                "color":     feed["color"],
                "published": _pub_to_iso(entry),
            })
        return items
    except Exception:
        return []


@router.get("")
async def get_news():
    now = time.monotonic()
    if _cache["data"] and (now - _cache["ts"]) < _CACHE_TTL:
        return _cache["data"]

    async with httpx.AsyncClient(
        headers={"User-Agent": "Mozilla/5.0 HoneyWatch/1.0"}
    ) as client:
        results = await asyncio.gather(*[_fetch_one(client, f) for f in FEEDS])

    all_items = [item for items in results for item in items]
    _cache["data"] = all_items
    _cache["ts"] = now
    return all_items
