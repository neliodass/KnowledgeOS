import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InboxProcessingIndicatorProps {
    compact?: boolean;
    className?: string;
}

function SkeletonBars({ compact }: { compact?: boolean }) {
    const labels = ['Głębia', 'Charakter', 'Dla Ciebie'];

    return (
        <div className={cn('space-y-2', compact && 'space-y-1.5')}>
            {labels.map(label => (
                <div key={label} className={compact ? 'space-y-0.5' : 'space-y-1'}>
                    <div className="flex justify-between gap-2">
                        <span className="text-[11px] text-tech-foreground-muted">{label}</span>
                        <span className="text-[11px] text-tech-foreground-muted/60 animate-pulse">…</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-tech-border">
                        <div className="h-full w-1/3 rounded-full bg-tech-primary/40 animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function InboxProcessingIndicator({ compact, className }: InboxProcessingIndicatorProps) {
    return (
        <div
            className={cn(
                'rounded-lg border border-dashed border-tech-primary/35 bg-tech-primary-dim/60',
                compact ? 'p-3 space-y-2' : 'p-4 space-y-3',
                className
            )}
            role="status"
            aria-live="polite"
            aria-label="Analiza AI w toku"
        >
            <div className="flex items-center gap-2">
                <div className="relative flex-shrink-0">
                    <Loader2 className={cn('animate-spin text-tech-primary', compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
                    {!compact && (
                        <Sparkles className="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 text-tech-foreground-muted animate-pulse" />
                    )}
                </div>
                <div className="min-w-0">
                    <p className={cn('font-medium text-tech-foreground', compact ? 'text-xs' : 'text-sm')}>
                        Analiza AI w toku
                    </p>
                    {!compact && (
                        <p className="text-xs text-tech-foreground-muted mt-0.5">
                            Pobieram metadane i oceniam treść — strona odświeży się automatycznie.
                        </p>
                    )}
                </div>
            </div>
            <SkeletonBars compact={compact} />
        </div>
    );
}
