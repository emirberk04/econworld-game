import 'dotenv/config';
import { app } from './app';
import { pool, runMigrations } from './db';

const PORT = process.env.PORT || 3001;

async function start() {
  await pool.query('SELECT 1');
  console.log('[db] PostgreSQL connected');
  await runMigrations();
  app.listen(PORT, () => {
    console.log(`[server] Running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
