
"use client";

import { useEffect, useState } from 'react';
import { SettingsProvider, useSettings } from '@/hooks/use-settings';
import { ThemeProvider } from '@/components/theme-provider';

function AppContent({ children }: { children: React.ReactNode }) {
    const { isSettingsLoaded } = useSettings();

    if (!isSettingsLoaded) {
        return null; // or a loading spinner
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
