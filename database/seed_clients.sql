-- ════════════════════════════════════════════════════════════
--  Clientes de demostración — 1 por plan
--  Contraseña de todos: Demo1234!
-- ════════════════════════════════════════════════════════════

INSERT INTO users (username, email, hashed_password, role, is_active, company_name, company_sector, plan) VALUES

-- ── Plan Básico ──────────────────────────────────────────────
(
  'techstart',
  'techstart@demo.es',
  '$2b$10$RDCzT96alaVN68WTybazhuor/LCOWXWUkdLBVgA5DYSws2Gcyf622',
  'client', TRUE,
  'TechStart SL',
  'Tecnología',
  'basico'
),

-- ── Plan Profesional ─────────────────────────────────────────
(
  'logistica',
  'logistica@demo.es',
  '$2b$10$pOGxlppmioJH5lMZKj6cF.w/W9VPf1r6kf0iSdB538U9O9Cu4ydLG',
  'client', TRUE,
  'Logística Rápida SA',
  'Logística',
  'profesional'
),

-- ── Plan Empresarial ─────────────────────────────────────────
(
  'banconacional',
  'banco@demo.es',
  '$2b$10$E283oZ7oeL42g9KIYfMLsOzGnAtndgVwMb4s6qx5KydNSs0ey0DEK',
  'client', TRUE,
  'Banco Nacional',
  'Banca',
  'empresarial'
)

ON CONFLICT (username) DO NOTHING;
