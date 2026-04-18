import { SkeletonBlock } from '../ui/SkeletonBlock';

interface Props {
  balance: string | null;
  loading: boolean;
}

function formatBalance(val: string): string {
  return parseFloat(val).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function BalanceCard({ balance, loading }: Props) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      padding: '20px 20px 16px',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--text)',
        marginBottom: 12,
      }}>
        Bakiye
      </div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SkeletonBlock height="2.5rem" width="60%" />
          <SkeletonBlock height="1rem" width="40%" />
        </div>
      ) : (
        <>
          <div style={{
            fontFamily: 'var(--font-num)',
            fontSize: 36,
            fontWeight: 500,
            color: 'var(--title)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>
            {balance ? formatBalance(balance) : '—'}
            <span style={{ fontSize: 18, marginLeft: 8, color: 'var(--positive)' }}>◈</span>
          </div>
          <div style={{
            marginTop: 8,
            fontFamily: 'var(--font-num)',
            fontSize: 12,
            color: 'var(--text)',
          }}>
            Başlangıç bakiyesi
          </div>
        </>
      )}
    </div>
  );
}
