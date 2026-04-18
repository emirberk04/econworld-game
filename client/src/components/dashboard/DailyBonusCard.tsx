import { useState } from 'react';
import { TerminalButton } from '../ui/TerminalButton';

interface Props {
  dailyBonusClaimedAt: string | null | undefined;
  onClaim: () => Promise<void>;
}

function isTodayClaimed(claimedAt: string | null | undefined): boolean {
  if (!claimedAt) return false;
  const last = new Date(claimedAt).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  return last === today;
}

export function DailyBonusCard({ dailyBonusClaimedAt, onClaim }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(() => isTodayClaimed(dailyBonusClaimedAt));

  async function handleClaim() {
    setLoading(true);
    setError(null);
    try {
      await onClaim();
      setClaimed(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${claimed ? 'var(--border)' : 'var(--positive)'}`,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
    }}>
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: claimed ? 'var(--text)' : 'var(--positive)',
          marginBottom: 4,
        }}>
          Günlük Bonus
        </div>
        <div style={{
          fontFamily: 'var(--font-num)',
          fontSize: 20,
          color: 'var(--title)',
        }}>
          +50 <span style={{ color: 'var(--positive)', fontSize: 14 }}>◈</span>
        </div>
        {error && (
          <div style={{ fontSize: 11, color: 'var(--negative)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            {error}
          </div>
        )}
      </div>
      <TerminalButton
        variant={claimed ? 'ghost' : 'primary'}
        disabled={claimed || loading}
        onClick={handleClaim}
        style={{ minWidth: 100, fontSize: 11 }}
      >
        {loading ? '...' : claimed ? 'ALINDI ✓' : 'AL'}
      </TerminalButton>
    </div>
  );
}
