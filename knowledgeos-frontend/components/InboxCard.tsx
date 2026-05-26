import { InboxResource } from '@/lib/types';
import { PlayCircle, Archive, FileText, Mic, Hash, LucideIcon } from 'lucide-react';
import Image from "next/image";
import { api } from "@/lib/api";
import { useState } from "react";
import Link from "next/link";
import { InboxAxisBars } from '@/components/InboxAxisBars';
import { hasInboxAxes } from '@/lib/inboxTiers';

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
    previewWidth: string;
    showCorners: boolean;
}

const RESOURCE_CONFIG: Record<string, ResourceTypeConfig> = {
    Video: {
        icon: PlayCircle,
        label: 'Wideo',
        borderColor: 'border-tech-primary',
        hasBigPreview: true,
        previewWidth: 'w-32 sm:w-48',
        showCorners: true,
    },
    Article: {
        icon: FileText,
        label: 'Artykuł',
        borderColor: 'border-tech-primary',
        hasBigPreview: true,
        previewWidth: 'w-24 sm:w-32',
        showCorners: false,
    },
    Podcast: {
        icon: Mic,
        label: 'Podcast',
        borderColor: 'border-purple-500',
        hasBigPreview: true,
        previewWidth: 'w-32 sm:w-48',
        showCorners: false,
    },
    Default: {
        icon: Hash,
        label: 'Link',
        borderColor: 'border-tech-border',
        hasBigPreview: false,
        previewWidth: 'w-32',
        showCorners: false,
    }
};

function getFaviconUrl(url: string) {
    try {
        const domain = new URL(url).hostname;
        return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    } catch {
        return null;
    }
}

export function InboxCard({ resource, onArchive, onClick }: InboxCardProps) {
    const [isArchiving, setIsArchiving] = useState(false);

    const config = RESOURCE_CONFIG[resource.resourceType] || RESOURCE_CONFIG.Default;
    const TypeIcon = config.icon;
    const faviconUrl = getFaviconUrl(resource.url);
    const showAxes = hasInboxAxes(resource);

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
                <div className={`relative ${config.previewWidth} flex-shrink-0 border-r border-tech-border bg-black flex items-center justify-center overflow-hidden`}>
                    <Image
                        src={resource.imageUrl}
                        alt={resource.title}
                        fill
                        sizes="(max-width: 640px) 96px, 192px"
                        className={`opacity-90 group-hover:opacity-100 transition-all ${resource.resourceType === 'Article' ? 'object-cover' : 'object-contain'}`}
                    />
                    {resource.resourceType === 'Video' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10 group-hover:bg-transparent transition-colors">
                            <PlayCircle className="w-10 h-10 text-tech-primary/80 drop-shadow-2xl"/>
                        </div>
                    )}
                </div>
            )}

            <div className="p-4 flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white leading-tight break-words">
                            <Link
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-tech-primary transition-colors z-10 relative flex items-center gap-2"
                            >
                                {faviconUrl && (
                                    <img src={faviconUrl} alt="" width={14} height={14} className="flex-shrink-0" />
                                )}
                                {resource.correctedTitle || resource.title}
                            </Link>
                        </h4>
                    </div>

                    <button
                        disabled={isArchiving}
                        onClick={handleArchiveClick}
                        title="Archiwizuj"
                        className="p-1.5 border border-tech-border text-gray-500 hover:text-white hover:border-white transition-all z-10 relative flex-shrink-0">
                        <Archive className="w-4 h-4"/>
                    </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <TypeIcon className="w-3 h-3 text-tech-primary/70"/>
                    <span>{config.label}</span>
                    {resource.siteName && (
                        <span className="text-gray-600 ml-auto truncate">{resource.siteName}</span>
                    )}
                </div>

                {showAxes ? (
                    <InboxAxisBars resource={resource} compact />
                ) : (
                    <p className="text-xs text-gray-500 italic">Analiza w toku…</p>
                )}

                {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                        {resource.tags.slice(0, 3).map(tag => (
                            <span key={tag}
                                  className="text-[9px] text-tech-text-muted border border-tech-border/80 px-1.5 py-0.5 rounded-sm">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
