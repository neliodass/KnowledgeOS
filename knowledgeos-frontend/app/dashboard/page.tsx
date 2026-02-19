'use client';

import {useEffect, useState} from 'react';
import {api} from '@/lib/api';
import {InboxResource, VaultResource} from '@/lib/types';
import {InboxCard} from '@/components/InboxCard';
import {VaultCard} from '@/components/VaultCard';
import {RefreshCw, Database, Inbox} from 'lucide-react';
import {InboxDetailModal} from "@/components/InboxDetailModal";

export default function Dashboard() {
    const [inboxItems, setInboxItems] = useState<InboxResource[]>([]);
    const [vaultItems, setVaultItems] = useState<VaultResource[]>([]);
    const [loadingInbox, setLoadingInbox] = useState(true);
    const [loadingVault, setLoadingVault] = useState(true);
    const [selectedResource, setSelectedResource] = useState<InboxResource | null>(null);
    const fetchInbox = async () => {
        setLoadingInbox(true);
        try {
            const res = await api.getInboxMix();
            if (res.ok) {
                const data = await res.json();
                setInboxItems(data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingInbox(false);
        }
    };
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
        fetchInbox();
        fetchVault();
        checkPrefs();

    }, []);

    return (
        <div>
            {!hasPreferences && (
                <div className="mb-8 border border-orange-500/50 bg-orange-500/10 p-4 flex items-center justify-between group animate-pulse hover:animate-none transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border border-orange-500 flex items-center justify-center bg-orange-500/20">
                            <span className="text-orange-500 font-bold">!</span>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-orange-500 uppercase tracking-tighter">
                                Cognitive Profile Incomplete
                            </h4>
                            <p className="text-[10px] text-orange-300/70 uppercase">
                                AI requires your preferences to prioritize your stream effectively.
                            </p>
                        </div>
                    </div>
                    <a
                        href="/dashboard/settings"
                        className="text-[10px] font-bold border border-orange-500 px-3 py-2 text-orange-500 hover:bg-orange-500 hover:text-black transition-all"
                    >
                        CONFIGURE_NOW
                    </a>
                </div>
            )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            <section className="flex flex-col gap-6">

                <div className="flex items-center justify-between px-1 border-b border-tech-border pb-2">

                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Inbox className="text-tech-green w-5 h-5"/>
                        Input Stream
                    </h3>
                    <div className="flex items-center gap-2">

                        <button
                            onClick={fetchInbox}
                            className={`w-6 h-6 border border-tech-border flex items-center justify-center text-gray-500 hover:text-tech-green hover:border-tech-green transition-colors ${loadingVault ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw className="w-3 h-3"/>
                        </button>
                    </div>
                </div>

                {loadingInbox ? (
                    <div className="text-xs text-tech-text-muted animate-pulse font-mono">Loading stream...</div>
                ) : inboxItems.length === 0 ? (
                    <div
                        className="p-8 border border-dashed border-tech-border text-center text-xs text-tech-text-muted">
                        No pending items in stream.
                    </div>
                ) : (
                    inboxItems.slice(0, 3)
                        .sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0))
                        .map(item => (
                            <InboxCard
                                key={item.id}
                                resource={item}
                                onArchive={fetchInbox}
                                onClick={() => setSelectedResource(item)}/>
                        ))
                )}
            </section>
            <section className="flex flex-col gap-6">
                <div className="flex items-center justify-between px-1 border-b border-tech-border pb-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Database className="text-tech-green w-5 h-5"/>
                        Review from Vault
                    </h3>
                    <button
                        onClick={fetchVault}
                        className={`w-6 h-6 border border-tech-border flex items-center justify-center text-gray-500 hover:text-tech-green hover:border-tech-green transition-colors ${loadingVault ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw className="w-3 h-3"/>
                    </button>
                </div>

                {loadingVault ? (
                    <div className="text-xs text-tech-text-muted animate-pulse font-mono">Accessing database...</div>
                ) : vaultItems.length === 0 ? (
                    <div
                        className="p-8 border border-dashed border-tech-border text-center text-xs text-tech-text-muted">
                        Vault is empty.
                    </div>
                ) : (
                    vaultItems.slice(0, 5).map(item => (
                        <VaultCard key={item.id} resource={item}/>
                    ))
                )}
            </section>

            {selectedResource && (
                <InboxDetailModal
                    resource={selectedResource}
                    onClose={() => setSelectedResource(null)}
                    onArchive={handleArchiveFromModal}
                    onDelete={fetchInbox}
                    onRetry={fetchInbox}
                />)}
        </div>
        </div>
    );
}