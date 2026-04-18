import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { economyRouter } from './routes/economy';

export const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/economy', economyRouter);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});
