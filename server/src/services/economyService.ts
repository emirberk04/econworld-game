import { pool } from '../db';

const DAILY_BONUS_AMOUNT = 50;

export async function claimDailyBonus(playerId: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      'SELECT id, balance, daily_bonus_claimed_at FROM players WHERE id = $1 FOR UPDATE',
      [playerId]
    );

    if (result.rows.length === 0) {
      throw { code: 'NOT_FOUND', message: 'Oyuncu bulunamadı' };
    }

    const row = result.rows[0];
    if (row.daily_bonus_claimed_at) {
      const lastClaim = new Date(row.daily_bonus_claimed_at);
      const now = new Date();
      // Compare UTC date strings to avoid timezone bugs
      const lastDate = lastClaim.toISOString().slice(0, 10);
      const today = now.toISOString().slice(0, 10);
      if (lastDate === today) {
        throw { code: 'CONFLICT', message: 'Günlük bonus bugün zaten alındı' };
      }
    }

    const updated = await client.query(
      `UPDATE players
       SET balance = balance + $1, daily_bonus_claimed_at = NOW()
       WHERE id = $2
       RETURNING id, username, email, balance, reputation, profession, premium, created_at, daily_bonus_claimed_at`,
      [DAILY_BONUS_AMOUNT, playerId]
    );

    const tx = await client.query(
      `INSERT INTO transactions (to_player, amount, type)
       VALUES ($1, $2, 'bonus')
       RETURNING *`,
      [playerId, DAILY_BONUS_AMOUNT]
    );

    await client.query('COMMIT');
    return { player: updated.rows[0], transaction: tx.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getTransactions(playerId: string, limit = 20) {
  const result = await pool.query(
    `SELECT t.*,
            fp.username AS from_username,
            tp.username AS to_username
     FROM transactions t
     LEFT JOIN players fp ON t.from_player = fp.id
     LEFT JOIN players tp ON t.to_player   = tp.id
     WHERE t.from_player = $1 OR t.to_player = $1
     ORDER BY t.created_at DESC
     LIMIT $2`,
    [playerId, limit]
  );
  return result.rows;
}

export async function getTotalMoneySupply(): Promise<number> {
  const result = await pool.query('SELECT COALESCE(SUM(balance), 0) AS total FROM players');
  return parseFloat(result.rows[0].total);
}

export async function transferBalance(
  fromPlayerId: string,
  toPlayerId: string,
  amount: number,
  type: string
) {
  if (amount <= 0) {
    throw { code: 'INVALID', message: 'Geçersiz miktar' };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock both rows in sorted order to prevent deadlocks
    const [firstId, secondId] = [fromPlayerId, toPlayerId].sort();
    await client.query(
      'SELECT id FROM players WHERE id IN ($1, $2) FOR UPDATE',
      [firstId, secondId]
    );

    const senderResult = await client.query(
      'SELECT balance FROM players WHERE id = $1',
      [fromPlayerId]
    );
    if (senderResult.rows.length === 0) {
      throw { code: 'NOT_FOUND', message: 'Gönderen bulunamadı' };
    }
    if (parseFloat(senderResult.rows[0].balance) < amount) {
      throw { code: 'INSUFFICIENT_FUNDS', message: 'Yetersiz bakiye' };
    }

    await client.query('UPDATE players SET balance = balance - $1 WHERE id = $2', [amount, fromPlayerId]);
    await client.query('UPDATE players SET balance = balance + $1 WHERE id = $2', [amount, toPlayerId]);
    await client.query(
      'INSERT INTO transactions (from_player, to_player, amount, type) VALUES ($1, $2, $3, $4)',
      [fromPlayerId, toPlayerId, amount, type]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
