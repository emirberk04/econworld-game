import { SkeletonBlock } from '../ui/SkeletonBlock';

interface Player {
  username: string;
  reputation: number;
  profession: string | null;
  created_at: string;
}

interface Props {
  player: Player | null;
  loading: boolean;
}

export function PlayerInfoCard({ player, loading }: Props) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      padding: '20px',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--text)',
        marginBottom: 16,
      }}>
        Oyuncu Profili
      </div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SkeletonBlock height="1rem" width="50%" />
          <SkeletonBlock height="1rem" width="35%" />
          <SkeletonBlock height="1rem" width="45%" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Row label="Kullanıcı" value={`@${player?.username}`} highlight />
          <Row label="İtibar" value={String(player?.reputation ?? 50)} color="var(--positive)" />
          <Row label="Meslek" value={player?.profession ?? '— (seçilmedi)'} />
          <Row
            label="Üye Tarihi"
            value={player ? new Date(player.created_at).toLocaleDateString('tr-TR') : '—'}
          />
        </div>
      )}
    </div>
  );
}

function Row({ label, value, highlight, color }: {
  label: string;
  value: string;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text)',
        letterSpacing: '0.06em',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: highlight ? 'var(--font-mono)' : 'var(--font-body)',
        fontSize: 13,
        color: color || (highlight ? 'var(--title)' : 'var(--text)'),
        fontWeight: highlight ? 700 : 400,
      }}>
        {value}
      </span>
    </div>
  );
}
