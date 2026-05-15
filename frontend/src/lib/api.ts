const API_BASE_URL = 'http://localhost:3001/api';

export const apiFetch = async (endpoint: string, options: RequestInit = {}, role: 'SELLER' | 'ADMIN', userId: string) => {
  const headers = new Headers(options.headers || {});
  headers.set('x-user-id', userId);
  headers.set('x-user-role', role);
  
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
};
