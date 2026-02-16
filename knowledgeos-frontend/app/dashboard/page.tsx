'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { InboxResource } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [resources, setResources] = useState<InboxResource[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadInbox();
    }, []);

    const loadInbox = async () => {
        try {
            const res = await api.getInbox();

            if (res.status === 401) {
                router.push('/login');
                return;
            }

            const data = await res.json();
            setResources(data.items || []);
        } catch (err) {
            console.error('Błąd pobierania inboxa:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    const getScoreColor = (score?: number) => {
        if (score === undefined || score === null) return 'bg-gray-200 text-gray-600';
        if (score >= 75) return 'bg-green-100 text-green-800 border-green-200';
        if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-red-100 text-red-800 border-red-200';
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-xl font-semibold text-gray-400">Ładowanie Inboxa...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 text-gray-800">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
                        <p className="text-gray-500">Materiały oczekujące na Twoją decyzję</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 px-4 py-2 rounded transition"
                    >
                        Wyloguj
                    </button>
                </div>

                {resources.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow border border-dashed border-gray-300">
                        <h3 className="text-lg font-medium text-gray-900">Pusto w Inboxie</h3>
                        <p className="text-gray-500 mt-1">Dodaj nowe linki przez API, aby zobaczyć je tutaj.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {resources.map(r => (
                            <div key={r.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col h-full">

                                <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded border ${getScoreColor(r.aiScore)}`}>
                        {r.aiScore !== undefined ? `${r.aiScore}/100` : 'N/A'}
                    </span>
                                    <span className="text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                                </div>

                                <h3 className="font-semibold text-lg leading-snug text-gray-900 mb-2 line-clamp-2">
                                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                                        {r.correctedTitle || r.title}
                                    </a>
                                </h3>

                                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                                    {r.aiVerdict || "Czeka na analizę..."}
                                </p>

                                {/* Tagi */}
                                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-50">
                                    {r.tags && r.tags.length > 0 ? r.tags.map(t => (
                                        <span key={t} className="text-[10px] uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded">
                            {t}
                        </span>
                                    )) : <span className="text-xs text-gray-300 italic">Brak tagów</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}