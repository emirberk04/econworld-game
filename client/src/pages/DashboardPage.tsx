import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { economyApi } from '../api/economy';
import type { Transaction } from '../api/economy';
import { useAuth } from '../hooks/useAuth';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { PlayerInfoCard } from '../components/dashboard/PlayerInfoCard';
import { DailyBonusCard } from '../components/dashboard/DailyBonusCard';
import { TransactionList } from '../components/dashboard/TransactionList';

const NAV_ITEMS = [
  { label: 'Pazar' },
  { label: 'Envanter' },
  { label: 'Banka' },
  { label: 'Şirket' },
];

export function DashboardPage() {
  const { player: storedPlayer, setPlayer } = useAuthStore();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    authApi.me()
      .then((res) => setPlayer(res.data.player))
      .catch(() => {})
      .finally(() => setLoading(false));

    economyApi.getTransactions(20)
      .then((res) => setTransactions(res.data.data.transactions))
      .catch(() => {})
      .finally(() => setTxLoading(false));
  }, [setPlayer]);

  async function handleClaimBonus() {
    const res = await economyApi.claimDailyBonus();
    setPlayer(res.data.data.player);
    setTransactions((prev) => [res.data.data.transaction, ...prev]);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <DashboardHeader
        username={storedPlayer?.username ?? '...'}
        onLogout={logout}
      />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <BalanceCard balance={storedPlayer?.balance ?? null} loading={loading} />

          <DailyBonusCard
            dailyBonusClaimedAt={storedPlayer?.daily_bonus_claimed_at ?? null}
            onClaim={handleClaimBonus}
          />

          <PlayerInfoCard player={storedPlayer} loading={loading} />

          <TransactionList
            transactions={transactions}
            playerId={storedPlayer?.id}
            loading={txLoading}
          />

          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            padding: '16px 20px',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text)',
              marginBottom: 12,
            }}>
              Modüller
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  style={{
                    border: '1px solid var(--border)',
                    padding: '12px 16px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {item.label}
                  <span style={{ fontSize: 10, letterSpacing: '0.06em' }}>FAZ 3+</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
