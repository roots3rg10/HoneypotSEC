from sqlalchemy import Column, Integer, String, Text, Double, DateTime, ARRAY
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from database import Base

class Attack(Base):
    __tablename__ = "attacks"

    id           = Column(Integer, primary_key=True, index=True)
    timestamp    = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    honeypot     = Column(String(50), nullable=False)
    source_ip    = Column(String(45), nullable=False)
    source_port  = Column(Integer)
    dest_port    = Column(Integer)
    protocol     = Column(String(20))
    country      = Column(String(100))
    country_code = Column(String(2))
    city         = Column(String(100))
    latitude     = Column(Double)
    longitude    = Column(Double)
    attack_type  = Column(String(100))
    username     = Column(String(255))
    password     = Column(String(255))
    payload      = Column(Text)
    session_id   = Column(String(255))
    raw_data     = Column(JSONB)

class EducationArticle(Base):
    __tablename__ = "education_articles"

    id           = Column(Integer, primary_key=True, index=True)
    title        = Column(String(255), nullable=False)
    slug         = Column(String(255), nullable=False, unique=True)
    category     = Column(String(100), nullable=False)
    difficulty   = Column(String(20), nullable=False)
    summary      = Column(Text, nullable=False)
    content      = Column(Text, nullable=False)
    honeypot_rel = Column(String(50))
    tags         = Column(ARRAY(Text))
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), server_default=func.now())
