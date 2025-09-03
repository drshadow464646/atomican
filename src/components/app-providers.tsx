
"use client";

import { SettingsProvider } from '@/hooks/use-settings';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeApplier } from './theme-applier';

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <SettingsProvider>
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
          >
            <ThemeApplier />
            {children}
          </ThemeProvider>
        </SettingsProvider>
    );
}
