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
    Search,
    AlertCircle,
    Sparkles,
    Check
} from "lucide-react";

export default function AddResourcePage() {
    const router = useRouter();

    const [step, setStep] = useState<'input' | 'processing' | 'review'>('input');
    const [mode, setMode] = useState<'inbox' | 'vault'>('inbox');
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [resourceId, setResourceId] = useState<string | null>(null);
    const [analyzedData, setAnalyzedData] = useState<any>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [searchCategory, setSearchCategory] = useState("");
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    useEffect(() => {
        if (mode === 'vault' && step === 'input') {
            loadCategories();
        }
    }, [mode, step]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (step === 'processing' && resourceId) {
            interval = setInterval(async () => {
                try {
                    const data = await api.getVaultResource(resourceId);
                    if (data && (data.aiSummary || data.suggestedCategoryName || data.categoryId)) {
                        setAnalyzedData(data);
                        if (data.categoryId) {
                            setSelectedCategoryId(data.categoryId);
                        } else if (data.suggestedCategoryName) {
                            setSearchCategory(data.suggestedCategoryName);
                        }
                        setStep('review');
                        clearInterval(interval);
                    }
                } catch (error) {

                }
            }, 2500);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [step, resourceId]);

    const loadCategories = async () => {
        setIsCategoriesLoading(true);
        try {
            const data = await api.getCategories();
            setCategories(data);
        } catch (error) {
        } finally {
            setIsCategoriesLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!searchCategory.trim()) return;
        setIsCreatingCategory(true);
        try {
            const newCat = await api.createCategory(searchCategory);
            setCategories([...categories, newCat]);
            setSelectedCategoryId(newCat.id);
            setSearchCategory("");
        } catch (error) {
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const handleInitialSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setIsLoading(true);
        try {
            const res = await api.createResource({
                url,
                addToVault: mode === 'vault'
            });

            if (mode === 'vault') {
                setResourceId(res.id);
                setStep('processing');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalizeVault = async () => {
        if (!resourceId) return;
        setIsLoading(true);
        try {
            if (selectedCategoryId) {
                await api.updateVaultResourceCategory(resourceId, selectedCategoryId);
            }
            router.push('/dashboard/vault');
            router.refresh();
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchCategory.toLowerCase())
    );

    const showCreateOption = searchCategory && !categories.some(c => c.name.toLowerCase() === searchCategory.toLowerCase());

    return (
        <div className="w-full max-w-3xl mx-auto space-y-8 p-4 md:p-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight uppercase font-mono">
                    Input Protocol
                </h1>
                <p className="text-tech-text-muted text-sm font-mono">
                    Ingest new data into KnowledgeOS.
                </p>
            </div>

            {step === 'input' && (
                <>
                    <div className="grid grid-cols-2 gap-4 p-1 bg-tech-surface border border-tech-border">
                        <button
                            onClick={() => setMode('inbox')}
                            type="button"
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
                            type="button"
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

                    <form onSubmit={handleInitialSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-black font-bold py-4 uppercase tracking-[0.2em] hover:bg-tech-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Initiating...
                                </>
                            ) : (
                                <>
                                    Initiate Ingestion
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </>
            )}

            {step === 'processing' && (
                <div className="flex flex-col items-center justify-center py-20 space-y-6 border border-tech-border bg-tech-surface animate-in zoom-in duration-500">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 text-tech-primary animate-spin" />
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-white uppercase tracking-widest">AI Analysis in Progress</h3>
                        <p className="text-tech-primary font-mono text-sm">Extracting metadata and categorizing...</p>
                    </div>
                </div>
            )}

            {step === 'review' && analyzedData && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 border border-tech-primary bg-tech-primary/5 space-y-4">
                        <div className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-tech-primary" />
                            <h3 className="font-bold text-white uppercase tracking-widest">Analysis Complete</h3>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-[10px] text-tech-primary uppercase font-bold tracking-widest">Generated Summary</h4>
                            <p className="text-sm text-gray-300 font-mono leading-relaxed">
                                {analyzedData.aiSummary || "No summary generated."}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 p-6 border border-tech-border bg-tech-surface/30">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-tech-primary uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="w-3 h-3" />
                                Classification Review
                            </label>
                        </div>

                        {analyzedData.suggestedCategoryName && !analyzedData.categoryId && (
                            <div className="p-3 mb-4 bg-tech-primary/10 border border-tech-primary flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-tech-primary" />
                                    <span className="text-xs text-tech-primary font-bold uppercase">AI Suggestion: {analyzedData.suggestedCategoryName}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setSearchCategory(analyzedData.suggestedCategoryName);
                                        setSelectedCategoryId(null);
                                    }}
                                    className="text-[10px] bg-tech-primary text-black px-2 py-1 font-bold uppercase hover:bg-white transition-colors"
                                >
                                    Use Suggestion
                                </button>
                            </div>
                        )}

                        <div className="relative">
                            <input
                                type="text"
                                value={searchCategory}
                                onChange={(e) => {
                                    setSearchCategory(e.target.value);
                                    setSelectedCategoryId(null);
                                }}
                                placeholder="Search or create category..."
                                className="w-full bg-black/50 border border-tech-border p-3 text-sm text-white focus:border-tech-primary focus:outline-none mb-4 font-mono"
                            />
                            <Search className="absolute right-3 top-3 w-4 h-4 text-gray-500" />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {showCreateOption && (
                                <button
                                    type="button"
                                    onClick={handleCreateCategory}
                                    disabled={isCreatingCategory}
                                    className="p-3 text-left border border-dashed border-tech-primary/50 text-tech-primary hover:bg-tech-primary/10 transition-all flex items-center justify-between group"
                                >
                                    <span className="truncate text-xs font-bold uppercase">
                                        {isCreatingCategory ? "Creating..." : `+ Create "${searchCategory}"`}
                                    </span>
                                    {isCreatingCategory ? <Loader2 className="w-3 h-3 animate-spin"/> : <Plus className="w-3 h-3" />}
                                </button>
                            )}

                            {filteredCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategoryId(cat.id);
                                        setSearchCategory(cat.name);
                                    }}
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
                        </div>
                    </div>

                    <button
                        onClick={handleFinalizeVault}
                        disabled={isLoading || !selectedCategoryId}
                        className="w-full bg-tech-primary text-black font-bold py-4 uppercase tracking-[0.2em] hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                Confirm & Save to Vault
                                <Database className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}