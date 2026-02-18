import {InboxResource} from '@/lib/types';
import {PlayCircle, Archive, FileText, Mic, Hash, LucideIcon} from 'lucide-react';
import Image from "next/image";
import {api} from "@/lib/api";
import {useState} from "react";

interface InboxCardProps {
    resource: InboxResource;
    onArchive: () => void;
}

// settings for different types of resource
interface ResourceTypeConfig {
    icon: LucideIcon;
    label: string;
    borderColor: string;
    hasBigPreview: boolean; // big image on top
    showCorners: boolean;
}

const RESOURCE_CONFIG: Record<string, ResourceTypeConfig> = {
    Video: {
        icon: PlayCircle,
        label: 'VIDEO_STREAM',
        borderColor: 'border-tech-green',
        hasBigPreview: true,
        showCorners: true,
    },
    Article: {
        icon: FileText,
        label: 'ARTICLE',
        borderColor: 'border-tech-border',
        hasBigPreview: false, // articles are smaller
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

export function InboxCard({resource,onArchive}: InboxCardProps) {
    const [isArchiving, setIsArchiving] = useState(false);
    // get config based on type, fallback to default
    const config = RESOURCE_CONFIG[resource.resourceType] || RESOURCE_CONFIG.Default;
    const TypeIcon = config.icon;
    const handleArchiveClick = async (e: React.MouseEvent) => {
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
            className={`border ${config.borderColor} bg-tech-surface relative group transition-all hover:border-tech-green/50`}>

            {/* decorative corners if needed */}
            {config.showCorners && (
                <>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tech-green"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-tech-green"></div>
                </>
            )}

            {/* big preview area for videos/images */}
            {config.hasBigPreview && (
                <div
                    className="relative w-full aspect-video border-b border-tech-border grayscale-50 group-hover:grayscale-0 transition-all cursor-pointer overflow-hidden bg-black/20">
                    {/* show image if we have one */}
                    {resource.imageUrl ? (
                        <Image
                            src={resource.imageUrl}
                            alt={resource.title}
                            fill
                            sizes="(max-width: 384px) 100vw, 33vw"
                            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                    ) : (
                        /* fallback icon if no image */
                        <div className="w-full h-full bg-black/50 flex items-center justify-center">
                            <TypeIcon className="w-16 h-16 text-tech-green opacity-80"/>
                        </div>
                    )}

                    {/* center play button for videos */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {resource.resourceType === 'Video' &&
                            <PlayCircle className="w-16 h-16 text-tech-green drop-shadow-lg"/>}
                    </div>

                    <div
                        className="absolute top-4 left-4 bg-black/80 border border-tech-green px-2 py-1 flex items-center gap-2 backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-tech-green animate-pulse"></div>
                        <span className="text-[10px] text-tech-green font-bold uppercase tracking-tighter">
                    {config.label}
                </span>
                    </div>
                </div>
            )}

            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white uppercase leading-tight mb-2 truncate pr-4">
                            <a href={resource.url} target="_blank" rel="noopener noreferrer"
                               className="hover:text-tech-primary transition-colors">
                                {resource.correctedTitle || resource.title}
                            </a>
                        </h4>

                        <div className="flex items-center gap-3">
                            {/* score color logic */}
                            <span className={`text-[11px] font-bold px-2 py-0.5 border ${
                                (resource.aiScore ?? 0) > 80 ? 'text-(--color-tech-primary) border-(--color-tech-primary) bg-(--color-tech-primary-dim)' :
                                    (resource.aiScore ?? 0) > 50 ? 'text-orange-400 border-orange-900/50 bg-orange-900/10' :
                                        'text-red-400 border-red-900/50 bg-red-900/10'
                            }`}>
                    SCORE: {resource.aiScore ?? 'N/A'}
                </span>

                            {/* show label here if there's no big image */}
                            {!config.hasBigPreview && (
                                <span className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                        <TypeIcon className="w-3 h-3"/> {config.label}
                    </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleArchiveClick}
                        className="p-2 border border-tech-border text-gray-500 hover:text-white hover:border-white transition-all">
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
                    {/* only show first 3 tags */}
                    {resource.tags?.slice(0, 3).map(tag => (
                        <span key={tag}
                              className="text-[9px] text-tech-text-muted border border-tech-border px-1.5 py-0.5 uppercase hover:border-tech-green hover:text-tech-green transition-colors cursor-default">
                    #{tag}
                </span>
                    ))}
                </div>
            </div>
        </div>
    );
}