from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─── Auth ─────────────────────────────────────────────────────
class TokenResponse(BaseModel):
    access_token: str
    token_type:   str
    role:         str


class UserOut(BaseModel):
    id:             int
    username:       str
    email:          Optional[str] = None
    role:           str
    is_active:      bool
    created_at:     datetime
    company_name:   Optional[str] = None
    company_sector: Optional[str] = None
    plan:           Optional[str] = None

    class Config:
        from_attributes = True


class FreemiumRegisterIn(BaseModel):
    username: str
    password: str


class ClientRegisterIn(BaseModel):
    company_name:   str
    company_sector: str
    username:       str
    email:          EmailStr
    password:       str
    plan:           str = "basico"


class AdminCreateClientIn(BaseModel):
    username:       str
    email:          EmailStr
    password:       str
    company_name:   str
    company_sector: Optional[str] = None
    plan:           str = "profesional"


class AdminCreateEmployeeIn(BaseModel):
    username: str
    email:    EmailStr
    password: str


# ─── Attacks ──────────────────────────────────────────────────
class PublicAttackOut(BaseModel):
    id:           int
    timestamp:    datetime
    honeypot:     str
    dest_port:    Optional[int]
    protocol:     Optional[str]
    country:      Optional[str]
    country_code: Optional[str]
    attack_type:  Optional[str]

    class Config:
        from_attributes = True


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
    raw_data:     Optional[dict] = None

    class Config:
        from_attributes = True


class AttackList(BaseModel):
    total: int
    page:  int
    limit: int
    items: List[AttackOut]


# ─── Stats ────────────────────────────────────────────────────
class SummaryStats(BaseModel):
    total_attacks:   int
    unique_ips:      int
    attacks_today:   int
    top_honeypot:    Optional[str]
    top_country:     Optional[str]
    top_attack_type: Optional[str]


class TimelinePoint(BaseModel):
    hour:  str
    count: int


class HoneypotStat(BaseModel):
    honeypot: str
    count:    int


class CountryStat(BaseModel):
    country:      str
    country_code: Optional[str]
    count:        int
    latitude:     Optional[float]
    longitude:    Optional[float]


class CountryHoneypotStat(BaseModel):
    country:      str
    country_code: Optional[str]
    honeypot:     str
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


# ─── Quiz ─────────────────────────────────────────────────────
class QuizQuestionOut(BaseModel):
    id:       int
    question: str
    options:  List[str]
    order_num: int

    class Config:
        from_attributes = True


class QuizSubmit(BaseModel):
    answers: List[int]


class QuizResultOut(BaseModel):
    score:   int
    max_score: int
    passed:  bool
    details: List[dict]


class AdminQuizResultRow(BaseModel):
    id:           int
    user_id:      int
    username:     str
    article_slug: str
    score:        int
    max_score:    int
    completed_at: datetime

    class Config:
        from_attributes = True


class UserQuizResultRow(BaseModel):
    id:           int
    article_slug: str
    score:        int
    max_score:    int
    completed_at: datetime

    class Config:
        from_attributes = True


# ─── Sensor ───────────────────────────────────────────────────
class SensorTokenRequest(BaseModel):
    client_id: int
    name:      str = "sensor-1"


class SensorTokenOut(BaseModel):
    install_token: str
    expires_in:    str
    install_cmd:   str


class ClientTokenOut(BaseModel):
    has_token:     bool
    install_token: Optional[str]  = None
    install_cmd:   Optional[str]  = None
    created_at:    Optional[datetime] = None
    expires_at:    Optional[datetime] = None
    is_expired:    Optional[bool] = None


class SensorBootstrapOut(BaseModel):
    tenant_id:    int
    plan:         str
    sensor_id:    int
    ingest_token: str
    compose:      str


class SensorOut(BaseModel):
    id:           int
    tenant_id:    int
    name:         str
    hostname:     Optional[str]
    ip_address:   Optional[str]
    plan:         str
    status:       str
    installed_at: datetime
    last_seen:    Optional[datetime]

    class Config:
        from_attributes = True


# ─── Education ────────────────────────────────────────────────
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
