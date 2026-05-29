import { useEffect, useRef } from 'react';
import { InboxResource } from '@/lib/types';
import { hasInboxAxes } from '@/lib/inboxTiers';

const EMPTY_LIST_GRACE_MS = 90_000;

function shouldPollInbox(items: InboxResource[], emptyGraceUntil: number | null): boolean {
    if (items.some((item) => !hasInboxAxes(item))) return true;
    if (items.length === 0 && emptyGraceUntil !== null && Date.now() < emptyGraceUntil) {
        return true;
    }
    return false;
}

export function useInboxAutoRefresh(
    items: InboxResource[],
    refresh: (options?: { silent?: boolean }) => void | Promise<void>,
    intervalMs = 4000
) {
    const refreshRef = useRef(refresh);
    refreshRef.current = refresh;

    const emptyGraceUntilRef = useRef<number | null>(Date.now() + EMPTY_LIST_GRACE_MS);

    useEffect(() => {
        if (items.length > 0) {
            emptyGraceUntilRef.current = null;
        }

        if (!shouldPollInbox(items, emptyGraceUntilRef.current)) return;

        const intervalId = window.setInterval(() => {
            void refreshRef.current({ silent: true });
        }, intervalMs);

        return () => window.clearInterval(intervalId);
    }, [items, intervalMs]);
}
