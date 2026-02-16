// src/lib/api.ts

const API_URL = 'http://localhost:5000/api';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // TODO - logout
        // localStorage.removeItem('token');
        // window.location.href = '/login';
    }

    return response;
}

export const api = {
    // Auth
    register: (body: any) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: any) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

    // Resources
    getInbox: () => fetchWithAuth('/inbox'),
    getVault: () => fetchWithAuth('/vault'),
    createResource: (url: string) =>
        fetchWithAuth('/resources', { method: 'POST', body: JSON.stringify({ url, addToVault: false }) }),

    // Preferences
    getPreferences: () => fetchWithAuth('/preferences'),
};