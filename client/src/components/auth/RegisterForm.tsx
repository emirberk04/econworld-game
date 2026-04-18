import { useState, FormEvent } from 'react';
import { TerminalInput } from '../ui/TerminalInput';
import { TerminalButton } from '../ui/TerminalButton';

interface Props {
  onSubmit: (username: string, email: string, password: string) => void;
  loading: boolean;
  error: string | null;
}

export function RegisterForm({ onSubmit, loading, error }: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  function validate(): boolean {
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
      setLocalError('Kullanıcı adı 3-32 karakter, yalnızca harf/rakam/alt çizgi');
      return false;
    }
    if (password.length < 8) {
      setLocalError('Şifre en az 8 karakter olmalıdır');
      return false;
    }
    setLocalError(null);
    return true;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit(username, email, password);
  }

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <TerminalInput
        label="Kullanıcı Adı"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="oyuncu_adi"
        autoComplete="username"
        required
      />
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
        placeholder="En az 8 karakter"
        autoComplete="new-password"
        required
      />
      {displayError && (
        <div style={{
          background: 'rgba(255,68,68,0.08)',
          border: '1px solid rgba(255,68,68,0.3)',
          padding: '10px 12px',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--negative)',
        }}>
          {displayError}
        </div>
      )}
      <TerminalButton type="submit" loading={loading} fullWidth>
        Kayıt Ol
      </TerminalButton>
    </form>
  );
}
