'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { VaultResource, Category } from '@/lib/types';
import { VaultCard } from '@/components/VaultCard';
import { VaultDetailModal } from '@/components/VaultDetailModal';
import { Search, Loader2, Database, ChevronLeft, ChevronRight, AlertCircle, X } from 'lucide-react';
import { getCategoryColor } from '@/lib/categoryColor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useVaultAutoRefresh } from '@/lib/useVaultAutoRefresh';
import { isVaultProcessing } from '@/lib/vaultProcessing';

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
    const [uncategorizedOnly, setUncategorizedOnly] = useState(false);

    const [selectedResource, setSelectedResource] = useState<VaultResource | null>(null);

    useEffect(() => {
        api.getCategories().then(setCategories).catch(console.error);
    }, []);

    useEffect(() => {
        void loadData();
    }, [page, searchTerm, selectedCategoryId, uncategorizedOnly]);

    const loadData = async (options?: { silent?: boolean }) => {
        if (!options?.silent) setIsLoading(true);
        try {
            const data = await api.getVault(page, pageSize, searchTerm, selectedCategoryId, uncategorizedOnly);
            setItems(data.items || []);
            setTotalItems(data.totalItems || 0);
            const calc = Math.ceil((data.totalItems || 0) / pageSize);
            setTotalPages(calc > 0 ? calc : 1);
        } catch (error) {
            console.error(error);
        } finally {
            if (!options?.silent) setIsLoading(false);
        }
    };

    useVaultAutoRefresh(items, loadData);

    const pendingCount = items.filter((i) => isVaultProcessing(i)).length;

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchTerm(searchInput);
        setPage(1);
    };

    const handleCategorySelect = (id: string | undefined) => {
        setSelectedCategoryId(id);
        setUncategorizedOnly(false);
        setPage(1);
    };

    const handleUncategorizedSelect = () => {
        setSelectedCategoryId(undefined);
        setUncategorizedOnly(true);
        setPage(1);
    };

    const handleShowAll = () => {
        setSelectedCategoryId(undefined);
        setUncategorizedOnly(false);
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
                    <div className="w-12 h-12 rounded-lg bg-tech-primary-dim border border-tech-primary/30 flex items-center justify-center">
                        <Database className="w-6 h-6 text-tech-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-tech-foreground">Vault</h1>
                        <p className="text-sm text-tech-foreground-muted">
                            {totalItems} zapisanych zasobów
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 group">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Szukaj po tytule lub tagach..."
                        className="w-full rounded-md border border-tech-border bg-tech-surface p-3 pl-10 text-sm text-tech-foreground focus:border-tech-primary focus:outline-none transition-colors placeholder:text-tech-foreground-muted"
                    />
                    <Search className="absolute left-3 top-3 w-4 h-4 text-tech-foreground-muted group-focus-within:text-tech-primary transition-colors" />
                    <button type="submit" className="hidden">Submit</button>
                </form>
            </div>

            {pendingCount > 0 && !isLoading && (
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-tech-primary/35 bg-tech-primary-dim/50 px-4 py-3 text-sm text-tech-foreground-muted">
                    <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-tech-primary" />
                    <span>
                        {pendingCount === 1
                            ? '1 zasób w analizie AI — odświeżam listę automatycznie…'
                            : `${pendingCount} zasobów w analizie AI — odświeżam listę automatycznie…`}
                    </span>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={handleShowAll}
                        className={cn(
                            'rounded-md border px-3 py-1.5 text-xs font-medium transition-all',
                            !selectedCategoryId && !uncategorizedOnly
                                ? 'border-tech-primary/40 bg-tech-primary-dim text-tech-primary'
                                : 'border-tech-border text-tech-foreground-muted hover:bg-tech-surface-hover hover:text-tech-foreground'
                        )}
                    >
                        Wszystkie
                    </button>
                    <button
                        type="button"
                        onClick={handleUncategorizedSelect}
                        className={cn(
                            'rounded-md border px-3 py-1.5 text-xs font-medium transition-all',
                            uncategorizedOnly
                                ? 'border-tech-primary/40 bg-tech-primary-dim text-tech-primary'
                                : 'border-tech-border text-tech-foreground-muted hover:bg-tech-surface-hover hover:text-tech-foreground'
                        )}
                    >
                        Uncategorized
                    </button>
                    {categories.map(cat => {
                        const c = getCategoryColor(cat.id);
                        const isActive = selectedCategoryId === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleCategorySelect(cat.id)}
                                className={cn(
                                    'rounded-md border px-3 py-1.5 text-xs font-medium transition-all inline-flex items-center gap-1',
                                    isActive
                                        ? `${c.border} ${c.bg} ${c.text}`
                                        : 'border-tech-border text-tech-foreground-muted hover:bg-tech-surface-hover hover:text-tech-foreground'
                                )}
                            >
                                {cat.name}
                                {isActive && <X className="w-3 h-3" />}
                            </button>
                        );
                    })}
                </div>

            <div className="min-h-[400px]">
                {isLoading ? (
                    <Card className="h-64 flex flex-col items-center justify-center gap-4 border-dashed">
                        <Loader2 className="w-8 h-8 text-tech-primary animate-spin" />
                        <span className="text-sm text-tech-foreground-muted">Pobieram zasoby...</span>
                    </Card>
                ) : items.length === 0 ? (
                    <Card className="h-64 flex flex-col items-center justify-center gap-4 border-dashed">
                        <AlertCircle className="w-8 h-8 text-tech-foreground-muted" />
                        <span className="text-sm text-tech-foreground-muted">
                            {searchTerm || selectedCategoryId || uncategorizedOnly ? 'Brak wyników' : 'Vault jest pusty'}
                        </span>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                    <div className="text-sm text-tech-foreground-muted">
                        Strona <span className="text-tech-foreground font-medium">{page}</span> z {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            variant="outline"
                            size="icon"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            variant="outline"
                            size="icon"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {selectedResource && (
                <VaultDetailModal
                    resource={selectedResource}
                    onClose={() => setSelectedResource(null)}
                    onDelete={() => handleDelete(selectedResource.id)}
                    onUpdated={(patch) => {
                        setSelectedResource((prev) => (prev ? ({ ...prev, ...patch }) : prev));
                        setItems((prev) => prev.map((it) => (it.id === selectedResource.id ? ({ ...it, ...patch }) : it)));
                    }}
                />
            )}
        </div>
    );
}
