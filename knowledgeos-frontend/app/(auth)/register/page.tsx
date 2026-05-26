'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, KeyRound, ArrowRight, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

        if (formData.password !== formData.confirmPassword) {
            setError('Hasła nie są takie same.');
            return;
        }

        setIsLoading(true);

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
                    throw new Error(errorData.map((e: { description?: string }) => e.description ?? 'Błąd walidacji').join(', '));
                }
                throw new Error((errorData as { message?: string }).message || 'Rejestracja nie powiodła się.');
            }

            router.push('/login?registered=true');

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message || 'Wystąpił błąd systemu.');
            } else {
                setError('Wystąpił błąd systemu.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl text-slate-900">Utwórz konto</CardTitle>
                    <CardDescription>
                        Załóż konto, aby zapisywać zasoby i personalizować scoring.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-md border border-red-200 bg-red-50 text-red-600 text-sm px-3 py-2 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-sm text-slate-600">Nazwa użytkownika</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                <input
                                    name="displayName"
                                    type="text"
                                    required
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm pl-10 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                    placeholder="Twoja nazwa"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm text-slate-600">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm pl-10 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-sm text-slate-600">Hasło</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm pl-10 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm text-slate-600">Potwierdź hasło</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                    <input
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm pl-10 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full mt-2">
                            {isLoading ? 'Tworzenie konta...' : 'Utwórz konto'}
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </form>

                    <p className="text-sm text-slate-500">
                        Masz już konto?{" "}
                        <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Zaloguj się
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </main>
    );
}