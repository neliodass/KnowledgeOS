export type InboxTierKey = string | undefined | null;

export interface InboxAxisDisplay {
    label: string;
    fillPercent: number;
}

const substanceMap: Record<string, InboxAxisDisplay> = {
    deep: { label: 'Głębokie', fillPercent: 100 },
    moderate: { label: 'Umiarkowane', fillPercent: 66 },
    shallow: { label: 'Płytkie', fillPercent: 33 },
    insufficient_data: { label: 'Brak danych', fillPercent: 8 },
};

const intentMap: Record<string, InboxAxisDisplay> = {
    learn: { label: 'Nauka', fillPercent: 85 },
    entertain: { label: 'Rozrywka', fillPercent: 70 },
    inspire: { label: 'Inspiracja', fillPercent: 75 },
    news: { label: 'Aktualności', fillPercent: 55 },
    mixed: { label: 'Mieszane', fillPercent: 45 },
};

const relevanceMap: Record<string, InboxAxisDisplay> = {
    professional: { label: 'Profesjonalnie', fillPercent: 100 },
    hobby: { label: 'Hobby', fillPercent: 88 },
    discovery: { label: 'Odkrycie', fillPercent: 72 },
    standard: { label: 'Ogólne', fillPercent: 50 },
    none: { label: 'Słabe dopasowanie', fillPercent: 12 },
};

function resolve(map: Record<string, InboxAxisDisplay>, key: InboxTierKey, fallback: InboxAxisDisplay): InboxAxisDisplay {
    if (!key) return fallback;
    return map[key] ?? fallback;
}

export function substanceAxis(key: InboxTierKey): InboxAxisDisplay {
    return resolve(substanceMap, key, { label: 'Analiza…', fillPercent: 0 });
}

export function intentAxis(key: InboxTierKey): InboxAxisDisplay {
    return resolve(intentMap, key, { label: 'Analiza…', fillPercent: 0 });
}

export function relevanceAxis(key: InboxTierKey): InboxAxisDisplay {
    return resolve(relevanceMap, key, { label: 'Analiza…', fillPercent: 0 });
}

export function hasInboxAxes(resource: {
    substanceDepth?: string;
    contentIntent?: string;
    relevance?: string;
}): boolean {
    return Boolean(resource.substanceDepth || resource.contentIntent || resource.relevance);
}
