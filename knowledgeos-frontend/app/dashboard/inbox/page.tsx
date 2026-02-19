"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { InboxResource } from "@/lib/types";
import { InboxCard } from "@/components/InboxCard";
import { InboxDetailModal } from "@/components/InboxDetailModal";
import { Search, Loader2, Inbox, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

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

    useEffect(() => {
        loadInboxData();
    }, [page, searchTerm]);

    const loadInboxData = async () => {
        setIsLoading(true);
        try {
            const data = await api.getInbox(page, pageSize, searchTerm);
            setItems(data.items || []);
            setTotalItems(data.totalItems || 0);

            const calcTotalPages = Math.ceil((data.totalItems || 0) / pageSize);
            setTotalPages(calcTotalPages > 0 ? calcTotalPages : 1);
        } catch (error) {
            console.error("Failed to fetch inbox items", error);
        } finally {
            setIsLoading(false);
        }
    };

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

    const handlePromote = (id: string) => {
      //TODO - Implement handle promote
        alert("TODO -Implement handle promote");
        if (selectedResource?.id === id) setSelectedResource(null);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header i Wyszukiwarka */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-tech-border pb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-tech-primary/10 border border-tech-primary flex items-center justify-center">
                        <Inbox className="w-6 h-6 text-tech-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white uppercase tracking-widest font-mono">
                            Inbox Protocol
                        </h1>
                        <p className="text-xs text-tech-primary font-mono uppercase tracking-widest">
                            {totalItems} Nodes detected
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 group">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="SEARCH_DATA_NODES..."
                        className="w-full bg-black/50 border border-tech-border p-3 pl-10 text-sm text-white focus:border-tech-primary focus:outline-none transition-colors font-mono uppercase placeholder:text-gray-600"
                    />
                    <Search className="absolute left-3 top-3 w-4 h-4 text-tech-text-muted group-focus-within:text-tech-primary transition-colors" />
                    <button type="submit" className="hidden">Submit</button>
                </form>
            </div>

            {/* Główna zawartość */}
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
                            {searchTerm ? "NO_RESULTS_FOUND" : "INBOX_IS_EMPTY"}
                        </span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {items.map((item) => (
                            <InboxCard
                                key={item.id}
                                resource={item}
                                onArchive={()=>handleArchive}
                                onClick={() => setSelectedResource(item)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Paginacja */}
            {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-tech-border pt-6">
                    <div className="text-xs text-tech-text-muted font-mono uppercase">
                        Page <span className="text-tech-primary">{page}</span> of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 border border-tech-border text-tech-text-muted hover:text-white hover:border-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 border border-tech-border text-tech-text-muted hover:text-white hover:border-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal ze szczegółami */}
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