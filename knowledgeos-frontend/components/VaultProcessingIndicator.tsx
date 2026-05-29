'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VaultProcessingIndicatorProps {
    compact?: boolean;
    className?: string;
}

export function VaultProcessingIndicator({ compact, className }: VaultProcessingIndicatorProps) {
    return (
        <div
            className={cn(
                'rounded-lg border border-dashed border-tech-primary/35 bg-tech-primary-dim/60',
                compact ? 'p-3' : 'p-4',
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
                            Zasób pojawi się tutaj automatycznie po zakończeniu analizy.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

