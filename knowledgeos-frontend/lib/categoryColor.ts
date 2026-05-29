const COLORS = [
    {
        text: 'text-blue-700 [data-theme=clean-dark]:text-blue-300',
        border: 'border-blue-500/35',
        bg: 'bg-blue-500/12',
    },
    {
        text: 'text-violet-700 [data-theme=clean-dark]:text-violet-300',
        border: 'border-violet-500/35',
        bg: 'bg-violet-500/12',
    },
    {
        text: 'text-rose-700 [data-theme=clean-dark]:text-rose-300',
        border: 'border-rose-500/35',
        bg: 'bg-rose-500/12',
    },
    {
        text: 'text-orange-700 [data-theme=clean-dark]:text-orange-300',
        border: 'border-orange-500/35',
        bg: 'bg-orange-500/12',
    },
    {
        text: 'text-amber-700 [data-theme=clean-dark]:text-amber-300',
        border: 'border-amber-500/35',
        bg: 'bg-amber-500/12',
    },
    {
        text: 'text-teal-700 [data-theme=clean-dark]:text-teal-300',
        border: 'border-teal-500/35',
        bg: 'bg-teal-500/12',
    },
    {
        text: 'text-cyan-700 [data-theme=clean-dark]:text-cyan-300',
        border: 'border-cyan-500/35',
        bg: 'bg-cyan-500/12',
    },
    {
        text: 'text-emerald-700 [data-theme=clean-dark]:text-emerald-300',
        border: 'border-emerald-500/35',
        bg: 'bg-emerald-500/12',
    },
];

export function getCategoryColor(categoryId: string) {
    if (!categoryId) {
        return {
            text: 'text-slate-700 [data-theme=clean-dark]:text-slate-300',
            border: 'border-slate-500/35',
            bg: 'bg-slate-500/12',
        };
    }

    let hash = 0;
    for (let i = 0; i < categoryId.length; i++) {
        hash = categoryId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
}

export function categoryBadgeClass(categoryId?: string, _label?: string): string {
    const c = getCategoryColor(categoryId || '');
    return `inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-none ${c.border} ${c.bg} ${c.text}`;
}
