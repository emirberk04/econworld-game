import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { pool } from '../db';

const SALT_ROUNDS = 12;

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface ServiceError {
  code: string;
  message: string;
}

function generateTokens(playerId: string, username: string) {
  const accessOpts: SignOptions = { expiresIn: '15m' };
  const refreshOpts: SignOptions = { expiresIn: '7d' };
  const accessToken = jwt.sign({ playerId, username }, process.env.JWT_SECRET!, accessOpts);
  const refreshToken = jwt.sign({ playerId, username }, process.env.JWT_REFRESH_SECRET!, refreshOpts);
  return { accessToken, refreshToken };
}

export async function registerPlayer(payload: RegisterPayload) {
  const { username, email, password } = payload;

  const existing = await pool.query(
    'SELECT id FROM players WHERE email = $1 OR username = $2',
    [email, username]
  );
  if (existing.rows.length > 0) {
    const err: ServiceError = {
      code: 'CONFLICT',
      message: 'Bu e-posta veya kullanıcı adı zaten kullanımda',
    };
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query(
    `INSERT INTO players (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, balance, reputation, profession, premium, created_at`,
    [username, email, passwordHash]
  );

  const player = result.rows[0];
  const tokens = generateTokens(player.id, player.username);
  return { player, ...tokens };
}

export async function loginPlayer(payload: LoginPayload) {
  const { email, password } = payload;

  const result = await pool.query('SELECT * FROM players WHERE email = $1', [email]);

  if (result.rows.length === 0) {
    const err: ServiceError = {
      code: 'UNAUTHORIZED',
      message: 'E-posta veya şifre hatalı',
    };
    throw err;
  }

  const row = result.rows[0];
  const match = await bcrypt.compare(password, row.password_hash);
  if (!match) {
    const err: ServiceError = {
      code: 'UNAUTHORIZED',
      message: 'E-posta veya şifre hatalı',
    };
    throw err;
  }

  const { password_hash, ...player } = row;
  const tokens = generateTokens(player.id, player.username);
  return { player, ...tokens };
}

export async function getPlayerById(playerId: string) {
  const result = await pool.query(
    'SELECT id, username, email, balance, reputation, profession, premium, created_at FROM players WHERE id = $1',
    [playerId]
  );
  if (result.rows.length === 0) {
    const err: ServiceError = { code: 'NOT_FOUND', message: 'Oyuncu bulunamadı' };
    throw err;
  }
  return result.rows[0];
}
