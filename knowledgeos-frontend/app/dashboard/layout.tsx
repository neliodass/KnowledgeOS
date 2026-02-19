'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Inbox,
    Database,
    Settings,
    Menu,
    X,
    LogOut, Plus, ChevronDown
} from 'lucide-react';
import { api } from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [displayName, setDisplayName] = useState('USER');
    const menuRef = useRef<HTMLDivElement>(null);

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
        window.location.href = '/login';
    };

    return (
        <div className="flex h-screen bg-tech-bg text-gray-300 font-mono overflow-hidden selection:bg-tech-primary selection:text-black">
            <div className="scanline"></div>

            <aside className="hidden md:flex w-64 flex-col border-r border-tech-border bg-tech-bg z-20 relative">
                <SidebarContent />
            </aside>

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-tech-bg border-r border-tech-border transform transition-transform duration-300 ease-in-out md:hidden
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex justify-end p-2 md:hidden">
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-tech-primary hover:bg-tech-surface">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <SidebarContent onClose={() => setIsMobileMenuOpen(false)} />
            </aside>

            <div className="flex-1 flex flex-col min-w-0 relative bg-grid">

                <header className="flex-none px-6 py-4 flex justify-between items-center border-b border-tech-border bg-tech-bg/95 backdrop-blur z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 text-tech-primary border border-tech-border hover:bg-tech-surface transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center">
                                <span className="text-tech-primary mr-2 hidden sm:inline">&gt;&gt;&gt;</span>
                                Dashboard
                            </h2>
                            <p className="text-[10px] text-tech-text-muted uppercase tracking-widest mt-1 hidden sm:block">
                                System Status: Optimal • <span className="text-tech-primary">Online</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setUserMenuOpen(v => !v)}
                                className="flex items-center gap-2 px-3 py-1.5 border border-tech-border bg-black hover:border-tech-primary transition-all"
                            >
                                <span className="text-xs font-bold text-gray-300 uppercase">{displayName}</span>
                                <ChevronDown className={`w-3 h-3 text-tech-primary transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-44 border border-tech-border bg-tech-bg z-50 flex flex-col">
                                    <Link
                                        href="/dashboard/settings"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex items-center gap-2 px-4 py-3 text-[10px] uppercase font-bold text-gray-400 hover:text-tech-primary hover:bg-tech-surface transition-colors"
                                    >
                                        <Settings className="w-3 h-3" />
                                        Settings
                                    </Link>
                                    <div className="h-[1px] bg-tech-border" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-4 py-3 text-[10px] uppercase font-bold text-red-400 hover:text-red-300 hover:bg-red-900/10 transition-colors"
                                    >
                                        <LogOut className="w-3 h-3" />
                                        Disconnect
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
}

function SidebarContent({ onClose }: SidebarContentProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;
    const handleLinkClick = () => {
        if (onClose) onClose();
    };
    const linkClasses = (path: string) => `
        flex items-center gap-4 px-4 py-3 border text-xs font-bold uppercase tracking-wider transition-all group
        ${isActive(path)
            ? 'border-tech-primary bg-tech-primary-dim text-tech-primary'
            : 'border-transparent hover:border-tech-border text-gray-500 hover:text-white hover:bg-tech-surface-hover'
        }
    `;

    return (
        <>
            <div className="p-6 border-b border-tech-border">
                <div className="flex items-center gap-3">
                    <div>
                        <Link href="/dashboard">
                            <h1 className="text-sm font-bold tracking-tighter text-tech-primary uppercase">KnowledgeOS</h1>
                            <div className="text-[10px] text-tech-text-muted leading-none mt-0.5">SYS.VER 0.8</div>
                        </Link>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-3 py-6 flex flex-col gap-1">
                <Link href="/dashboard" className={linkClasses('/dashboard')} onClick={handleLinkClick}>
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                </Link>
                <Link href="/dashboard/add" className={linkClasses('/dashboard/add')} onClick={handleLinkClick}>
                    <Plus className="w-5 h-5" />
                    Add new link
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
                    Settings
                </Link>
            </nav>

            <div className="p-4 border-t border-tech-border">
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }}
                    className="w-full flex items-center gap-2 justify-center py-2 text-[10px] text-red-400 hover:text-red-300 border border-transparent hover:border-red-900/30 hover:bg-red-900/10 transition-all uppercase tracking-wider"
                >
                    <LogOut className="w-3 h-3" />
                    Disconnect
                </button>
            </div>
        </>
    );
}

