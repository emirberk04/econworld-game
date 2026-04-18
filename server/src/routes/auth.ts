import { Router, Request, Response } from 'express';
import * as authService from '../services/authService';
import { requireAuth, AuthRequest } from '../middleware/requireAuth';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'Tüm alanlar zorunludur' });
    }
    if (username.length < 3 || username.length > 32) {
      return res.status(400).json({ success: false, error: 'Kullanıcı adı 3-32 karakter arasında olmalıdır' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Şifre en az 8 karakter olmalıdır' });
    }

    const result = await authService.registerPlayer({ username, email, password });
    console.log(`[auth] New player registered: ${email}`);
    return res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    console.error('[auth] Register error:', err);
    if (err.code === 'CONFLICT') {
      return res.status(409).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: 'Sunucu hatası oluştu' });
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'E-posta ve şifre zorunludur' });
    }

    const result = await authService.loginPlayer({ email, password });
    console.log(`[auth] Player logged in: ${email}`);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    console.error('[auth] Login error:', err);
    if (err.code === 'UNAUTHORIZED') {
      return res.status(401).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: 'Sunucu hatası oluştu' });
  }
});

authRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const player = await authService.getPlayerById(req.player!.playerId);
    return res.status(200).json({ success: true, data: { player } });
  } catch (err: any) {
    console.error('[auth] /me error:', err);
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: 'Sunucu hatası oluştu' });
  }
});
