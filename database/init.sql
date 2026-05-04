-- ════════════════════════════════════════════════════════════
--  Honeypot Platform — Esquema de base de datos
-- ════════════════════════════════════════════════════════════

-- Tabla de usuarios (el primer admin se crea en el startup del backend)
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(100) NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'employee'
                        CHECK (role IN ('admin', 'employee')),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role     ON users(role);

-- Tabla principal de ataques
CREATE TABLE IF NOT EXISTS attacks (
    id              SERIAL PRIMARY KEY,
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    honeypot        VARCHAR(50) NOT NULL,
    source_ip       VARCHAR(45) NOT NULL,
    source_port     INTEGER,
    dest_port       INTEGER,
    protocol        VARCHAR(20),
    country         VARCHAR(100),
    country_code    CHAR(2),
    city            VARCHAR(100),
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    attack_type     VARCHAR(100),
    username        VARCHAR(255),
    password        VARCHAR(255),
    payload         TEXT,
    session_id      VARCHAR(255),
    raw_data        JSONB
);

CREATE INDEX IF NOT EXISTS idx_attacks_timestamp   ON attacks(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_attacks_honeypot    ON attacks(honeypot);
CREATE INDEX IF NOT EXISTS idx_attacks_source_ip   ON attacks(source_ip);
CREATE INDEX IF NOT EXISTS idx_attacks_attack_type ON attacks(attack_type);
CREATE INDEX IF NOT EXISTS idx_attacks_country     ON attacks(country_code);

-- Tabla de artículos educativos
CREATE TABLE IF NOT EXISTS education_articles (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    category        VARCHAR(100) NOT NULL,
    difficulty      VARCHAR(20)  NOT NULL CHECK (difficulty IN ('principiante','intermedio','avanzado')),
    summary         TEXT NOT NULL,
    content         TEXT NOT NULL,
    honeypot_rel    VARCHAR(50),
    tags            TEXT[],
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_category ON education_articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_slug     ON education_articles(slug);

-- Preguntas de quiz por artículo
CREATE TABLE IF NOT EXISTS quiz_questions (
    id            SERIAL PRIMARY KEY,
    article_slug  VARCHAR(255) NOT NULL REFERENCES education_articles(slug) ON DELETE CASCADE,
    question      TEXT NOT NULL,
    options       JSONB NOT NULL,
    correct_index INTEGER NOT NULL,
    order_num     INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_slug ON quiz_questions(article_slug);

-- Resultados de quizzes por usuario
CREATE TABLE IF NOT EXISTS quiz_results (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_slug VARCHAR(255) NOT NULL,
    score        INTEGER NOT NULL,
    max_score    INTEGER NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user    ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_slug    ON quiz_results(article_slug);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_slug ON quiz_results(user_id, article_slug);
