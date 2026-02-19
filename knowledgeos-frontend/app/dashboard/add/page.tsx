"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Category } from "@/lib/types";
import {
    Inbox,
    Database,
    ArrowRight,
    Loader2,
    Plus,
    CheckCircle2,
    Link as LinkIcon,
    Search
} from "lucide-react";

export default function AddResourcePage() {
    const router = useRouter();
    const [mode, setMode] = useState<'inbox' | 'vault'>('inbox');
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

    useEffect(() => {
        if (mode === 'vault') {
            loadCategories();
        }
    }, [mode]);

    const loadCategories = async () => {
        setIsCategoriesLoading(true);
        try {
            const data = await api.getCategories();
            setCategories(data);
        } catch (error) {
            console.error("Failed to load categories", error);
        } finally {
            setIsCategoriesLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        if (mode === 'vault' && !selectedCategoryId) {
            alert("Please select a category for the Vault.");
            return;
        }

        setIsLoading(true);
        try {
            await api.createResource({
                url,
                addToVault: mode === 'vault',
                categoryId: mode === 'vault' && selectedCategoryId ? selectedCategoryId : undefined
            });

            // Success feedback could be improved here, for now redirect
            router.push(mode === 'vault' ? '/dashboard/vault' : '/dashboard');
            router.refresh();
        } catch (error) {
            console.error("Failed to add resource", error);
            alert("Failed to add resource. It might be a duplicate or invalid URL.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-8 p-4 md:p-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight uppercase font-mono">
                    Input Protocol
                </h1>
                <p className="text-tech-text-muted text-sm font-mono">
                    Ingest new data into KnowledgeOS. Select target storage.
                </p>
            </div>

            {/* Mode Toggle */}
            <div className="grid grid-cols-2 gap-4 p-1 bg-tech-surface border border-tech-border">
                <button
                    onClick={() => setMode('inbox')}
                    className={`flex items-center justify-center gap-3 py-4 transition-all duration-300 ${
                        mode === 'inbox'
                            ? 'bg-tech-primary text-black font-bold shadow-[0_0_20px_rgba(163,255,191,0.3)]'
                            : 'text-tech-text-muted hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Inbox className="w-5 h-5" />
                    <span className="uppercase tracking-widest text-sm">Inbox</span>
                </button>
                <button
                    onClick={() => setMode('vault')}
                    className={`flex items-center justify-center gap-3 py-4 transition-all duration-300 ${
                        mode === 'vault'
                            ? 'bg-tech-primary text-black font-bold shadow-[0_0_20px_rgba(163,255,191,0.3)]'
                            : 'text-tech-text-muted hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Database className="w-5 h-5" />
                    <span className="uppercase tracking-widest text-sm">Vault</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* URL Input */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-tech-primary uppercase tracking-widest flex items-center gap-2">
                        <LinkIcon className="w-3 h-3" />
                        Target URL
                    </label>
                    <div className="relative group">
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://..."
                            required
                            className="w-full bg-tech-bg border-2 border-tech-border p-4 text-white placeholder-gray-600 focus:outline-none focus:border-tech-primary focus:shadow-[0_0_30px_rgba(163,255,191,0.1)] transition-all font-mono"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                            <div className="w-2 h-2 bg-tech-primary animate-pulse rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Vault Specific: Category Selection */}
                {mode === 'vault' && (
                    <div className="space-y-4 p-6 border border-tech-border bg-tech-surface/30">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-tech-primary uppercase tracking-widest flex items-center gap-2">
                                <Search className="w-3 h-3" />
                                Select Classification
                            </label>
                            {isCategoriesLoading && <Loader2 className="w-3 h-3 text-tech-primary animate-spin" />}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategoryId(cat.id)}
                                    className={`p-3 text-left border transition-all text-xs uppercase tracking-wider ${
                                        selectedCategoryId === cat.id
                                            ? 'border-tech-primary bg-tech-primary/10 text-tech-primary'
                                            : 'border-tech-border text-gray-400 hover:border-gray-500 hover:text-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="truncate">{cat.name}</span>
                                        {selectedCategoryId === cat.id && <CheckCircle2 className="w-3 h-3" />}
                                    </div>
                                </button>
                            ))}
                            <button
                                type="button"
                                disabled
                                className="p-3 text-left border border-dashed border-tech-border text-gray-600 flex items-center gap-2 opacity-50 cursor-not-allowed"
                            >
                                <Plus className="w-3 h-3" />
                                <span>New Category (AI)</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white text-black font-bold py-4 uppercase tracking-[0.2em] hover:bg-tech-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            Initiate Ingestion
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}