
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { useSettings } from "@/hooks/use-settings"

function ThemeApplier() {
  const { settings } = useSettings();
  const { setTheme } = useTheme();

  React.useEffect(() => {
    // Apply theme settings to the body element
    setTheme(settings.appearanceMode);
    document.body.dataset.gradient = settings.baseGradient;
    document.body.dataset.motionLevel = settings.uiMotionLevel;
    
    document.body.classList.remove('font-serif', 'font-mono');
    if (settings.typographyMode === 'serif') {
      document.body.classList.add('font-serif');
    } else if (settings.typographyMode === 'monospace') {
      document.body.classList.add('font-mono');
    }
  }, [settings, setTheme]);

  return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeApplier />
      {children}
    </NextThemesProvider>
  )
}
