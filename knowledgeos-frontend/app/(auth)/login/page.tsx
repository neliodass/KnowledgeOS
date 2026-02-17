'use client';

import {useState, useEffect} from 'react';
import {api} from '@/lib/api';
import {useRouter, useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {Fingerprint, Key, LockOpen, RefreshCw, UserPlus} from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setSuccessMessage('ACCESS_GRANTED: USER_CREATED');
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
                throw new Error('ACCESS_DENIED: INVALID_CREDENTIALS');
            }

            const data = await res.json();
            localStorage.setItem('token', data.token);
            router.push('/dashboard');

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError("SYSTEM_ERROR")
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main
            className="min-h-screen bg-tech-bg text-gray-300 flex items-center justify-center p-4 bg-grid relative overflow-hidden">

            {/* Tło i dekoracje systemowe */}
            <div className="fixed top-6 left-6 flex flex-col gap-1 z-10 hidden sm:flex">
                <div className="text-[10px] font-bold tracking-[0.2em] text-tech-primary/60">ENCRYPTION: ACTIVE</div>
                <div className="text-[10px] font-bold tracking-[0.2em] text-tech-primary/40">SECURE_TUNNEL:
                    ESTABLISHED
                </div>
            </div>

            <div className="fixed bottom-6 right-6 flex flex-col items-end gap-1 z-10 hidden sm:flex">
                <div className="text-[10px] font-bold tracking-[0.2em] text-tech-primary/60">SYS.V2.0.4</div>
                <div className="text-[10px] font-bold tracking-[0.2em] text-tech-primary/40">LOC: EDGE_NODE_01</div>
            </div>

            {/* Wielki napis w tle */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.02] flex items-center justify-center overflow-hidden">
                <span
                    className="text-[20vw] font-bold text-tech-primary select-none whitespace-nowrap">KNOWLEDGE_OS</span>
            </div>

            {/* Main card */}
            <div
                className="relative w-full max-w-md bg-tech-bg border border-tech-primary p-8 md:p-12 z-20 shadow-[0_0_50px_-12px_rgba(163,255,191,0.1)]">

                {/* Corners */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-tech-primary"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-tech-primary"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-tech-primary"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-tech-primary"></div>

                {/* Header */}
                <div className="mb-10 text-center justify-center">
                    <h1 className="text-3xl font-bold tracking-widest uppercase text-tech-primary">
                        KNOWLEDGE_OS
                        <span className="inline-block w-2.5 h-5 bg-tech-primary ml-1 align-middle animate-blink"></span>
                    </h1>
                    <p className="text-[10px] text-tech-muted mt-2 uppercase tracking-widest italic">
                      Second brain link hub</p>
                </div>
                <div className="text-left">
                    <header
                        className="text-l font-bold text-white uppercase tracking-[0.2em] mb-2 mt-2">Authenticate_Identity
                    </header>
                    <div className="h-0.5 w-30 mb-8 bg-tech-primary"></div>
                </div>


                {/* errors */}
                {error && (
                    <div
                        className="mb-6 p-3 bg-red-900/20 border border-red-500/50 text-red-400 text-xs font-mono text-center uppercase tracking-wider">
                        &gt; {error}
                    </div>
                )}

                {successMessage && (
                    <div
                        className="mb-6 p-3 bg-tech-primary/10 border border-tech-primary/50 text-tech-primary text-xs font-mono text-center uppercase tracking-wider">
                        &gt; {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">

                    <div className="space-y-2">
                        <label
                            className="block text-[10px] font-bold text-tech-primary/80 uppercase tracking-widest ml-1">
                            &gt; Email_Address
                        </label>
                        <div className="relative group">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black border border-tech-border focus:border-tech-primary focus:ring-0 focus:outline-none text-tech-primary placeholder:text-tech-primary/20 text-sm px-4 py-3 pl-10 transition-colors"
                                placeholder="Enter credentials..."
                            />
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Fingerprint className="w-4 h-4 text-tech-primary/40"/>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label
                            className="block text-[10px] font-bold text-tech-primary/80 uppercase tracking-widest ml-1">
                            &gt; Access_Key
                        </label>
                        <div className="relative group">
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black border border-tech-border focus:border-tech-primary focus:ring-0 focus:outline-none text-tech-primary placeholder:text-tech-primary/20 text-sm px-4 py-3 pl-10 transition-colors"
                                placeholder="••••••••"
                            />
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Key className="w-4 h-4 text-tech-primary/40"/>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-tech-primary text-black font-bold uppercase tracking-[0.2em] py-4 text-xs transition-all hover:shadow-[0_0_15px_rgba(163,255,191,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">PROCESSING...</span>
                        ) : (
                            <>
                                <LockOpen className="w-4 h-4 font-bold group-hover:translate-x-1 transition-transform"/>
                                AUTHENTICATE
                            </>
                        )}
                    </button>
                </form>

                <div
                    className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-tech-border pt-6">
                    <button type="button"
                            className="text-[10px] text-tech-muted hover:text-tech-primary transition-colors uppercase tracking-widest flex items-center gap-1 group">
                        <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500"/>
                        Reset Key
                    </button>

                    <Link href="/register"
                          className="text-[10px] text-tech-muted hover:text-tech-primary transition-colors uppercase tracking-widest flex items-center gap-1 group">
                        <UserPlus className="w-3 h-3 group-hover:scale-110 transition-transform"/>
                        Initialize User
                    </Link>
                </div>


            </div>
        </main>
    );
}