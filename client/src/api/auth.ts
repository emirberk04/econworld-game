import { apiClient } from './client';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterData) =>
    apiClient.post('/auth/register', data).then((r) => r.data),
  login: (data: LoginData) =>
    apiClient.post('/auth/login', data).then((r) => r.data),
  me: () =>
    apiClient.get('/auth/me').then((r) => r.data),
};
