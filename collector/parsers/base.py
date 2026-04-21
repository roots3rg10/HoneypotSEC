from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime

@dataclass
class AttackEvent:
    honeypot:     str
    source_ip:    str
    timestamp:    datetime = field(default_factory=datetime.utcnow)
    source_port:  Optional[int] = None
    dest_port:    Optional[int] = None
    protocol:     Optional[str] = None
    attack_type:  Optional[str] = None
    username:     Optional[str] = None
    password:     Optional[str] = None
    payload:      Optional[str] = None
    session_id:   Optional[str] = None
    raw_data:     Optional[dict] = None
