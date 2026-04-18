import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
  const { register, loading, error } = useAuth();

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
            {'> Yeni oyuncu kaydı'}
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
            Kayıt Ol
          </div>
          <RegisterForm
            onSubmit={(username, email, password) => register({ username, email, password })}
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
          Zaten hesabın var mı?{' '}
          <Link to="/login" style={{ color: 'var(--positive)', textDecoration: 'none' }}>
            Giriş yap
          </Link>
        </div>
      </div>
    </div>
  );
}
