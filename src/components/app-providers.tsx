
"use client";

import { useEffect, useState } from 'react';
import { SettingsProvider } from '@/hooks/use-settings';
import { ThemeProvider } from '@/components/theme-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // We need to delay the rendering of the children until the component is mounted
    // to avoid hydration errors.
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
