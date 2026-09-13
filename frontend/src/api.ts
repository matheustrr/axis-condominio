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

export type Resident = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  unitId: string;
  unit: { id: string; number: string; floor: number | null; block: { id: string; name: string } };
  user?: { id: string; role: AuthUser['role'] } | null;
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

export async function getResidents(condominiumId: string) {
  const { data } = await api.get<Resident[]>(`/condominiums/${condominiumId}/residents`);
  return data;
}

export async function createResident(unitId: string, input: { name: string; email?: string; phone?: string; document?: string }) {
  const { data } = await api.post<Resident>(`/units/${unitId}/residents`, input);
  return data;
}

export async function updateResident(id: string, input: { name: string; email?: string; phone?: string; document?: string }) {
  const { data } = await api.patch<Resident>(`/residents/${id}`, input);
  return data;
}

export async function deleteResident(id: string) {
  await api.delete(`/residents/${id}`);
}

export function saveSession(token: string) {
  localStorage.setItem('axis_token', token);
}

export function clearSession() {
  localStorage.removeItem('axis_token');
}
