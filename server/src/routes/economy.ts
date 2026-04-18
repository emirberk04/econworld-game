import { Router } from 'express';
import type { Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/requireAuth';
import { claimDailyBonus, getTransactions, getTotalMoneySupply } from '../services/economyService';

export const economyRouter = Router();

economyRouter.post('/daily-bonus', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await claimDailyBonus(req.player!.playerId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    const status = err.code === 'CONFLICT' ? 409 : err.code === 'NOT_FOUND' ? 404 : 500;
    res.status(status).json({ success: false, error: err.message || 'Bir hata oluştu' });
  }
});

economyRouter.get('/transactions', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const transactions = await getTransactions(req.player!.playerId, limit);
    res.json({ success: true, data: { transactions } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Bir hata oluştu' });
  }
});

economyRouter.get('/supply', requireAuth, async (_req, res: Response) => {
  try {
    const total = await getTotalMoneySupply();
    res.json({ success: true, data: { total } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Bir hata oluştu' });
  }
});
