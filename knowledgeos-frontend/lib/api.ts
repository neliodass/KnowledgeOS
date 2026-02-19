// src/lib/api.ts

import {Category, CreateResourceRequest} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

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
    register: (body: unknown) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: unknown) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

    // --- Resources ---
    getInboxMix: () => fetchWithAuth('/inbox/mix'),
    getVaultMix: () => fetchWithAuth('/vault/mix'),
    getVault: async (pageNumber: number = 1, pageSize: number = 12, searchTerm: string = '', categoryId?: string) => {
        const query = new URLSearchParams({
            PageNumber: pageNumber.toString(),
            PageSize: pageSize.toString(),
        });
        if (searchTerm) query.append('SearchTerm', searchTerm);
        if (categoryId) query.append('CategoryId', categoryId);

        const res = await fetchWithAuth(`/vault?${query.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch vault");
        return res.json();
    },
    getInbox: async (pageNumber: number = 1, pageSize: number = 12, searchTerm: string = '') => {
        const query = new URLSearchParams({
            PageNumber: pageNumber.toString(),
            PageSize: pageSize.toString(),
        });
        if (searchTerm) query.append('SearchTerm', searchTerm);

        const res = await fetchWithAuth(`/inbox?${query.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch inbox");
        return res.json();
    },

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
    getVaultResource: async (id: string) => {
        const res = await fetchWithAuth(`/vault/${id}`);
        if (!res.ok) throw new Error("Failed to fetch vault resource");
        return res.json();
    },

    updateVaultResourceCategory: async (id: string, categoryId: string | null) => {
        const res = await fetchWithAuth(`/vault/${id}/category`, {
            method: 'PATCH',
            body: JSON.stringify({ categoryId })
        });
        if (!res.ok) throw new Error("Failed to update resource category");
        return res;
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
    updatePreferences: (body: unknown) =>
        fetchWithAuth('/preferences', { method: 'PUT', body: JSON.stringify(body) }),

    // --- Profile ---
    getMe: () => fetchWithAuth('/auth/me'),
    updateProfile: (nickname: string) =>
        fetchWithAuth('/auth/me', { method: 'PUT', body: JSON.stringify({ nickname }) }),

    // --- Security ---
    changePassword: (oldPassword: string, newPassword: string) =>
        fetchWithAuth('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({ oldPassword, newPassword })
        }),
};