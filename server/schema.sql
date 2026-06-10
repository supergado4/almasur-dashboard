-- Almasur Dashboard — Schema PostgreSQL
-- Ejecutar: psql $DATABASE_URL -f server/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── USUARIOS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  role          VARCHAR(100),
  organization  VARCHAR(255),
  avatar        VARCHAR(10),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── TAREAS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id                    VARCHAR(50)  PRIMARY KEY,
  title                 VARCHAR(500) NOT NULL,
  brand_id              VARCHAR(50)  NOT NULL,
  type                  VARCHAR(100) NOT NULL,
  status                VARCHAR(50)  NOT NULL DEFAULT 'backlog',
  urgency               VARCHAR(20)  DEFAULT 'normal',
  phase                 VARCHAR(50),
  assigned_to           VARCHAR(255),
  description           TEXT,
  request_date          DATE,
  completed_date        DATE,
  estimated_market_cost INTEGER      DEFAULT 0,
  created_at            TIMESTAMPTZ  DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  DEFAULT NOW()
);

-- Auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── ESTADÍSTICAS DIARIAS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_stats (
  id               SERIAL       PRIMARY KEY,
  brand_id         VARCHAR(50)  NOT NULL,
  date             DATE         NOT NULL,
  spend_google     DECIMAL(12,2) DEFAULT 0,
  spend_meta       DECIMAL(12,2) DEFAULT 0,
  leads_google     INTEGER      DEFAULT 0,
  leads_meta       INTEGER      DEFAULT 0,
  contacted_google INTEGER      DEFAULT 0,
  contacted_meta   INTEGER      DEFAULT 0,
  qualified_google INTEGER      DEFAULT 0,
  qualified_meta   INTEGER      DEFAULT 0,
  assigned_google  INTEGER      DEFAULT 0,
  assigned_meta    INTEGER      DEFAULT 0,
  closed_google    INTEGER      DEFAULT 0,
  closed_meta      INTEGER      DEFAULT 0,
  revenue_google   DECIMAL(12,2) DEFAULT 0,
  revenue_meta     DECIMAL(12,2) DEFAULT 0,
  UNIQUE(brand_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_brand_date ON daily_stats(brand_id, date);
CREATE INDEX IF NOT EXISTS idx_tasks_brand ON tasks(brand_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
