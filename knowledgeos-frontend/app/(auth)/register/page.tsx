'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Key, Terminal, ArrowRight, ShieldCheck, Cpu, Activity, Globe } from 'lucide-react';

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
            setError('SECURITY_ALERT: Passwords do not match.');
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
                    throw new Error(errorData.map((e: any) => e.description).join(', '));
                }
                throw new Error(errorData.message || 'REGISTRATION_FAILED');
            }

            // Sukces
            router.push('/login?registered=true');

        } catch (err: any) {
            setError(err.message || 'SYSTEM_CRITICAL_ERROR');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-tech-bg text-gray-300 flex items-center justify-center p-4 bg-grid relative overflow-hidden">

            {/* Tło i dekoracje systemowe */}
            <div className="fixed top-6 left-6 flex flex-col gap-1 z-10 hidden sm:flex">
                <div className="text-[10px] font-bold tracking-[0.2em] text-tech-primary/60">ENCRYPTION: ACTIVE</div>
                <div className="text-[10px] font-bold tracking-[0.2em] text-tech-primary/40">SECURE_TUNNEL: ESTABLISHED</div>
            </div>

            <div className="fixed bottom-6 right-6 flex flex-col items-end gap-1 z-10 hidden sm:flex">
                <div className="text-[10px] font-bold tracking-[0.2em] text-tech-primary/60">SYS.V2.0.4</div>
                <div className="text-[10px] font-bold tracking-[0.2em] text-tech-primary/40">LOC: EDGE_NODE_01</div>
            </div>

            {/* Wielki napis w tle */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] flex items-center justify-center overflow-hidden">
                <span className="text-[20vw] font-bold text-tech-primary select-none whitespace-nowrap">KNOWLEDGE_OS</span>
            </div>
            <div className="relative w-full max-w-md bg-tech-bg border border-tech-primary p-8 md:p-12 z-20 shadow-[0_0_50px_-12px_rgba(163,255,191,0.1)]">
                {/* Corners */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-tech-primary"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-tech-primary"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-tech-primary"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-tech-primary"></div>
                <div className="mb-10 text-center justify-center">
                    <h1 className="text-3xl font-bold tracking-widest uppercase text-tech-primary">
                        KNOWLEDGE_OS
                        <span className="inline-block w-2.5 h-5 bg-tech-primary ml-1 align-middle animate-blink"></span>
                    </h1>
                    <p className="text-[10px] text-tech-muted mt-2 uppercase tracking-widest italic">
                        Second brain link hub</p>
                </div>
                <div className="text-left mb-8">
                    <header
                        className="text-l font-bold text-white uppercase tracking-[0.2em] mb-2 mt-2">Initialize_Account
                    </header>
                    <div className="h-0.5 w-30 bg-tech-primary"></div>
                </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-900/20 border border-red-500/50 text-red-400 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            <span>&gt; {error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-tech-primary uppercase tracking-widest">Identity (Username)</label>
                            <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tech-muted group-focus-within:text-tech-primary transition-colors">
                    <User className="w-4 h-4" />
                </span>
                                <input
                                    name="displayName"
                                    type="text"
                                    required
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    className="w-full bg-tech-surface border border-tech-border py-3 pl-10 pr-4 text-sm text-white font-mono  focus:border-tech-primary focus:outline-none transition-colors placeholder:text-gray-700"
                                    placeholder="ENTER_ID_STRING..."
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-tech-primary uppercase tracking-widest">Email_Address</label>
                            <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tech-muted group-focus-within:text-tech-primary transition-colors">
                    <Mail className="w-4 h-4" />
                </span>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-tech-surface border border-tech-border py-3 pl-10 pr-4 text-sm text-white font-mono focus:border-tech-primary focus:outline-none transition-colors placeholder:text-gray-700"
                                    placeholder="USER@NODE.SYS"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Password */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-tech-primary uppercase tracking-widest">Access_Key</label>
                                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tech-muted group-focus-within:text-tech-primary transition-colors">
                    <Key className="w-4 h-4" />
                  </span>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-tech-surface border border-tech-border py-3 pl-10 pr-4 text-sm text-white font-mono focus:border-tech-primary focus:outline-none transition-colors placeholder:text-gray-700"
                                        placeholder="********"
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-tech-primary uppercase tracking-widest">Re-Enter Key</label>
                                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tech-muted group-focus-within:text-tech-primary transition-colors">
                    <Key className="w-4 h-4" />
                  </span>
                                    <input
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full bg-tech-surface border border-tech-border py-3 pl-10 pr-4 text-sm text-white font-mono focus:border-tech-primary focus:outline-none transition-colors placeholder:text-gray-700"
                                        placeholder="********"
                                    />
                                </div>
                            </div>
                        </div>


                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full bg-tech-primary py-4 text-black font-bold uppercase tracking-[0.3em] text-sm hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span>INITIALIZING...</span>
                                ) : (
                                    <>
                                        <span>Initialize_Account</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}

                                {/* Button decorative corner */}
                                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-tech-bg border-r border-b border-tech-primary"></div>
                            </button>

                            <p className="text-[9px] text-center text-tech-muted mt-6 uppercase tracking-widest">
                                Already registered? <Link href="/login" className="text-tech-primary hover:underline">Access_Login_Terminal</Link>
                            </p>
                        </div>
                    </form>
                </div>
        </main>
    );
}