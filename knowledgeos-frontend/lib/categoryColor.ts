const COLORS = [
    { text: 'text-blue-400',   border: 'border-blue-700',   bg: 'bg-blue-900/10'   },
    { text: 'text-purple-400', border: 'border-purple-700', bg: 'bg-purple-900/10' },
    { text: 'text-pink-400',   border: 'border-pink-700',   bg: 'bg-pink-900/10'   },
    { text: 'text-orange-400', border: 'border-orange-700', bg: 'bg-orange-900/10' },
    { text: 'text-yellow-400', border: 'border-yellow-700', bg: 'bg-yellow-900/10' },
    { text: 'text-teal-400',   border: 'border-teal-700',   bg: 'bg-teal-900/10'   },
    { text: 'text-cyan-400',   border: 'border-cyan-700',   bg: 'bg-cyan-900/10'   },
    { text: 'text-rose-400',   border: 'border-rose-700',   bg: 'bg-rose-900/10'   },
];

export function getCategoryColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
}

