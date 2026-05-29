"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Inbox, Database, ArrowRight, Loader2, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function AddResourcePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [mode, setMode] = useState<'inbox' | 'vault'>('inbox');
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (searchParams.get('mode') === 'vault') {
            setMode('vault');
        }
    }, [searchParams]);

    const handleInitialSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setIsLoading(true);
        try {
            await api.createResource({
                url,
                addToVault: mode === 'vault',
            });

            router.push(
                mode === 'vault' ? '/dashboard/vault?added=1' : '/dashboard/inbox?added=1'
            );
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="text-tech-foreground">Gdzie zapisać link?</CardTitle>
                    <CardDescription>
                        Inbox — do ręcznej oceny. Vault — od razu do biblioteki (kategorię i sugestię AI ustawisz w szczegółach zasobu).
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
        </div>
    );
}

export default function AddResourcePage() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-2xl mx-auto flex justify-center py-16">
                <Loader2 className="w-8 h-8 text-tech-primary animate-spin" />
            </div>
        }>
            <AddResourcePageContent />
        </Suspense>
    );
}
