import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Player {
  id: string;
  username: string;
  email: string;
  balance: string;
  reputation: number;
  profession: string | null;
  premium: boolean;
  created_at: string;
}

interface AuthState {
  player: Player | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (player: Player, accessToken: string, refreshToken: string) => void;
  setPlayer: (player: Player) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      player: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (player, accessToken, refreshToken) =>
        set({ player, accessToken, refreshToken }),
      setPlayer: (player) => set({ player }),
      clearAuth: () => set({ player: null, accessToken: null, refreshToken: null }),
    }),
    { name: 'econworld-auth' }
  )
);
