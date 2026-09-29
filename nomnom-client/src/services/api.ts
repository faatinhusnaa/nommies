// src/services/api.ts
export const BACKEND_URL = 'https://fifty-doorpost-giddily.ngrok-free.dev';

// src/services/api.ts
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const res = await fetch(cleanEndpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed (${res.status})`);
  }

  return res.json();
}