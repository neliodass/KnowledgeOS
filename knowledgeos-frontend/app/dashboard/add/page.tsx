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
    Sparkles,
    Check
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VaultReviewData {
    aiSummary?: string;
    suggestedCategoryName?: string;
    categoryId?: string;
}

export default function AddResourcePage() {
    const router = useRouter();

    const [step, setStep] = useState<'input' | 'processing' | 'review'>('input');
    const [mode, setMode] = useState<'inbox' | 'vault'>('inbox');
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [resourceId, setResourceId] = useState<string | null>(null);
    const [analyzedData, setAnalyzedData] = useState<VaultReviewData | null>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [searchCategory, setSearchCategory] = useState("");
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    useEffect(() => {
        if (mode === 'vault' && step === 'input') {
            void loadCategories();
        }
    }, [mode, step]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;

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
                        if (interval) clearInterval(interval);
                    }
                } catch {
                    // still processing
                }
            }, 2500);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [step, resourceId]);

    const loadCategories = async () => {
        try {
            const data = await api.getCategories();
            setCategories(data);
        } catch (error) {
            console.error(error);
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
            console.error(error);
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
                router.push('/dashboard/inbox');
            }
        } catch (error) {
            console.error(error);
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
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchCategory.toLowerCase())
    );

    const showCreateOption = searchCategory && !categories.some(c => c.name.toLowerCase() === searchCategory.toLowerCase());

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            {step === 'input' && (
                <>
                    <Card className="border-dashed">
                        <CardHeader>
                            <CardTitle className="text-tech-foreground">Gdzie zapisać link?</CardTitle>
                            <CardDescription>
                                Inbox — do ręcznej oceny. Vault — od razu do biblioteki.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setMode('inbox')}
                                    type="button"
                                    className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                                        mode === 'inbox'
                                            ? 'border-tech-primary bg-tech-primary-dim text-tech-primary'
                                            : 'border-dashed border-tech-border text-tech-foreground-muted hover:border-tech-primary/40 hover:text-tech-foreground'
                                    }`}
                                >
                                    <Inbox className="w-4 h-4" />
                                    Inbox
                                </button>
                                <button
                                    onClick={() => setMode('vault')}
                                    type="button"
                                    className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                                        mode === 'vault'
                                            ? 'border-tech-primary bg-tech-primary-dim text-tech-primary'
                                            : 'border-dashed border-tech-border text-tech-foreground-muted hover:border-tech-primary/40 hover:text-tech-foreground'
                                    }`}
                                >
                                    <Database className="w-4 h-4" />
                                    Vault
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-tech-foreground">
                                <LinkIcon className="w-4 h-4 text-tech-primary" />
                                Adres URL
                            </CardTitle>
                            <CardDescription>Wklej link do artykułu, wideo lub strony.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleInitialSubmit} className="space-y-4">
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://..."
                                    required
                                    className="w-full rounded-lg border border-tech-border bg-tech-surface px-4 py-3 text-sm text-tech-foreground placeholder:text-tech-foreground-muted focus:outline-none focus:ring-2 focus:ring-tech-primary/40"
                                />

                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Dodawanie...
                                        </>
                                    ) : (
                                        <>
                                            Dodaj do {mode === 'inbox' ? 'Inbox' : 'Vault'}
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </>
            )}

            {step === 'processing' && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="relative">
                            <Loader2 className="w-12 h-12 text-tech-primary animate-spin" />
                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-tech-foreground-muted animate-pulse" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-lg font-semibold text-tech-foreground">Analiza AI w toku</h3>
                            <p className="text-sm text-tech-foreground-muted">Pobieram metadane i proponuję kategorię...</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 'review' && analyzedData && (
                <div className="space-y-4">
                    <Card className="border-dashed border-tech-primary/40 bg-tech-primary-dim">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-tech-foreground text-base">
                                <Check className="w-4 h-4 text-tech-primary" />
                                Analiza zakończona
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-tech-foreground-muted leading-relaxed">
                                {analyzedData.aiSummary || "Brak wygenerowanego podsumowania."}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base text-tech-foreground">
                                <Sparkles className="w-4 h-4 text-tech-primary" />
                                Kategoria
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {analyzedData.suggestedCategoryName && !analyzedData.categoryId && (
                                <div className="rounded-lg border border-dashed border-tech-primary/50 bg-tech-primary-dim p-3 flex items-center justify-between gap-3">
                                    <Badge variant="outline">Sugestia AI: {analyzedData.suggestedCategoryName}</Badge>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setSearchCategory(analyzedData.suggestedCategoryName ?? '');
                                            setSelectedCategoryId(null);
                                        }}
                                    >
                                        Użyj
                                    </Button>
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
                                    placeholder="Szukaj lub utwórz kategorię..."
                                    className="w-full rounded-lg border border-tech-border bg-tech-surface px-4 py-2.5 pr-10 text-sm text-tech-foreground focus:outline-none focus:ring-2 focus:ring-tech-primary/40"
                                />
                                <Search className="absolute right-3 top-2.5 w-4 h-4 text-tech-foreground-muted" />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-52 overflow-y-auto">
                                {showCreateOption && (
                                    <button
                                        type="button"
                                        onClick={handleCreateCategory}
                                        disabled={isCreatingCategory}
                                        className="rounded-lg border border-dashed border-tech-primary/50 p-3 text-left text-xs text-tech-primary hover:bg-tech-primary-dim transition-all flex items-center justify-between gap-2"
                                    >
                                        <span className="truncate">
                                            {isCreatingCategory ? 'Tworzenie...' : `+ Utwórz "${searchCategory}"`}
                                        </span>
                                        {isCreatingCategory ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
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
                                        className={`rounded-lg border p-3 text-left text-xs transition-all ${
                                            selectedCategoryId === cat.id
                                                ? 'border-tech-primary bg-tech-primary-dim text-tech-primary'
                                                : 'border-tech-border text-tech-foreground-muted hover:border-tech-primary/30 hover:text-tech-foreground'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="truncate">{cat.name}</span>
                                            {selectedCategoryId === cat.id && <CheckCircle2 className="w-3 h-3 flex-shrink-0" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        onClick={handleFinalizeVault}
                        disabled={isLoading || !selectedCategoryId}
                        className="w-full"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Zapisywanie...
                            </>
                        ) : (
                            <>
                                Zapisz w Vault
                                <Database className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
