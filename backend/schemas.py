from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AttackOut(BaseModel):
    id:           int
    timestamp:    datetime
    honeypot:     str
    source_ip:    str
    source_port:  Optional[int]
    dest_port:    Optional[int]
    protocol:     Optional[str]
    country:      Optional[str]
    country_code: Optional[str]
    city:         Optional[str]
    latitude:     Optional[float]
    longitude:    Optional[float]
    attack_type:  Optional[str]
    username:     Optional[str]
    password:     Optional[str]
    payload:      Optional[str]
    session_id:   Optional[str]

    class Config:
        from_attributes = True

class AttackList(BaseModel):
    total:   int
    page:    int
    limit:   int
    items:   List[AttackOut]

class SummaryStats(BaseModel):
    total_attacks:    int
    unique_ips:       int
    attacks_today:    int
    top_honeypot:     Optional[str]
    top_country:      Optional[str]
    top_attack_type:  Optional[str]

class TimelinePoint(BaseModel):
    hour:   str
    count:  int

class HoneypotStat(BaseModel):
    honeypot: str
    count:    int

class CountryStat(BaseModel):
    country:      str
    country_code: Optional[str]
    count:        int
    latitude:     Optional[float]
    longitude:    Optional[float]

class TopIP(BaseModel):
    source_ip: str
    count:     int
    country:   Optional[str]

class TopPort(BaseModel):
    dest_port: Optional[int]
    count:     int

class ArticleOut(BaseModel):
    id:           int
    title:        str
    slug:         str
    category:     str
    difficulty:   str
    summary:      str
    honeypot_rel: Optional[str]
    tags:         Optional[List[str]]

    class Config:
        from_attributes = True

class ArticleDetail(ArticleOut):
    content:    str
    created_at: datetime
