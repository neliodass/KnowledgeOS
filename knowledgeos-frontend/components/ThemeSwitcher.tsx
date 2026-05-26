'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/ThemeProvider';
import { Button } from '@/components/ui/button';

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const isDark = theme === 'clean-dark';

    const toggleTheme = () => {
        setTheme(isDark ? 'clean-light' : 'clean-dark');
    };

    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            title={isDark ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
            aria-label={isDark ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
            className="h-9 w-9 border-tech-border bg-tech-surface text-tech-foreground-muted hover:text-tech-primary hover:border-tech-primary/40"
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    );
}
