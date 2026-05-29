import { FileText, Hash, LucideIcon, Mic, PlayCircle } from 'lucide-react';

export interface ResourceTypeConfig {
    icon: LucideIcon;
    label: string;
    hasBigPreview: boolean;
    previewHeightClass: string;
}

export const RESOURCE_CONFIG: Record<string, ResourceTypeConfig> = {
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
    },
};

export function getResourceTypeConfig(resourceType: string): ResourceTypeConfig {
    return RESOURCE_CONFIG[resourceType] ?? RESOURCE_CONFIG.Default;
}

export function getFaviconUrl(url: string) {
    try {
        const domain = new URL(url).hostname;
        return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    } catch {
        return null;
    }
}
