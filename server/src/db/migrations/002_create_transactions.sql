ALTER TABLE players ADD COLUMN IF NOT EXISTS daily_bonus_claimed_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS transactions (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  from_player UUID          REFERENCES players(id),
  to_player   UUID          REFERENCES players(id),
  amount      NUMERIC(18,2) NOT NULL,
  type        VARCHAR(32)   NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_from    ON transactions(from_player);
CREATE INDEX IF NOT EXISTS idx_transactions_to      ON transactions(to_player);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

INSERT INTO schema_migrations (version) VALUES ('002') ON CONFLICT DO NOTHING;
