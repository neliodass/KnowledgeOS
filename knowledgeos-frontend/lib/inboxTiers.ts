import { cn } from '@/lib/utils';

export type InboxTierKey = string | undefined | null;

export type InboxAxisTone = 'emphasis' | 'neutral' | 'soft' | 'caution';

export interface InboxAxisDisplay {
    label: string;
    tone: InboxAxisTone;
}

const substanceMap: Record<string, InboxAxisDisplay> = {
    deep: { label: 'Głębokie', tone: 'emphasis' },
    moderate: { label: 'Umiarkowane', tone: 'neutral' },
    shallow: { label: 'Płytkie', tone: 'caution' },
    insufficient_data: { label: 'Brak danych', tone: 'soft' },
};

const intentMap: Record<string, InboxAxisDisplay> = {
    learn: { label: 'Nauka', tone: 'neutral' },
    entertain: { label: 'Rozrywka', tone: 'neutral' },
    inspire: { label: 'Inspiracja', tone: 'neutral' },
    news: { label: 'Aktualności', tone: 'neutral' },
    mixed: { label: 'Mieszane', tone: 'soft' },
};

const relevanceMap: Record<string, InboxAxisDisplay> = {
    professional: { label: 'Profesjonalnie', tone: 'emphasis' },
    hobby: { label: 'Hobby', tone: 'emphasis' },
    discovery: { label: 'Odkrycie', tone: 'neutral' },
    standard: { label: 'Ogólne', tone: 'neutral' },
    none: { label: 'Słabe dopasowanie', tone: 'caution' },
};

const toneClassName: Record<InboxAxisTone, string> = {
    emphasis: 'border-tech-primary/35 bg-tech-primary-dim text-tech-primary',
    neutral: 'border-tech-border bg-tech-surface text-tech-foreground',
    soft: 'border-tech-border bg-tech-surface text-tech-foreground-muted',
    caution: 'border-amber-500/30 bg-amber-500/10 text-amber-600',
};

function resolve(map: Record<string, InboxAxisDisplay>, key: InboxTierKey, fallback: InboxAxisDisplay): InboxAxisDisplay {
    if (!key) return fallback;
    return map[key] ?? fallback;
}

export function substanceAxis(key: InboxTierKey): InboxAxisDisplay {
    return resolve(substanceMap, key, { label: 'Analiza…', tone: 'soft' });
}

export function intentAxis(key: InboxTierKey): InboxAxisDisplay {
    return resolve(intentMap, key, { label: 'Analiza…', tone: 'soft' });
}

export function relevanceAxis(key: InboxTierKey): InboxAxisDisplay {
    return resolve(relevanceMap, key, { label: 'Analiza…', tone: 'soft' });
}

export function inboxAxisBadgeClass(tone: InboxAxisTone): string {
    return cn('rounded-md border px-2 py-0.5 text-[11px] font-medium leading-none', toneClassName[tone]);
}

export function hasInboxAxes(resource: {
    substanceDepth?: string;
    contentIntent?: string;
    relevance?: string;
}): boolean {
    return Boolean(resource.substanceDepth || resource.contentIntent || resource.relevance);
}
