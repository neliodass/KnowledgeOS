"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { InboxResource } from "@/lib/types";
import { InboxCard } from "@/components/InboxCard";
import { InboxDetailModal } from "@/components/InboxDetailModal";
import { Search, Loader2, Inbox, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useInboxAutoRefresh } from "@/lib/useInboxAutoRefresh";
import { hasInboxAxes } from "@/lib/inboxTiers";

export default function InboxPage() {
    const [items, setItems] = useState<InboxResource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedResource, setSelectedResource] = useState<InboxResource | null>(null);

    const loadInboxData = useCallback(async (options?: { silent?: boolean }) => {
        if (!options?.silent) setIsLoading(true);
        try {
            const data = await api.getInbox(page, pageSize, searchTerm);
            setItems(data.items || []);
            setTotalItems(data.totalItems || 0);

            const calcTotalPages = Math.ceil((data.totalItems || 0) / pageSize);
            setTotalPages(calcTotalPages > 0 ? calcTotalPages : 1);
        } catch (error) {
            console.error("Failed to fetch inbox items", error);
        } finally {
            if (!options?.silent) setIsLoading(false);
        }
    }, [page, pageSize, searchTerm]);

    useEffect(() => {
        void loadInboxData();
    }, [loadInboxData]);

    useInboxAutoRefresh(items, loadInboxData);

    const pendingCount = items.filter(item => !hasInboxAxes(item)).length;

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchTerm(searchInput);
        setPage(1);
    };


    const handleArchive = async (id: string) => {
        try {
            const res = await api.archiveInboxResource(id);
            if (res.ok) {
                setItems(items.filter((item) => item.id !== id));
                if (selectedResource?.id === id) setSelectedResource(null);
            }
        } catch (error) {
            console.error("Failed to archive", error);
        }
        finally {
            setIsLoading(true);
            await loadInboxData();
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await api.deleteResource(id);
            if (res.ok) {
                setItems(items.filter((item) => item.id !== id));
                if (selectedResource?.id === id) setSelectedResource(null);
            }
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const handlePromote = async (id: string) => {
        try {
            const res = await api.promoteResource(id);
            if (res.ok) {
                setItems((prev) => prev.filter((item) => item.id !== id));
                if (selectedResource?.id === id) setSelectedResource(null);
            }
        } catch (error) {
            console.error("Failed to promote", error);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                        <Inbox className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Inbox
                        </h1>
                        <p className="text-sm text-slate-500">
                            {totalItems} elementów do przejrzenia
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 group">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Szukaj po tytule lub tagach..."
                        className="w-full rounded-md border border-slate-300 bg-white p-3 pl-10 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none transition-colors placeholder:text-slate-400"
                    />
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <button type="submit" className="hidden">Submit</button>
                </form>
            </div>

            {pendingCount > 0 && !isLoading && (
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-tech-primary/35 bg-tech-primary-dim/50 px-4 py-3 text-sm text-tech-foreground-muted">
                    <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-tech-primary" />
                    <span>
                        {pendingCount === 1
                            ? '1 element w analizie AI — odświeżam listę automatycznie…'
                            : `${pendingCount} elementów w analizie AI — odświeżam listę automatycznie…`}
                    </span>
                </div>
            )}

            <div className="min-h-[400px]">
                {isLoading ? (
                    <Card className="h-64 flex flex-col items-center justify-center gap-4 border-dashed">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        <span className="text-sm text-slate-500">Pobieram zasoby...</span>
                    </Card>
                ) : items.length === 0 ? (
                    <Card className="h-64 flex flex-col items-center justify-center gap-4 border-dashed">
                        <AlertCircle className="w-8 h-8 text-slate-400" />
                        <span className="text-sm text-slate-500">
                            {searchTerm ? "Brak wyników" : "Inbox jest pusty"}
                        </span>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {items.map((item) => (
                            <InboxCard
                                key={item.id}
                                resource={item}
                                onArchive={loadInboxData}
                                onClick={() => setSelectedResource(item)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 pt-6">
                    <div className="text-sm text-slate-500">
                        Strona <span className="text-slate-900 font-medium">{page}</span> z {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            variant="outline"
                            size="icon"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
                <InboxDetailModal
                    resource={selectedResource}
                    onClose={() => setSelectedResource(null)}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                    onPromote={handlePromote}
                    onRetry={() => {
                        loadInboxData();
                    }}
                />
            )}
        </div>
    );
}