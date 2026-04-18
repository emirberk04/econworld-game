import { Link } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { login, loading, error } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      background: 'var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--positive)',
            letterSpacing: '0.15em',
            marginBottom: 8,
          }}>
            ECONWORLD
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--text)',
          }}>
            {'> Ekonomiye katıl'}
          </div>
        </div>

        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: 28,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text)',
            marginBottom: 20,
            borderBottom: '1px solid var(--border)',
            paddingBottom: 12,
          }}>
            Giriş
          </div>
          <LoginForm
            onSubmit={(email, password) => login({ email, password })}
            loading={loading}
            error={error}
          />
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: 16,
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--text)',
        }}>
          Hesabın yok mu?{' '}
          <Link to="/register" style={{ color: 'var(--positive)', textDecoration: 'none' }}>
            Kayıt ol
          </Link>
        </div>
      </div>
    </div>
  );
}
