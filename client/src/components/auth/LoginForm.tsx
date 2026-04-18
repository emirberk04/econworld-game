import { useState, FormEvent } from 'react';
import { TerminalInput } from '../ui/TerminalInput';
import { TerminalButton } from '../ui/TerminalButton';

interface Props {
  onSubmit: (email: string, password: string) => void;
  loading: boolean;
  error: string | null;
}

export function LoginForm({ onSubmit, loading, error }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(email, password);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <TerminalInput
        label="E-posta"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="oyuncu@example.com"
        autoComplete="email"
        required
      />
      <TerminalInput
        label="Şifre"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        autoComplete="current-password"
        required
      />
      {error && (
        <div style={{
          background: 'rgba(255,68,68,0.08)',
          border: '1px solid rgba(255,68,68,0.3)',
          padding: '10px 12px',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--negative)',
        }}>
          {error}
        </div>
      )}
      <TerminalButton type="submit" loading={loading} fullWidth>
        Giriş Yap
      </TerminalButton>
    </form>
  );
}
