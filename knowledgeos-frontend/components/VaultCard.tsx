import { VaultResource } from '@/lib/types';
import { ExternalLink, FolderOpen, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { categoryBadgeClass } from '@/lib/categoryColor';
import { getFaviconUrl, getResourceTypeConfig } from '@/lib/resourceCardUtils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VaultCardProps {
    resource: VaultResource;
    onClick?: () => void;
}

export function VaultCard({ resource, onClick }: VaultCardProps) {
    const config = getResourceTypeConfig(resource.resourceType);
    const TypeIcon = config.icon;
    const faviconUrl = getFaviconUrl(resource.url);

    return (
        <Card
            onClick={onClick}
            className="group cursor-pointer overflow-hidden border-tech-border transition-all hover:shadow-md"
        >
            {resource.imageUrl && config.hasBigPreview && (
                <div className={`relative ${config.previewHeightClass} w-full bg-tech-surface-hover overflow-hidden`}>
                    <Image
                        src={resource.imageUrl}
                        alt={resource.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform group-hover:scale-[1.02]"
                    />
                    {resource.resourceType === 'Video' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                            <PlayCircle className="w-10 h-10 text-white drop-shadow-lg" />
                        </div>
                    )}
                </div>
            )}

            <div className="p-4 space-y-3">
                <div className="min-w-0">
                    <Link
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm font-semibold text-tech-foreground hover:text-tech-primary transition-colors flex items-start gap-2"
                    >
                        {faviconUrl && (
                            <img src={faviconUrl} alt="" width={14} height={14} className="mt-0.5 flex-shrink-0" />
                        )}
                        <span className="line-clamp-2">{resource.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 mt-0.5 opacity-60 flex-shrink-0" />
                    </Link>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-tech-foreground-muted">
                        <TypeIcon className="w-3 h-3 mr-1.5" />
                        {config.label}
                    </Badge>
                    {resource.siteName && (
                        <span className="text-xs text-tech-foreground-muted truncate">{resource.siteName}</span>
                    )}
                </div>

                {resource.categoryName ? (
                    <span className={categoryBadgeClass(resource.categoryName)}>
                        <FolderOpen className="w-3 h-3" aria-hidden />
                        {resource.categoryName}
                    </span>
                ) : (
                    <Badge variant="secondary" className="rounded-md text-[11px] font-medium">
                        Bez kategorii
                    </Badge>
                )}

                {resource.aiSummary && (
                    <p className="text-xs text-tech-foreground-muted leading-relaxed line-clamp-2 border-l-2 border-tech-border pl-2">
                        {resource.aiSummary}
                    </p>
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
