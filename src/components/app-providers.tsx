
"use client";

import { useEffect, useState } from 'react';
import { SettingsProvider, useSettings } from '@/hooks/use-settings';
import { ThemeProvider } from '@/components/theme-provider';

function AppContent({ children }: { children: React.ReactNode }) {
    const { isSettingsLoaded } = useSettings();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Render null on the server and during the initial client render
    if (!isMounted || !isSettingsLoaded) {
        return null;
    }

    return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <SettingsProvider>
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
          >
            <AppContent>{children}</AppContent>
          </ThemeProvider>
        </SettingsProvider>
    );
}
