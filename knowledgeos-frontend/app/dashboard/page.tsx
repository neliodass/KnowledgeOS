'use client';

import {useEffect, useState, useCallback} from 'react';
import {api} from '@/lib/api';
import {InboxResource, VaultResource} from '@/lib/types';
import {InboxCard} from '@/components/InboxCard';
import {VaultCard} from '@/components/VaultCard';
import {RefreshCw, Database, Inbox} from 'lucide-react';
import {InboxDetailModal} from "@/components/InboxDetailModal";
import {VaultDetailModal} from "@/components/VaultDetailModal";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useInboxAutoRefresh } from '@/lib/useInboxAutoRefresh';
import { hasInboxAxes } from '@/lib/inboxTiers';
export default function Dashboard() {
    const [inboxItems, setInboxItems] = useState<InboxResource[]>([]);
    const [vaultItems, setVaultItems] = useState<VaultResource[]>([]);
    const [loadingInbox, setLoadingInbox] = useState(true);
    const [loadingVault, setLoadingVault] = useState(true);
    const [selectedResource, setSelectedResource] = useState<InboxResource | null>(null);
    const [selectedVaultResource, setSelectedVaultResource] = useState<VaultResource | null>(null);
    const fetchInbox = useCallback(async (options?: { silent?: boolean }) => {
        if (!options?.silent) setLoadingInbox(true);
        try {
            const res = await api.getInboxMix();
            if (res.ok) {
                const data = await res.json();
                setInboxItems(data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            if (!options?.silent) setLoadingInbox(false);
        }
    }, []);
    const fetchVault = async () => {
        setLoadingVault(true);
        try {
            const res = await api.getVaultMix();
            if (res.ok) {
                const data = await res.json();
                setVaultItems(data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingVault(false);
        }
    };
    const handleArchiveFromModal = async (id: string) => {
        try {
            await api.archiveInboxResource(id);
            setSelectedResource(null);
            await fetchInbox();
        } catch (e) {
            console.error(e);
        }
    };
    const handleDeleteFromModal = async (id: string) => {
        try {
            await api.deleteResource(id);
            setSelectedResource(null);
            await fetchInbox();
        } catch (e) {
            console.error(e);
        }
    };
    const [hasPreferences, setHasPreferences] = useState(true);

    const checkPrefs = async () => {
        try {
            const res = await api.getPreferences();
            if (res.ok) {
                const data = await res.json();
                if (!data || (!data.professionalContext && !data.learningGoals)) {
                    setHasPreferences(false);
                } else {
                    setHasPreferences(true);
                }
            }
        } catch (e) {
            console.error("Failed to check preferences", e);
        }
    };
    useEffect(() => {
        void fetchInbox();
        fetchVault();
        checkPrefs();

    }, [fetchInbox]);

    useInboxAutoRefresh(inboxItems, fetchInbox);

    const pendingInboxCount = inboxItems.filter(item => !hasInboxAxes(item)).length;

    return (
        <div>
            {!hasPreferences && (
                <Card className="mb-8 border-amber-200 bg-amber-50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-md border border-amber-300 flex items-center justify-center bg-amber-100">
                            <span className="text-amber-600 font-bold">!</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-amber-800">
                                Uzupełnij profil preferencji
                            </h4>
                            <p className="text-xs text-amber-700">
                                Lepsze preferencje = lepsze dopasowanie treści i kolejności.
                            </p>
                        </div>
                    </div>
                    <a
                        href="/dashboard/settings"
                        className="text-xs font-medium border border-amber-300 px-3 py-2 rounded-md text-amber-700 hover:bg-amber-100 transition-all"
                    >
                        Otwórz ustawienia
                    </a>
                </Card>
            )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            <section className="flex flex-col gap-6">

                <div className="flex items-center justify-between px-1 border-b border-tech-border pb-2">

                    <h3 className="text-sm font-semibold text-tech-foreground flex items-center gap-2">
                        <Inbox className="text-tech-primary w-5 h-5"/>
                        Inbox
                    </h3>
                    <div className="flex items-center gap-2">

                        {pendingInboxCount > 0 && (
                            <span className="hidden sm:flex items-center gap-1.5 text-xs text-tech-foreground-muted">
                                <RefreshCw className="h-3 w-3 animate-spin text-tech-primary" />
                                Analiza ({pendingInboxCount})
                            </span>
                        )}

                        <Button
                            onClick={() => void fetchInbox()}
                            variant="outline"
                            size="icon"
                            className={`${loadingInbox ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw className="w-3 h-3"/>
                        </Button>
                    </div>
                </div>

                {loadingInbox ? (
                    <div className="text-sm text-tech-foreground-muted animate-pulse">Ładowanie inbox...</div>
                ) : inboxItems.length === 0 ? (
                    <div
                        className="p-8 rounded-lg border border-dashed border-tech-border text-center text-sm text-tech-foreground-muted">
                        Brak oczekujących elementów.
                    </div>
                ) : (
                    inboxItems.slice(0, 3).map(item => (
                            <InboxCard
                                key={item.id}
                                resource={item}
                                onArchive={() => void fetchInbox()}
                                onClick={() => setSelectedResource(item)}/>
                        ))
                )}
            </section>
            <section className="flex flex-col gap-6">
                <div className="flex items-center justify-between px-1 border-b border-tech-border pb-2">
                    <h3 className="text-sm font-semibold text-tech-foreground flex items-center gap-2">
                        <Database className="text-tech-primary w-5 h-5"/>
                        Vault
                    </h3>
                    <Button
                        onClick={fetchVault}
                        variant="outline"
                        size="icon"
                        className={`${loadingVault ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw className="w-3 h-3"/>
                    </Button>
                </div>

                {loadingVault ? (
                    <div className="text-sm text-tech-foreground-muted animate-pulse">Ładowanie vault...</div>
                ) : vaultItems.length === 0 ? (
                    <div
                        className="p-8 rounded-lg border border-dashed border-tech-border text-center text-sm text-tech-foreground-muted">
                        Vault jest pusty.
                    </div>
                ) : (
                    vaultItems.slice(0, 5).map(item => (
                        <VaultCard key={item.id} resource={item} onClick={() => setSelectedVaultResource(item)} />
                    ))
                )}
            </section>

            {selectedResource && (
                <InboxDetailModal
                    resource={selectedResource}
                    onClose={() => setSelectedResource(null)}
                    onArchive={handleArchiveFromModal}
                    onDelete={handleDeleteFromModal}
                    onRetry={() => void fetchInbox()}
                />
            )}

            {selectedVaultResource && (
                <VaultDetailModal
                    resource={selectedVaultResource}
                    onClose={() => setSelectedVaultResource(null)}
                    onDelete={fetchVault}
                />
            )}
        </div>
        </div>
    );
}

