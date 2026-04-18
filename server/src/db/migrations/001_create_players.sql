-- Migration: 001_create_players
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS players (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(32)   UNIQUE NOT NULL,
  email         VARCHAR(255)  UNIQUE NOT NULL,
  password_hash TEXT          NOT NULL,
  balance       NUMERIC(18,2) NOT NULL DEFAULT 1000.00,
  reputation    INT           NOT NULL DEFAULT 50,
  profession    VARCHAR(32),
  premium       BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_email    ON players(email);
CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);

CREATE TABLE IF NOT EXISTS schema_migrations (
  version    VARCHAR(32) PRIMARY KEY,
  applied_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO schema_migrations (version) VALUES ('001') ON CONFLICT DO NOTHING;
