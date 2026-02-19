// src/lib/api.ts

import {Category, CreateResourceRequest} from "@/lib/types";

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
        // Opcjonalnie: automatyczne wylogowanie
        // if (typeof window !== 'undefined') localStorage.removeItem('token');
        // window.location.href = '/login';
    }

    return response;
}

export const api = {
    // --- Auth ---
    register: (body: any) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: any) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

    // --- Resources ---
    getInboxMix: () => fetchWithAuth('/inbox/mix'),
    getVaultMix: () => fetchWithAuth('/vault/mix'),

    archiveInboxResource: (id: string) =>
        fetchWithAuth(`/resources/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 5 }) }), // 5 = Trash/Archived w zależności od enuma

    retryResource: (id: string) =>
        fetchWithAuth(`/resources/${id}/retry`, { method: 'POST' }),

    deleteResource: (id: string) =>
        fetchWithAuth(`/resources/${id}`, { method: 'DELETE' }),

    createResource: async (data: CreateResourceRequest) => {
        const res = await fetchWithAuth('/resources', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create resource");
        return res.json();
    },

    // --- Categories ---
    getCategories: async (): Promise<Category[]> => {
        const res = await fetchWithAuth('/categories');
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
    },

    createCategory: async (name: string): Promise<Category> => {
        const res = await fetchWithAuth('/categories', {
            method: 'POST',
            body: JSON.stringify({ name })
        });
        if (!res.ok) throw new Error("Failed to create category");
        return res.json();
    },

    deleteCategory: (id: string) =>
        fetchWithAuth(`/categories/${id}`, { method: 'DELETE' }),

    // --- User Preferences ---
    getPreferences: () => fetchWithAuth('/preferences'),
    updatePreferences: (body: any) =>
        fetchWithAuth('/preferences', { method: 'PUT', body: JSON.stringify(body) }),
};