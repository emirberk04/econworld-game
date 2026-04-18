export interface Player {
  id: string;
  username: string;
  email: string;
  balance: string;
  reputation: number;
  profession: string | null;
  premium: boolean;
  created_at: string;
  daily_bonus_claimed_at: string | null;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface AuthResponse {
  player: Player;
  accessToken: string;
  refreshToken: string;
}
