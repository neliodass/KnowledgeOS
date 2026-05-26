'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Inbox,
    Database,
    Settings,
    Menu,
    X,
    LogOut,
    Plus,
    ChevronDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
    '/dashboard': { title: 'Dashboard', subtitle: 'Twoje centrum wiedzy' },
    '/dashboard/inbox': { title: 'Inbox', subtitle: 'Przegląd nowych zasobów' },
    '/dashboard/add': { title: 'Dodaj link', subtitle: 'Zapisz URL do analizy AI' },
    '/dashboard/vault': { title: 'Vault', subtitle: 'Twoja biblioteka wiedzy' },
    '/dashboard/settings': { title: 'Ustawienia', subtitle: 'Profil, konto i wygląd' },
};

function getPageMeta(pathname: string) {
    return PAGE_META[pathname] ?? PAGE_META['/dashboard'];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const pageMeta = getPageMeta(pathname);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [displayName, setDisplayName] = useState('User');
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        api.getMe().then(res => {
            if (res.ok) res.json().then(data => {
                const name = data.displayName ?? null;
                if (name) setDisplayName(name);
            });
        }).catch(() => {});
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
        router.push('/login');
    };

    return (
        <div className="flex h-screen bg-tech-bg text-tech-foreground overflow-hidden">
            <aside className="hidden md:flex w-64 flex-col border-r border-tech-border bg-tech-surface z-20 relative">
                <SidebarContent onLogout={handleLogout} />
            </aside>

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-tech-surface border-r border-tech-border transform transition-transform duration-300 ease-in-out md:hidden
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex justify-end p-2 md:hidden">
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 text-tech-primary hover:bg-tech-surface-hover rounded-md"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <SidebarContent onClose={() => setIsMobileMenuOpen(false)} onLogout={handleLogout} />
            </aside>

            <div className="flex-1 flex flex-col min-w-0 relative bg-tech-bg">
                <header className="flex-none px-6 py-4 flex justify-between items-center border-b border-tech-border bg-tech-surface/95 backdrop-blur z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 text-tech-primary border border-tech-border rounded-md hover:bg-tech-surface-hover transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold text-tech-foreground">
                                {pageMeta.title}
                            </h2>
                            <p className="text-xs text-tech-foreground-muted mt-1 hidden sm:block">
                                {pageMeta.subtitle}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeSwitcher />

                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setUserMenuOpen(v => !v)}
                                className="flex items-center gap-2 px-3 py-1.5 border border-tech-border bg-tech-surface hover:bg-tech-surface-hover rounded-md transition-all"
                            >
                                <span className="text-xs font-medium text-tech-foreground">{displayName}</span>
                                <ChevronDown className={`w-3 h-3 text-tech-foreground-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-44 border border-tech-border bg-tech-surface rounded-md z-50 flex flex-col shadow-lg">
                                    <Link
                                        href="/dashboard/settings"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex items-center gap-2 px-4 py-3 text-xs text-tech-foreground-muted hover:text-tech-primary hover:bg-tech-surface-hover transition-colors"
                                    >
                                        <Settings className="w-3 h-3" />
                                        Ustawienia
                                    </Link>
                                    <div className="h-[1px] bg-tech-border" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-4 py-3 text-xs text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <LogOut className="w-3 h-3" />
                                        Wyloguj
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

interface SidebarContentProps {
    onClose?: () => void;
    onLogout: () => void;
}

function SidebarContent({ onClose, onLogout }: SidebarContentProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;
    const handleLinkClick = () => {
        if (onClose) onClose();
    };
    const linkClasses = (path: string) => `
        flex items-center gap-4 px-4 py-3 rounded-md text-sm font-medium transition-all group
        ${isActive(path)
            ? 'bg-tech-primary-dim text-tech-primary'
            : 'text-tech-foreground-muted hover:text-tech-foreground hover:bg-tech-surface-hover'
        }
    `;

    return (
        <>
            <div className="p-6 border-b border-tech-border">
                <Link href="/dashboard" onClick={handleLinkClick}>
                    <h1 className="text-lg font-semibold tracking-tight text-tech-foreground">KnowledgeOS</h1>
                    <div className="text-xs text-tech-foreground-muted leading-none mt-1">Personal AI Vault</div>
                </Link>
            </div>

            <nav className="flex-1 px-3 py-6 flex flex-col gap-1">
                <Link href="/dashboard" className={linkClasses('/dashboard')} onClick={handleLinkClick}>
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                </Link>
                <Link href="/dashboard/add" className={linkClasses('/dashboard/add')} onClick={handleLinkClick}>
                    <Plus className="w-5 h-5" />
                    Dodaj link
                </Link>
                <Link href="/dashboard/inbox" className={linkClasses('/dashboard/inbox')} onClick={handleLinkClick}>
                    <Inbox className="w-5 h-5" />
                    Inbox
                </Link>
                <Link href="/dashboard/vault" className={linkClasses('/dashboard/vault')} onClick={handleLinkClick}>
                    <Database className="w-5 h-5" />
                    Vault
                </Link>
                <Link href="/dashboard/settings" className={linkClasses('/dashboard/settings')} onClick={handleLinkClick}>
                    <Settings className="w-5 h-5" />
                    Ustawienia
                </Link>
            </nav>

            <div className="p-4 border-t border-tech-border">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 justify-center py-2 text-sm text-red-500 hover:text-red-400 border border-transparent hover:border-red-500/20 hover:bg-red-500/10 rounded-md transition-all"
                >
                    <LogOut className="w-3 h-3" />
                    Wyloguj
                </button>
            </div>
        </>
    );
}
