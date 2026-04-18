import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import type { LoginData, RegisterData } from '../api/auth';

export function useAuth() {
  const { player, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function register(data: RegisterData) {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.register(data);
      setAuth(res.data.player, res.data.accessToken, res.data.refreshToken);
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  async function login(data: LoginData) {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login(data);
      setAuth(res.data.player, res.data.accessToken, res.data.refreshToken);
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearAuth();
    navigate('/login');
  }

  return { player, loading, error, register, login, logout };
}
