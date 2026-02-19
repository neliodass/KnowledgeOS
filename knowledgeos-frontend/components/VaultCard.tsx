import { VaultResource } from '@/lib/types';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import {getCategoryColor} from "@/lib/categoryColor";

interface VaultCardProps {
    resource: VaultResource;
    onClick?: () => void;
}

function getFaviconUrl(url: string) {
    try {
        const domain = new URL(url).hostname;
        return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    } catch {
        return null;
    }
}

export function VaultCard({ resource, onClick }: VaultCardProps) {
    const faviconUrl = getFaviconUrl(resource.url);
    return (
        <div onClick={onClick} className="relative border border-tech-border bg-tech-surface hover:border-tech-primary transition-all group flex flex-row cursor-pointer">

            <div className="absolute top-0 left-0 w-1 h-1 bg-tech-border group-hover:bg-tech-primary transition-colors"></div>
            <div className="absolute top-0 right-0 w-1 h-1 bg-tech-border group-hover:bg-tech-primary transition-colors"></div>
            <div className="absolute bottom-0 left-0 w-1 h-1 bg-tech-border group-hover:bg-tech-primary transition-colors"></div>
            <div className="absolute bottom-0 right-0 w-1 h-1 bg-tech-border group-hover:bg-tech-primary transition-colors"></div>

            {resource.imageUrl && (
                <div className="relative w-24 sm:w-32 flex-shrink-0 border-r border-tech-border bg-black overflow-hidden">
                    <Image
                        src={resource.imageUrl}
                        alt={resource.title}
                        fill
                        sizes="(max-width: 640px) 96px, 128px"
                        className="object-cover opacity-90 group-hover:opacity-100 transition-all"
                    />
                </div>
            )}

            <div className="p-5 flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex justify-between items-start mb-1">
                    {resource.categoryName ? (() => {
                        const c = getCategoryColor(resource.categoryName);
                        return (
                            <span className={`inline-block px-2 py-0.5 border ${c.border} ${c.bg} ${c.text} text-[10px] font-bold uppercase tracking-wider`}>
                                {resource.categoryName}
                            </span>
                        );
                    })() : (
                        <span className="inline-block px-2 py-0.5 border border-tech-border text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                            Uncategorized
                        </span>
                    )}
                </div>

                <h4 className="text-sm font-bold text-white uppercase truncate">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:text-tech-green flex items-center gap-2">
                        {faviconUrl && (
                            <img src={faviconUrl} alt="" width={14} height={14} className="flex-shrink-0" />
                        )}
                        {resource.title}
                    </a>
                </h4>

                {resource.aiSummary && (
                    <div className="text-[11px] text-gray-400 leading-relaxed font-mono italic border-l border-tech-border/30 pl-2 line-clamp-3">
                        <span className="text-tech-primary/50 mr-1">&gt; AI_SUMMARY:</span>
                        {resource.aiSummary}
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-dashed border-tech-border pt-3 mt-auto">
                    <div className="flex gap-2">
                        {resource.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] text-gray-500">#{tag}</span>
                        ))}
                    </div>
                    <a href={resource.url} target="_blank" onClick={(e) => e.stopPropagation()} className="text-tech-green opacity-50 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-bold uppercase transition-opacity cursor-pointer">
                        ACCESS <ArrowRight className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    );
}