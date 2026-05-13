from sqlalchemy import Column, Integer, String, Text, Double, DateTime, ARRAY, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    username        = Column(String(100), nullable=False, unique=True)
    email           = Column(String(255), nullable=False, unique=True)
    hashed_password = Column(String(255), nullable=False)
    role            = Column(String(20), nullable=False, default="employee")
    is_active       = Column(Boolean, nullable=False, default=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    # Campos para clientes empresa (role="client")
    company_name    = Column(String(255), nullable=True)
    company_sector  = Column(String(100), nullable=True)
    plan            = Column(String(20),  nullable=True, default="basico")


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


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id            = Column(Integer, primary_key=True, index=True)
    article_slug  = Column(String(255), nullable=False, index=True)
    question      = Column(Text, nullable=False)
    options       = Column(JSONB, nullable=False)
    correct_index = Column(Integer, nullable=False)
    order_num     = Column(Integer, nullable=False, default=0)


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, nullable=False, index=True)
    article_slug = Column(String(255), nullable=False, index=True)
    score        = Column(Integer, nullable=False)
    max_score    = Column(Integer, nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())


class Sensor(Base):
    __tablename__ = "sensors"

    id           = Column(Integer, primary_key=True, index=True)
    tenant_id    = Column(Integer, nullable=False, index=True)
    name         = Column(String(100), nullable=False, default="sensor-1")
    hostname     = Column(String(255), nullable=True)
    ip_address   = Column(String(45),  nullable=True)
    plan         = Column(String(20),  nullable=False)
    status       = Column(String(20),  nullable=False, default="active")
    installed_at = Column(DateTime(timezone=True), server_default=func.now())
    last_seen    = Column(DateTime(timezone=True), nullable=True)


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
