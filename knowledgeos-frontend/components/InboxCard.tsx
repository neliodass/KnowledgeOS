import { InboxResource } from '@/lib/types';
import { PlayCircle, Archive, FileText, Mic, Hash, LucideIcon, ExternalLink } from 'lucide-react';
import Image from "next/image";
import { api } from "@/lib/api";
import { useState } from "react";
import Link from "next/link";
import { InboxAxisBars } from '@/components/InboxAxisBars';
import { hasInboxAxes } from '@/lib/inboxTiers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface InboxCardProps {
    resource: InboxResource;
    onArchive: () => void;
    onClick: () => void;
}

interface ResourceTypeConfig {
    icon: LucideIcon;
    label: string;
    hasBigPreview: boolean;
    previewHeightClass: string;
}

const RESOURCE_CONFIG: Record<string, ResourceTypeConfig> = {
    Video: {
        icon: PlayCircle,
        label: 'Wideo',
        hasBigPreview: true,
        previewHeightClass: 'h-40',
    },
    Article: {
        icon: FileText,
        label: 'Artykuł',
        hasBigPreview: true,
        previewHeightClass: 'h-40',
    },
    Podcast: {
        icon: Mic,
        label: 'Podcast',
        hasBigPreview: true,
        previewHeightClass: 'h-40',
    },
    Default: {
        icon: Hash,
        label: 'Link',
        hasBigPreview: false,
        previewHeightClass: 'h-40',
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
        <Card
            onClick={onClick}
            className="group cursor-pointer overflow-hidden border-slate-200 transition-all hover:shadow-md"
        >
            {resource.imageUrl && config.hasBigPreview && (
                <div className={`relative ${config.previewHeightClass} w-full bg-slate-100 overflow-hidden`}>
                    <Image
                        src={resource.imageUrl}
                        alt={resource.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className={`transition-transform group-hover:scale-[1.02] ${resource.resourceType === 'Article' ? 'object-cover' : 'object-cover'}`}
                    />
                    {resource.resourceType === 'Video' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                            <PlayCircle className="w-10 h-10 text-white drop-shadow-lg" />
                        </div>
                    )}
                </div>
            )}

            <div className="p-4 space-y-3">
                <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                        <Link
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors flex items-start gap-2"
                        >
                            {faviconUrl && (
                                <img src={faviconUrl} alt="" width={14} height={14} className="mt-0.5 flex-shrink-0" />
                            )}
                            <span className="line-clamp-2">{resource.correctedTitle || resource.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 mt-0.5 opacity-60" />
                        </Link>
                    </div>

                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        disabled={isArchiving}
                        onClick={handleArchiveClick}
                        title="Archiwizuj"
                        className="h-8 w-8"
                    >
                        <Archive className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-slate-600">
                        <TypeIcon className="w-3 h-3 mr-1.5" />
                        {config.label}
                    </Badge>
                    {resource.siteName && (
                        <span className="text-xs text-slate-500 truncate">{resource.siteName}</span>
                    )}
                </div>

                {showAxes ? (
                    <InboxAxisBars resource={resource} compact />
                ) : (
                    <p className="text-xs text-slate-500 italic">Analiza w toku…</p>
                )}

                {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {resource.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="rounded-md">
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}
