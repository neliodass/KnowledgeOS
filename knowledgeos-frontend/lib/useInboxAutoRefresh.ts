import { useEffect, useRef } from 'react';
import { InboxResource } from '@/lib/types';
import { hasInboxAxes } from '@/lib/inboxTiers';

function hasPendingAnalysis(items: InboxResource[]): boolean {
    return items.some(item => !hasInboxAxes(item));
}

export function useInboxAutoRefresh(
    items: InboxResource[],
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
