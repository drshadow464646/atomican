
"use client";

import { useEffect, useState } from 'react';
import { SettingsProvider } from '@/hooks/use-settings';
import { ThemeProvider } from '@/components/theme-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <SettingsProvider>
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SettingsProvider>
    );
}
