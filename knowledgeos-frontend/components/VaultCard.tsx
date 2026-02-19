import { VaultResource } from '@/lib/types';
import { ArrowRight, Timer } from 'lucide-react';

interface VaultCardProps {
    resource: VaultResource;
}

function getFaviconUrl(url: string) {
    try {
        const domain = new URL(url).hostname;
        return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    } catch {
        return null;
    }
}

export function VaultCard({ resource }: VaultCardProps) {
    const faviconUrl = getFaviconUrl(resource.url);
    return (
        <div className="relative border border-tech-border bg-tech-surface p-5 hover:border-tech-green transition-all group">

            {/* small corners that light up on hover */}
            <div className="absolute top-0 left-0 w-1 h-1 bg-tech-border group-hover:bg-tech-green transition-colors"></div>
            <div className="absolute top-0 right-0 w-1 h-1 bg-tech-border group-hover:bg-tech-green transition-colors"></div>
            <div className="absolute bottom-0 left-0 w-1 h-1 bg-tech-border group-hover:bg-tech-green transition-colors"></div>
            <div className="absolute bottom-0 right-0 w-1 h-1 bg-tech-border group-hover:bg-tech-green transition-colors"></div>

            <div className="flex justify-between items-start mb-4">
                {resource.categoryName ? (
                    <span className="inline-block px-2 py-0.5 border border-blue-900 bg-blue-900/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                        {resource.categoryName}
                    </span>
                ) : (
                    <span className="inline-block px-2 py-0.5 border border-tech-border text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                        Uncategorized
                    </span>
                )}

                {/* temporary logic for vault status */}
                <div className="flex items-center gap-1 text-orange-400 border border-orange-900/50 bg-orange-900/10 px-2 py-0.5">
                    <Timer className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase">Vault Item</span>
                </div>
            </div>

            <h4 className="text-sm font-bold text-white uppercase mb-4 truncate">
                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:text-tech-green flex items-center gap-2">
                    {faviconUrl && (
                        <img src={faviconUrl} alt="" width={14} height={14} className="flex-shrink-0" />
                    )}
                    {resource.title}
                </a>
            </h4>

            <div className="flex items-center justify-between border-t border-dashed border-tech-border pt-3">
                <div className="flex gap-2">
                    {resource.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] text-gray-500">#{tag}</span>
                    ))}
                </div>

                <a href={resource.url} target="_blank" className="text-tech-green opacity-50 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-bold uppercase transition-opacity cursor-pointer">
                    ACCESS <ArrowRight className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
}