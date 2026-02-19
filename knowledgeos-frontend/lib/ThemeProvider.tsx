'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'cyber-green' | 'cyber-purple' | 'clean-light';

interface ThemeContextType {
    theme: Theme;
    setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'cyber-green',
    setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('cyber-green');

    useEffect(() => {
        const saved = (localStorage.getItem('theme') as Theme) || 'cyber-green';
        setThemeState(saved);
        document.documentElement.setAttribute('data-theme', saved);
    }, []);

    const setTheme = (t: Theme) => {
        setThemeState(t);
        localStorage.setItem('theme', t);
        document.documentElement.setAttribute('data-theme', t);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

