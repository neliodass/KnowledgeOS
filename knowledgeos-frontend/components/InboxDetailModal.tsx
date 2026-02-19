import {InboxResource} from '@/lib/types';
import {X, PlayCircle, Eye, Sparkles, Archive, Trash2, Database, ExternalLink, RefreshCw, Loader2} from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import {useState} from "react";
import {api} from "@/lib/api";

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
    const isVideo = resource.resourceType === 'Video';
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 modal-overlay"
             onClick={onClose}>
            <div
                className="relative w-full max-w-4xl bg-tech-bg border-2 border-tech-primary shadow-[0_0_30px_rgba(163,255,191,0.15)] flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-tech-primary p-4 bg-tech-primary-dim">
                    <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-tech-primary"/>
                        <h2 className="text-sm font-bold text-tech-primary uppercase tracking-widest">
                            Protocol_ID: {resource.id.substring(0, 8)}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 border border-tech-primary flex items-center justify-center text-tech-primary hover:bg-tech-primary hover:text-black transition-colors"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1">
                    <div className="p-6 md:p-8">
                        {resource.imageUrl && (

                            <div
                                className="relative w-full aspect-video border border-tech-border mb-8 group cursor-pointer bg-black/50 overflow-hidden">
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
                                                className="w-20 h-20 text-tech-primary drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"/>
                                        </div>
                                    )
                                    }
                                </Link>
                                <div
                                    className="absolute bottom-4 left-4 bg-black/90 border border-tech-primary px-3 py-1 flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <Eye className="w-3 h-3 text-tech-primary"/>
                                        <span
                                            className="text-[10px] text-tech-primary font-bold uppercase">PREVIEW_MODE</span>
                                    </div>
                                    <div className="w-px h-3 bg-tech-border"></div>
                                    <span
                                        className="text-[10px] text-tech-primary font-bold uppercase tracking-tighter">
                        {resource.resourceType.toUpperCase()}_STREAM
                    </span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold bg-tech-primary text-black px-1.5 py-0.5 uppercase">
                        SOURCE: {resource.siteName || 'WEB'}
                    </span>
                                        <span
                                            className="text-[10px] font-bold border border-tech-primary text-tech-primary px-1.5 py-0.5">
                        SCORE: {resource.aiScore || 0}/100
                    </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white uppercase leading-tight font-mono">
                                        <a href={resource.url} target="_blank" rel="noopener noreferrer"
                                           className="hover:text-tech-primary flex items-start gap-2">
                                            {resource.correctedTitle || resource.title}
                                            <ExternalLink className="w-4 h-4 mt-1 opacity-50"/>
                                        </a>
                                    </h3>
                                </div>
                                <div className="border-l-2 border-tech-primary pl-6 space-y-4">
                                    <h4 className="text-xs font-bold text-tech-primary uppercase tracking-[0.2em] mb-2">
                                        &gt; AI_VERDICT
                                    </h4>
                                    <div
                                        className="text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-line">
                                        {resource.aiVerdict || "No detailed verdict available for this node."}
                                    </div>
                                </div>
                                <div className="border-l-2 border-tech-primary pl-6 space-y-4">
                                    <h4 className="text-xs font-bold text-tech-primary uppercase tracking-[0.2em] mb-2">
                                        &gt; AI_SUMMARY_MODULE
                                    </h4>
                                    <div
                                        className="text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-line">
                                        {resource.aiSummary || "No detailed summary available for this node."}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 border border-tech-border bg-tech-surface">
                                    <h4 className="text-[10px] font-bold text-tech-text-muted uppercase mb-4 tracking-widest">Metadata
                                        Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {resource.tags && resource.tags.length > 0 ? resource.tags.map(tag => (
                                                <span key={tag}
                                                      className="text-[10px] text-tech-primary border border-tech-primary/30 px-2 py-1 uppercase">
                            #{tag}
                        </span>
                                            )) :
                                            <span className="text-[10px] text-gray-600">NO_TAGS_DETECTED</span>}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="p-6 border-t border-tech-border bg-tech-surface grid grid-cols-4 gap-4 sticky bottom-0 z-10">
                    <button
                        onClick={() => onPromote && onPromote(resource.id)}
                        className="flex items-center justify-center gap-3 py-3 border border-tech-primary bg-tech-primary-dim text-tech-primary hover:bg-tech-primary hover:text-black transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        <Database className="w-4 h-4"/>
                        <span className="hidden sm:inline">Promote to Vault</span>
                        <span className="sm:hidden">Promote</span>
                    </button>

                    <button
                        onClick={() => onArchive(resource.id)}
                        className="flex items-center justify-center gap-3 py-3 border border-tech-border text-gray-400 hover:border-white hover:text-white transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        <Archive className="w-4 h-4"/>
                        Archive
                    </button>
                    <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="flex items-center justify-center gap-3 py-3 border border-tech-border text-gray-400 hover:border-tech-primary hover:text-tech-primary transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRetrying ? (
                            <RefreshCw className="w-4 h-4 animate-spin"/>
                        ) : (
                            <Sparkles className="w-4 h-4"/>
                        )}
                        {isRetrying ? "Processing..." : "Reanalyze"}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting || isRetrying}
                        className="flex items-center justify-center gap-3 py-3 border border-red-900 bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin"/>
                        ) : (
                            <Trash2 className="w-4 h-4"/>
                        )}
                        {isDeleting ? "Deleting..." : "Trash"}
                    </button>
                </div>

            </div>
        </div>
    );
}