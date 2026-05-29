import { cn } from '@/lib/utils';

export type InboxTierKey = string | undefined | null;

export interface InboxAxisDisplay {
    label: string;
    emoji: string;
    badgeClass: string;
}

const pendingFallback: InboxAxisDisplay = {
    label: 'Analiza…',
    emoji: '⏳',
    badgeClass: 'border-tech-border bg-tech-surface text-tech-foreground-muted',
};

const substanceMap: Record<string, InboxAxisDisplay> = {
    deep: {
        label: 'Głębokie',
        emoji: '📚',
        badgeClass: 'border-emerald-500/35 bg-emerald-500/12 text-emerald-700 [data-theme=clean-dark]:text-emerald-300',
    },
    moderate: {
        label: 'Umiarkowane',
        emoji: '📄',
        badgeClass: 'border-sky-500/35 bg-sky-500/12 text-sky-700 [data-theme=clean-dark]:text-sky-300',
    },
    shallow: {
        label: 'Płytkie',
        emoji: '💨',
        badgeClass: 'border-orange-500/35 bg-orange-500/12 text-orange-700 [data-theme=clean-dark]:text-orange-300',
    },
    insufficient_data: {
        label: 'Brak danych',
        emoji: '❔',
        badgeClass: 'border-slate-400/35 bg-slate-500/10 text-slate-600 [data-theme=clean-dark]:text-slate-300',
    },
};

const intentMap: Record<string, InboxAxisDisplay> = {
    learn: {
        label: 'Nauka',
        emoji: '🎓',
        badgeClass: 'border-blue-500/35 bg-blue-500/12 text-blue-700 [data-theme=clean-dark]:text-blue-300',
    },
    entertain: {
        label: 'Rozrywka',
        emoji: '🎬',
        badgeClass: 'border-fuchsia-500/35 bg-fuchsia-500/12 text-fuchsia-700 [data-theme=clean-dark]:text-fuchsia-300',
    },
    inspire: {
        label: 'Inspiracja',
        emoji: '✨',
        badgeClass: 'border-violet-500/35 bg-violet-500/12 text-violet-700 [data-theme=clean-dark]:text-violet-300',
    },
    news: {
        label: 'Aktualności',
        emoji: '📰',
        badgeClass: 'border-cyan-500/35 bg-cyan-500/12 text-cyan-700 [data-theme=clean-dark]:text-cyan-300',
    },
    mixed: {
        label: 'Mieszane',
        emoji: '🔀',
        badgeClass: 'border-slate-400/35 bg-slate-500/10 text-slate-600 [data-theme=clean-dark]:text-slate-300',
    },
};

const relevanceMap: Record<string, InboxAxisDisplay> = {
    professional: {
        label: 'Profesjonalnie',
        emoji: '💼',
        badgeClass: 'border-indigo-500/35 bg-indigo-500/12 text-indigo-700 [data-theme=clean-dark]:text-indigo-300',
    },
    hobby: {
        label: 'Hobby',
        emoji: '🎯',
        badgeClass: 'border-rose-500/35 bg-rose-500/12 text-rose-700 [data-theme=clean-dark]:text-rose-300',
    },
    discovery: {
        label: 'Odkrycie',
        emoji: '🧭',
        badgeClass: 'border-teal-500/35 bg-teal-500/12 text-teal-700 [data-theme=clean-dark]:text-teal-300',
    },
    standard: {
        label: 'Ogólne',
        emoji: '📌',
        badgeClass: 'border-slate-400/35 bg-slate-500/10 text-slate-600 [data-theme=clean-dark]:text-slate-300',
    },
    none: {
        label: 'Słabe dopasowanie',
        emoji: '🚫',
        badgeClass: 'border-red-500/35 bg-red-500/12 text-red-700 [data-theme=clean-dark]:text-red-300',
    },
};

function resolve(map: Record<string, InboxAxisDisplay>, key: InboxTierKey): InboxAxisDisplay {
    if (!key) return pendingFallback;
    return map[key] ?? pendingFallback;
}

export function substanceAxis(key: InboxTierKey): InboxAxisDisplay {
    return resolve(substanceMap, key);
}

export function intentAxis(key: InboxTierKey): InboxAxisDisplay {
    return resolve(intentMap, key);
}

export function relevanceAxis(key: InboxTierKey): InboxAxisDisplay {
    return resolve(relevanceMap, key);
}

export function inboxAxisBadgeClass(axis: InboxAxisDisplay): string {
    return cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-none',
        axis.badgeClass
    );
}

export function hasInboxAxes(resource: {
    substanceDepth?: string;
    contentIntent?: string;
    relevance?: string;
}): boolean {
    return Boolean(resource.substanceDepth || resource.contentIntent || resource.relevance);
}
