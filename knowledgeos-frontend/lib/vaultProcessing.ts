import { VaultResource } from '@/lib/types';

const PROCESSING_STATUSES = new Set(['New', 'Processing', 'AiAnalysing']);

export function isVaultProcessing(resource: Pick<VaultResource, 'status' | 'aiSummary'>): boolean {
    if (PROCESSING_STATUSES.has(resource.status)) return true;
    if (!resource.aiSummary) return true;
    return false;
}

