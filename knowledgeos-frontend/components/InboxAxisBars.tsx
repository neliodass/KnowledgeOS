import { InboxResource } from '@/lib/types';
import { intentAxis, relevanceAxis, substanceAxis } from '@/lib/inboxTiers';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

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
                <span className="text-[11px] text-slate-500">{title}</span>
                <span className="text-[11px] text-slate-700 truncate">{axis.label}</span>
            </div>
            <Progress value={Math.max(axis.fillPercent, 4)} className="h-1.5 bg-slate-200" />
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
                <Badge variant="secondary" className="rounded-md text-[11px] font-medium">
                    {resource.takeaway}
                </Badge>
            )}
            <AxisRow title="Głębia" axis={substance} compact={compact} />
            <AxisRow title="Charakter" axis={intent} compact={compact} />
            <AxisRow title="Dla Ciebie" axis={relevance} compact={compact} />
            {resource.scoredFromMetadataOnly && (
                <p className="text-[11px] text-slate-500">Ocena na podstawie metadanych — brak fragmentu treści.</p>
            )}
        </div>
    );
}
