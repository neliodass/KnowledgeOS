'use client';

import { useEffect, useRef } from 'react';
import { VaultResource } from '@/lib/types';
import { isVaultProcessing } from '@/lib/vaultProcessing';

function hasPendingAnalysis(items: VaultResource[]): boolean {
    return items.some((item) => isVaultProcessing(item));
}

export function useVaultAutoRefresh(
    items: VaultResource[],
    refresh: (options?: { silent?: boolean }) => void | Promise<void>,
    intervalMs = 4000
) {
    const refreshRef = useRef(refresh);
    refreshRef.current = refresh;

    useEffect(() => {
        if (!hasPendingAnalysis(items)) return;

        const intervalId = window.setInterval(() => {
            void refreshRef.current({ silent: true });
        }, intervalMs);

        return () => window.clearInterval(intervalId);
    }, [items, intervalMs]);
}

