import { SkeletonBlock } from '../ui/SkeletonBlock';
import type { Transaction } from '../../api/economy';

interface Props {
  transactions: Transaction[];
  playerId: string | undefined;
  loading: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  bonus:       'Günlük Bonus',
  tax:         'Vergi',
  market_buy:  'Pazar Alım',
  market_sell: 'Pazar Satış',
  transfer:    'Transfer',
  loan_repay:  'Kredi Ödemesi',
};

function formatAmount(amount: string): string {
  return parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }) +
    ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export function TransactionList({ transactions, playerId, loading }: Props) {
  return (
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
        İşlem Geçmişi
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => <SkeletonBlock key={i} height="2.5rem" />)}
        </div>
      ) : transactions.length === 0 ? (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--border)', textAlign: 'center', padding: '16px 0' }}>
          Henüz işlem yok
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {transactions.map((tx) => {
            const isIncoming = tx.to_player === playerId;
            const sign = isIncoming ? '+' : '-';
            const color = isIncoming ? 'var(--positive)' : 'var(--negative)';
            const label = TYPE_LABELS[tx.type] ?? tx.type;
            const counterpart = isIncoming ? tx.from_username : tx.to_username;

            return (
              <div key={tx.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--title)' }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text)', marginTop: 2 }}>
                    {counterpart ? `@${counterpart}` : 'Sistem'} · {formatDate(tx.created_at)}
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-num)',
                  fontSize: 14,
                  fontWeight: 500,
                  color,
                  letterSpacing: '-0.01em',
                }}>
                  {sign}{formatAmount(tx.amount)} ◈
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
