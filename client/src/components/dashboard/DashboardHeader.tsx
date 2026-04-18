interface Props {
  username: string;
  onLogout: () => void;
}

export function DashboardHeader({ username, onLogout }: Props) {
  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      height: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        fontSize: 14,
        color: 'var(--positive)',
        letterSpacing: '0.05em',
      }}>
        ECONWORLD
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)' }}>
          @{username}
        </span>
        <button
          onClick={onLogout}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            padding: '4px 10px',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          Çıkış
        </button>
      </div>
    </header>
  );
}
