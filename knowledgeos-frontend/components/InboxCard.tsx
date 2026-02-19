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
            className={`border ${config.borderColor} bg-tech-surface relative group transition-all hover:border-tech-primary/50 cursor-pointer flex flex-row min-h-[100px]`}>

            {resource.imageUrl && config.hasBigPreview && (
                <div className="relative w-32 sm:w-48 flex-shrink-0 border-r border-tech-border bg-black flex items-center justify-center overflow-hidden">
                    <Image
                        src={resource.imageUrl}
                        alt={resource.title}
                        fill
                        sizes="(max-width: 640px) 128px, 192px"
                        className="object-contain opacity-90 group-hover:opacity-100 transition-all grayscale-[30%] group-hover:grayscale-0"
                    />

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10 group-hover:bg-transparent transition-colors">
                        {resource.resourceType === 'Video' &&
                            <PlayCircle className="w-10 h-10 text-tech-primary/80 drop-shadow-2xl"/>}
                    </div>
                </div>
            )}

            <div className="p-4 flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white uppercase leading-tight break-words">
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
                    </div>

                    <button
                        disabled={isArchiving}
                        onClick={handleArchiveClick}
                        className="p-1.5 border border-tech-border text-gray-500 hover:text-white hover:border-white transition-all z-10 relative flex-shrink-0">
                        <Archive className="w-4 h-4"/>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 border ${
                        (resource.aiScore ?? 0) > 74 ? 'text-tech-primary border-tech-primary bg-tech-primary-dim' :
                            (resource.aiScore ?? 0) > 49 ? 'text-orange-400 border-orange-900/50 bg-orange-900/10' :
                                (resource.aiScore ?? 0) > 19 ? 'text-yellow-400 border-yellow-900/50 bg-yellow-900/10' :
                                    'text-red-400 border-red-900/50 bg-red-900/10'
                    }`}>
                        SCORE: {resource.aiScore ?? 'N/A'}
                    </span>
                    <span className="text-[9px] text-gray-500 uppercase flex items-center gap-1 font-bold tracking-tighter">
                        <TypeIcon className="w-3 h-3"/> {config.label}
                    </span>
                </div>

                <div className="text-[11px] text-gray-400 leading-relaxed font-mono italic border-l border-tech-border/30 pl-2">
                    <span className="text-tech-primary/50 mr-1">&gt; AI_VERDICT:</span>
                    {resource.aiVerdict || "Analyzing..."}
                </div>

                <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                    {resource.tags?.slice(0, 3).map(tag => (
                        <span key={tag}
                              className="text-[8px] text-tech-text-muted border border-tech-border px-1 py-0.5 uppercase">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}