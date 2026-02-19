'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { VaultResource, Category } from '@/lib/types';
import { VaultCard } from '@/components/VaultCard';
import { VaultDetailModal } from '@/components/VaultDetailModal';
import { Search, Loader2, Database, ChevronLeft, ChevronRight, AlertCircle, X } from 'lucide-react';
import { getCategoryColor } from '@/lib/categoryColor';

export default function VaultPage() {
    const [items, setItems] = useState<VaultResource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 12;

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

    const [selectedResource, setSelectedResource] = useState<VaultResource | null>(null);

    useEffect(() => {
        api.getCategories().then(setCategories).catch(console.error);
    }, []);

    useEffect(() => {
        loadData();
    }, [page, searchTerm, selectedCategoryId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await api.getVault(page, pageSize, searchTerm, selectedCategoryId);
            setItems(data.items || []);
            setTotalItems(data.totalItems || 0);
            const calc = Math.ceil((data.totalItems || 0) / pageSize);
            setTotalPages(calc > 0 ? calc : 1);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchTerm(searchInput);
        setPage(1);
    };

    const handleCategorySelect = (id: string | undefined) => {
        setSelectedCategoryId(id);
        setPage(1);
    };

    const handleDelete = async (id: string) => {
        setItems(items.filter(i => i.id !== id));
        setTotalItems(t => t - 1);
        await loadData();
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-tech-border pb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-tech-primary/10 border border-tech-primary flex items-center justify-center">
                        <Database className="w-6 h-6 text-tech-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white uppercase tracking-widest font-mono">
                            Vault Database
                        </h1>
                        <p className="text-xs text-tech-primary font-mono uppercase tracking-widest">
                            {totalItems} Nodes stored
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 group">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="SEARCH_VAULT_NODES..."
                        className="w-full bg-black/50 border border-tech-border p-3 pl-10 text-sm text-white focus:border-tech-primary focus:outline-none transition-colors font-mono uppercase placeholder:text-gray-600"
                    />
                    <Search className="absolute left-3 top-3 w-4 h-4 text-tech-text-muted group-focus-within:text-tech-primary transition-colors" />
                    <button type="submit" className="hidden">Submit</button>
                </form>
            </div>

            {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleCategorySelect(undefined)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase border transition-all ${
                            !selectedCategoryId
                                ? 'border-tech-primary bg-tech-primary-dim text-tech-primary'
                                : 'border-tech-border text-gray-500 hover:border-tech-border hover:text-gray-300'
                        }`}
                    >
                        All
                    </button>
                    {categories.map(cat => {
                        const c = getCategoryColor(cat.name);
                        const isActive = selectedCategoryId === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleCategorySelect(cat.id)}
                                className={`px-3 py-1 text-[10px] font-bold uppercase border transition-all flex items-center gap-1 ${
                                    isActive
                                        ? `${c.border} ${c.bg} ${c.text}`
                                        : 'border-tech-border text-gray-500 hover:text-gray-300 hover:border-tech-border'
                                }`}
                            >
                                {cat.name}
                                {isActive && <X className="w-2.5 h-2.5" />}
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="min-h-[400px]">
                {isLoading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-4 border border-dashed border-tech-border">
                        <Loader2 className="w-8 h-8 text-tech-primary animate-spin" />
                        <span className="text-xs text-tech-text-muted uppercase font-bold tracking-widest">Fetching Data...</span>
                    </div>
                ) : items.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-4 border border-dashed border-tech-border bg-tech-surface/30">
                        <AlertCircle className="w-8 h-8 text-gray-500" />
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">
                            {searchTerm || selectedCategoryId ? 'NO_RESULTS_FOUND' : 'VAULT_IS_EMPTY'}
                        </span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {items.map(item => (
                            <VaultCard
                                key={item.id}
                                resource={item}
                                onClick={() => setSelectedResource(item)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-tech-border pt-6">
                    <div className="text-xs text-tech-text-muted font-mono uppercase">
                        Page <span className="text-tech-primary">{page}</span> of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 border border-tech-border text-tech-text-muted hover:text-white hover:border-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 border border-tech-border text-tech-text-muted hover:text-white hover:border-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {selectedResource && (
                <VaultDetailModal
                    resource={selectedResource}
                    onClose={() => setSelectedResource(null)}
                    onDelete={() => handleDelete(selectedResource.id)}
                />
            )}
        </div>
    );
}

