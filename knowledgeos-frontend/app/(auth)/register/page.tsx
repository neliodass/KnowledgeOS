'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        displayName: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Hasła nie są identyczne.');
            setIsLoading(false);
            return;
        }

        try {
            const res = await api.register({
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                displayName: formData.displayName
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));

                if (Array.isArray(errorData)) {
                    throw new Error(errorData.map((e: any) => e.description).join(', '));
                }

                throw new Error(errorData.message || 'Rejestracja nieudana. Sprawdź dane.');
            }

            router.push('/login?registered=true');

        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md border border-gray-100">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Dołącz do KnowledgeOS</h2>
                    <p className="text-sm text-gray-500 mt-2">Zbuduj swoją drugą pamięć</p>
                </div>

                {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nazwa wyświetlana</label>
                        <input
                            name="displayName"
                            type="text"
                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            placeholder="Np. Jan Kowalski"
                            value={formData.displayName}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hasło</label>
                        <input
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Potwierdź hasło</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2 px-4 text-white bg-blue-600 rounded hover:bg-blue-700 font-medium disabled:bg-blue-300 transition-colors"
                    >
                        {isLoading ? 'Rejestrowanie...' : 'Zarejestruj się'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600">
                    Masz już konto?{' '}
                    <Link href="/login" className="text-blue-600 hover:underline font-medium">
                        Zaloguj się
                    </Link>
                </p>
            </div>
        </div>
    );
}