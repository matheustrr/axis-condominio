import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('axis_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'RESIDENT';
  condominiumId: string;
};

export type DashboardData = {
  condominiumId: string;
  blocks: number;
  units: number;
  residents: number;
  openIncidents: number;
  pendingCharges: number;
  upcomingReservations: number;
};

export async function login(email: string, password: string) {
  const { data } = await api.post<{ user: AuthUser; token: string }>('/auth/login', { email, password });
  return data;
}

export async function bootstrap(input: {
  condominium: { name: string; address?: string; email?: string; phone?: string };
  admin: { name: string; email: string; password: string };
}) {
  const { data } = await api.post<{ user: AuthUser; token: string }>('/auth/bootstrap', input);
  return data;
}

export async function getMe() {
  const { data } = await api.get<AuthUser>('/auth/me');
  return data;
}

export async function getDashboard() {
  const { data } = await api.get<DashboardData>('/dashboard');
  return data;
}

export function saveSession(token: string) {
  localStorage.setItem('axis_token', token);
}

export function clearSession() {
  localStorage.removeItem('axis_token');
}
