import { InboxResource } from '@/lib/types';
import { PlayCircle, Archive, FileText, Mic, Hash, LucideIcon } from 'lucide-react';
import Image from "next/image";
import { api } from "@/lib/api";
import { useState } from "react";
import Link from "next/link";

interface InboxCardProps {
    resource: InboxResource;
    onArchive: () => void;
    onClick: () => void;
}

interface ResourceTypeConfig {
    icon: LucideIcon;
    label: string;
    borderColor: string;
    hasBigPreview: boolean;
    showCorners: boolean;
}

const RESOURCE_CONFIG: Record<string, ResourceTypeConfig> = {
    Video: {
        icon: PlayCircle,
        label: 'VIDEO_STREAM',
        borderColor: 'border-tech-primary',
        hasBigPreview: true,
        showCorners: true,
    },
    Article: {
        icon: FileText,
        label: 'ARTICLE',
        borderColor: 'border-tech-primary',
        hasBigPreview: false,
        showCorners: false,
    },
    Podcast: {
        icon: Mic,
        label: 'AUDIO_LOG',
        borderColor: 'border-purple-500',
        hasBigPreview: true,
        showCorners: false,
    },
    Default: {
        icon: Hash,
        label: 'UNKNOWN_DATA',
        borderColor: 'border-tech-border',
        hasBigPreview: false,
        showCorners: false,
    }
};

export function InboxCard({ resource, onArchive, onClick }: InboxCardProps) {
    const [isArchiving, setIsArchiving] = useState(false);

    const config = RESOURCE_CONFIG[resource.resourceType] || RESOURCE_CONFIG.Default;
    const TypeIcon = config.icon;

    const handleArchiveClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        setIsArchiving(true);
        try {
            await api.archiveInboxResource(resource.id);
            onArchive();
        } catch (e) {
            console.error("Błąd archiwizacji:", e);
        } finally {
            setIsArchiving(false);
        }
    }

    return (
        <div
            onClick={onClick}
            className={`border ${config.borderColor} bg-tech-surface relative group transition-all hover:border-tech-primary/50 cursor-pointer`}>

            {config.showCorners && (
                <>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tech-primary"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-tech-primary"></div>
                </>
            )}

            {config.hasBigPreview && (
                <div className="relative w-full aspect-video border-b border-tech-border grayscale-50 group-hover:grayscale-0 transition-all overflow-hidden bg-black/20">

                    {resource.imageUrl ? (
                        <Link
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                        >
                        <Image
                            src={resource.imageUrl}
                            alt={resource.title}
                            fill
                            sizes="(max-width: 384px) 100vw, 33vw"
                            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />   </Link>
                    ) : (
                        <div className="w-full h-full bg-black/50 flex items-center justify-center">
                            <TypeIcon className="w-16 h-16 text-tech-primary opacity-80"/>
                        </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {resource.resourceType === 'Video' &&
                            <PlayCircle className="w-16 h-16 text-tech-primary drop-shadow-lg"/>}
                    </div>

                    <div className="absolute top-4 left-4 bg-black/80 border border-tech-primary px-2 py-1 flex items-center gap-2 backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-tech-primary animate-pulse"></div>
                        <span className="text-[10px] text-tech-primary font-bold uppercase tracking-tighter">
                            {config.label}
                        </span>
                    </div>
                </div>
            )}

            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white uppercase leading-tight mb-2 truncate pr-4">
                            <Link
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-tech-primary transition-colors z-10 relative"
                            >
                                {resource.correctedTitle || resource.title}
                            </Link>
                        </h4>

                        <div className="flex items-center gap-3">
                            <span className={`text-[11px] font-bold px-2 py-0.5 border ${
                                (resource.aiScore ?? 0) > 74 ? 'text-tech-primary border-tech-primary bg-tech-primary-dim' :
                                    (resource.aiScore ?? 0) > 49 ? 'text-orange-400 border-orange-900/50 bg-orange-900/10' :
                                        (resource.aiScore ?? 0) > 19 ? 'text-yellow-400 border-yellow-900/50 bg-yellow-900/10' :
                                        'text-red-400 border-red-900/50 bg-red-900/10'
                            }`}>
                                SCORE: {resource.aiScore ?? 'N/A'}
                            </span>

                            {!config.hasBigPreview && (
                                <span className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                                    <TypeIcon className="w-3 h-3"/> {config.label}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        disabled={isArchiving}
                        onClick={handleArchiveClick}
                        className="p-2 border border-tech-border text-gray-500 hover:text-white hover:border-white transition-all z-10 relative">
                        <Archive className="w-4 h-4"/>
                    </button>
                </div>

                <div>
                    <p className="text-[12px] text-green-700 leading-relaxed font-mono italic line-clamp-2"> &gt; AI VERDICT:</p>
                    <p className="text-[12px] text-gray-400 leading-relaxed font-mono mb-4 italic line-clamp-2">
                        {resource.aiVerdict || "Analyzing content structure..."}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {resource.tags?.slice(0, 3).map(tag => (
                        <span key={tag}
                              className="text-[9px] text-tech-text-muted border border-tech-border px-1.5 py-0.5 uppercase hover:border-tech-primary hover:text-tech-primary transition-colors cursor-default">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}