
"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useSettings } from "@/hooks/use-settings"

export function ThemeApplier() {
  const { settings, isSettingsLoaded } = useSettings();
  const { setTheme } = useTheme();

  React.useEffect(() => {
    if (isSettingsLoaded) {
      setTheme(settings.appearanceMode);
      document.body.dataset.gradient = settings.baseGradient;
      document.body.dataset.motionLevel = settings.uiMotionLevel;
      
      document.body.classList.remove('font-serif', 'font-mono');
      if (settings.typographyMode === 'serif') {
        document.body.classList.add('font-serif');
      } else if (settings.typographyMode === 'monospace') {
        document.body.classList.add('font-mono');
      }
    }
  }, [settings, isSettingsLoaded, setTheme]);

  return null;
}
