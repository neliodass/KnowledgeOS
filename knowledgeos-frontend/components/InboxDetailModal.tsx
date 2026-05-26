import {InboxResource, ProfileRefineResponse} from '@/lib/types';
import {X, PlayCircle, Sparkles, Archive, Trash2, Database, ExternalLink, RefreshCw, Loader2, MessageSquare, ChevronDown} from 'lucide-react';
import {InboxAxisBars} from '@/components/InboxAxisBars';
import {InboxProcessingIndicator} from '@/components/InboxProcessingIndicator';
import {hasInboxAxes} from '@/lib/inboxTiers';
import Image from "next/image";
import Link from "next/link";
import {useState} from "react";
import {api} from "@/lib/api";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface InboxDetailModalProps {
    resource: InboxResource;
    onClose: () => void;
    onArchive: (id: string) => void;
    onDelete?: (id: string) => void;
    onPromote?: (id: string) => void;
    onRetry?: () => void;
}

export function InboxDetailModal({resource, onClose, onArchive, onDelete, onPromote,onRetry}: InboxDetailModalProps) {
    const [isRetrying, setIsRetrying] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showScoreFeedback, setShowScoreFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [feedbackError, setFeedbackError] = useState('');
    const [refinePreview, setRefinePreview] = useState<ProfileRefineResponse | null>(null);
    const [applyLoading, setApplyLoading] = useState(false);
    const [showWhy, setShowWhy] = useState(false);
    const isVideo = resource.resourceType === 'Video';
    const showAxes = hasInboxAxes(resource);
    const handleRetry = async () => {
        setIsRetrying(true);
        try {
            const res = await api.retryResource(resource.id);
            if (res.ok) {
                if (onRetry) onRetry();
                onClose();
            }
        } catch (error) {
            console.error("Retry failed", error);
        } finally {
            setIsRetrying(false);
        }
    };
    const handleScoreFeedback = async () => {
        if (!feedbackMessage.trim()) return;
        setFeedbackLoading(true);
        setFeedbackError('');
        setRefinePreview(null);
        try {
            await api.submitScoringFeedback(resource.id, feedbackMessage.trim());
            const result: ProfileRefineResponse = await api.refinePreferences(
                feedbackMessage.trim(),
                resource.id
            );
            setRefinePreview(result);
        } catch (e) {
            setFeedbackError(e instanceof Error ? e.message : 'Profile update failed');
        } finally {
            setFeedbackLoading(false);
        }
    };

    const handleApplyProfileFix = async () => {
        if (!refinePreview?.hasChanges) return;
        setApplyLoading(true);
        try {
            await api.updatePreferences(refinePreview.proposedPreferences);
            setShowScoreFeedback(false);
            setFeedbackMessage('');
            setRefinePreview(null);
        } catch (e) {
            setFeedbackError(e instanceof Error ? e.message : 'Failed to save profile');
        } finally {
            setApplyLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to move this item to trash?")) return;

        setIsDeleting(true);
        try {
            const res = await api.deleteResource(resource.id);

            if (res.ok) {
                if (onDelete) onDelete(resource.id);
                onClose();
            }
        } catch (error) {
            console.error("Delete failed", error);
        } finally {
            setIsDeleting(false);
        }
    };
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-slate-900/50"
             onClick={onClose}>
            <div
                className="relative w-full max-w-4xl bg-white border border-slate-200 shadow-xl rounded-xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-semibold text-slate-900">
                            Resource ID: {resource.id.substring(0, 8)}
                        </h2>
                    </div>
                    <Button
                        onClick={onClose}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                    >
                        <X className="w-5 h-5"/>
                    </Button>
                </div>

                <div className="overflow-y-auto flex-1">
                    <div className="p-6 md:p-8">
                        {resource.imageUrl && (

                            <div
                                className="relative w-full aspect-video border border-slate-200 mb-8 group cursor-pointer bg-slate-100 overflow-hidden rounded-lg">
                                <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                                    <Image
                                        src={resource.imageUrl}
                                        alt={resource.title}
                                        fill
                                        sizes="(max-width: 1200px) 100vw, 800px"
                                        className="object-cover grayscale-50 group-hover:grayscale-0 transition-all opacity-60 group-hover:opacity-100"
                                    />

                                    {isVideo && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <PlayCircle
                                                className="w-20 h-20 text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"/>
                                        </div>
                                    )
                                    }
                                </Link>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                                        <span>Źródło: {resource.siteName || 'Web'}</span>
                                    </div>
                                    <div className="mb-4 max-w-md">
                                        {showAxes ? (
                                            <InboxAxisBars resource={resource} />
                                        ) : (
                                            <InboxProcessingIndicator />
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-semibold text-slate-900 leading-tight">
                                        <a href={resource.url} target="_blank" rel="noopener noreferrer"
                                           className="hover:text-indigo-600 flex items-start gap-2">
                                            {resource.correctedTitle || resource.title}
                                            <ExternalLink className="w-4 h-4 mt-1 opacity-50"/>
                                        </a>
                                    </h3>
                                </div>
                                <div className="border-l-2 border-slate-200 pl-6 space-y-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowWhy(v => !v)}
                                        className="flex items-center gap-2 text-xs font-semibold text-slate-700"
                                    >
                                        <ChevronDown className={`w-4 h-4 transition-transform ${showWhy ? 'rotate-180' : ''}`}/>
                                        Dlaczego?
                                    </button>
                                    {showWhy && (
                                    <div
                                        className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                        {resource.aiVerdict || "Brak uzasadnienia dla tego wpisu."}
                                    </div>
                                    )}
                                    <Button
                                        type="button"
                                        onClick={() => setShowScoreFeedback(v => !v)}
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        <MessageSquare className="w-3 h-3"/>
                                        {showScoreFeedback ? 'Ukryj feedback' : 'Ocena nie pasuje'}
                                    </Button>
                                    {showScoreFeedback && (
                                        <Card className="border border-slate-200 bg-slate-50 p-4 space-y-3">
                                            <textarea
                                                className="w-full bg-white border border-slate-300 rounded-md p-2 text-sm text-slate-700 h-20 resize-none focus:outline-none focus:border-indigo-500"
                                                spellCheck={false}
                                                placeholder="Np. za wysoko — nie interesuje mnie polityka, to tylko clickbait..."
                                                value={feedbackMessage}
                                                onChange={e => setFeedbackMessage(e.target.value)}
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    type="button"
                                                    onClick={handleScoreFeedback}
                                                    disabled={feedbackLoading || !feedbackMessage.trim()}
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    {feedbackLoading ? 'Analizuję...' : 'Popraw mój profil'}
                                                </Button>
                                                {refinePreview?.hasChanges && (
                                                    <Button
                                                        type="button"
                                                        onClick={handleApplyProfileFix}
                                                        disabled={applyLoading}
                                                        size="sm"
                                                    >
                                                        {applyLoading ? 'Zapisuję...' : 'Zastosuj profil'}
                                                    </Button>
                                                )}
                                            </div>
                                            {feedbackError && (
                                                <p className="text-xs text-red-500">{feedbackError}</p>
                                            )}
                                            {refinePreview && (
                                                <p className="text-xs text-slate-600 leading-relaxed">
                                                    {refinePreview.assistantSummary}
                                                </p>
                                            )}
                                        </Card>
                                    )}
                                </div>
                                <div className="border-l-2 border-slate-200 pl-6 space-y-4">
                                    <h4 className="text-xs font-semibold text-slate-700">
                                        Podsumowanie AI
                                    </h4>
                                    <div
                                        className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                        {resource.aiSummary || "No detailed summary available for this node."}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                                    <h4 className="text-xs font-semibold text-slate-600 mb-4">Tagi</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {resource.tags && resource.tags.length > 0 ? resource.tags.map(tag => (
                                                <span key={tag}
                                                      className="text-xs text-slate-700 border border-slate-300 px-2 py-1 rounded-md">
                            #{tag}
                        </span>
                                            )) :
                                            <span className="text-xs text-slate-500">Brak tagów</span>}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="p-6 border-t border-slate-200 bg-white grid grid-cols-2 md:grid-cols-4 gap-3 sticky bottom-0 z-10">
                    <Button
                        onClick={() => onPromote && onPromote(resource.id)}
                        variant="outline"
                        className="justify-center"
                    >
                        <Database className="w-4 h-4"/>
                        <span>Do Vault</span>
                    </Button>

                    <Button
                        onClick={() => onArchive(resource.id)}
                        variant="outline"
                        className="justify-center"
                    >
                        <Archive className="w-4 h-4"/>
                        Archiwizuj
                    </Button>
                    <Button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        variant="outline"
                        className="justify-center"
                    >
                        {isRetrying ? (
                            <RefreshCw className="w-4 h-4 animate-spin"/>
                        ) : (
                            <Sparkles className="w-4 h-4"/>
                        )}
                        {isRetrying ? "Przetwarzam..." : "Analizuj ponownie"}
                    </Button>
                    <Button
                        onClick={handleDelete}
                        disabled={isDeleting || isRetrying}
                        variant="destructive"
                        className="justify-center"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin"/>
                        ) : (
                            <Trash2 className="w-4 h-4"/>
                        )}
                        {isDeleting ? "Usuwam..." : "Przenieś do kosza"}
                    </Button>
                </div>

            </div>
        </div>
    );
}