import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  player?: { playerId: string; username: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Oturum açmanız gerekiyor' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { playerId: string; username: string };
    req.player = { playerId: decoded.playerId, username: decoded.username };
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Oturum süresi dolmuş, lütfen tekrar giriş yapın' });
  }
}
