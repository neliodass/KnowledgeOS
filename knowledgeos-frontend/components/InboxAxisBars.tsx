import { InboxResource } from '@/lib/types';
import { intentAxis, relevanceAxis, substanceAxis } from '@/lib/inboxTiers';

interface InboxAxisBarsProps {
    resource: Pick<InboxResource, 'substanceDepth' | 'contentIntent' | 'relevance' | 'takeaway' | 'scoredFromMetadataOnly'>;
    compact?: boolean;
}

function AxisRow({
    title,
    axis,
    compact,
}: {
    title: string;
    axis: { label: string; fillPercent: number };
    compact?: boolean;
}) {
    return (
        <div className={compact ? 'space-y-0.5' : 'space-y-1'}>
            <div className="flex justify-between items-baseline gap-2">
                <span className="text-[10px] text-gray-500">{title}</span>
                <span className="text-[10px] text-gray-300 truncate">{axis.label}</span>
            </div>
            <div className="h-1 bg-tech-border/60 rounded-full overflow-hidden">
                <div
                    className="h-full bg-tech-primary/80 rounded-full transition-all"
                    style={{ width: `${Math.max(axis.fillPercent, 4)}%` }}
                />
            </div>
        </div>
    );
}

export function InboxAxisBars({ resource, compact }: InboxAxisBarsProps) {
    const substance = substanceAxis(resource.substanceDepth);
    const intent = intentAxis(resource.contentIntent);
    const relevance = relevanceAxis(resource.relevance);

    return (
        <div className={compact ? 'space-y-2' : 'space-y-2.5'}>
            {resource.takeaway && (
                <p className="text-xs text-gray-300 leading-snug">{resource.takeaway}</p>
            )}
            <AxisRow title="Głębia" axis={substance} compact={compact} />
            <AxisRow title="Charakter" axis={intent} compact={compact} />
            <AxisRow title="Dla Ciebie" axis={relevance} compact={compact} />
            {resource.scoredFromMetadataOnly && (
                <p className="text-[10px] text-gray-600">Ocena na podstawie metadanych — brak fragmentu treści.</p>
            )}
        </div>
    );
}
