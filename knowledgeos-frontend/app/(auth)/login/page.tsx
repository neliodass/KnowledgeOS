'use client';

import {useState, useEffect, Suspense} from 'react';
import {api} from '@/lib/api';
import {useRouter, useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {Fingerprint, KeyRound, LogIn, UserPlus} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    //move to chosen page or default dashboard
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setSuccessMessage('Konto zostało utworzone. Zaloguj się.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');
        setError('');
        setIsLoading(true);

        try {
            const res = await api.login({email, password});

            if (!res.ok) {
                throw new Error('Nieprawidłowy e-mail lub hasło.');
            }

            const data = await res.json();
            localStorage.setItem('token', data.token);
            document.cookie = `token=${data.token}; path=/; max-age=604800; secure; samesite=strict`;
            router.push(callbackUrl);

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError("Wystąpił błąd logowania.")
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl text-slate-900">Zaloguj się</CardTitle>
                    <CardDescription>
                        Kontynuuj pracę z Inboxem i Vault.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-md border border-red-200 bg-red-50 text-red-600 text-sm px-3 py-2">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm px-3 py-2">
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm text-slate-600">E-mail</label>
                            <div className="relative">
                                <Fingerprint className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm pl-10 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm text-slate-600">Hasło</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm pl-10 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full">
                            <LogIn className="w-4 h-4" />
                            {isLoading ? 'Logowanie...' : 'Zaloguj'}
                        </Button>
                    </form>

                    <div className="pt-2 text-sm text-slate-500">
                        Nie masz konta?{" "}
                        <Link href="/register" className="text-indigo-600 hover:text-indigo-500 font-medium inline-flex items-center gap-1">
                            Zarejestruj się
                            <UserPlus className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
