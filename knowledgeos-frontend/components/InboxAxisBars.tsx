import { InboxResource } from '@/lib/types';
import {
    intentAxis,
    inboxAxisBadgeClass,
    relevanceAxis,
    substanceAxis,
    type InboxAxisDisplay,
} from '@/lib/inboxTiers';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface InboxAxisBarsProps {
    resource: Pick<InboxResource, 'substanceDepth' | 'contentIntent' | 'relevance' | 'takeaway' | 'scoredFromMetadataOnly'>;
    compact?: boolean;
}

function AxisChip({
    title,
    axis,
    compact,
}: {
    title: string;
    axis: InboxAxisDisplay;
    compact?: boolean;
}) {
    return (
        <div
            className={cn(
                'inline-flex items-center gap-1.5 rounded-md border border-tech-border bg-tech-surface/80',
                compact ? 'px-2 py-1' : 'px-2.5 py-1.5'
            )}
        >
            <span className="text-[10px] uppercase tracking-wide text-tech-foreground-muted">{title}</span>
            <span className={inboxAxisBadgeClass(axis.tone)}>{axis.label}</span>
        </div>
    );
}

function AxisRow({
    title,
    axis,
}: {
    title: string;
    axis: InboxAxisDisplay;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-tech-foreground-muted">{title}</span>
            <span className={inboxAxisBadgeClass(axis.tone)}>{axis.label}</span>
        </div>
    );
}

export function InboxAxisBars({ resource, compact }: InboxAxisBarsProps) {
    const substance = substanceAxis(resource.substanceDepth);
    const intent = intentAxis(resource.contentIntent);
    const relevance = relevanceAxis(resource.relevance);

    return (
        <div className={compact ? 'space-y-2' : 'space-y-3'}>
            {resource.takeaway && (
                <Badge variant="secondary" className="rounded-md text-[11px] font-medium">
                    {resource.takeaway}
                </Badge>
            )}

            {compact ? (
                <div className="flex flex-wrap gap-1.5">
                    <AxisChip title="Głębia" axis={substance} compact />
                    <AxisChip title="Charakter" axis={intent} compact />
                    <AxisChip title="Dla Ciebie" axis={relevance} compact />
                </div>
            ) : (
                <div className="rounded-lg border border-tech-border bg-tech-surface/50 p-3 space-y-2.5">
                    <AxisRow title="Głębia treści" axis={substance} />
                    <AxisRow title="Charakter" axis={intent} />
                    <AxisRow title="Dopasowanie do Ciebie" axis={relevance} />
                </div>
            )}

            {resource.scoredFromMetadataOnly && (
                <p className="text-[11px] text-tech-foreground-muted">
                    Ocena na podstawie metadanych — brak fragmentu treści.
                </p>
            )}
        </div>
    );
}
