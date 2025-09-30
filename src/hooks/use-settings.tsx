
"use client"

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

type Settings = {
  displayName: string;
  appearanceMode: 'light' | 'dark' | 'system';
  baseGradient: 'moon' | 'sunset' | 'dawn' | 'none';
  uiMotionLevel: 'low' | 'medium' | 'high';
  typographyMode: 'default' | 'serif' | 'monospace';
};

export const defaultSettings: Settings = {
  displayName: 'Atomican',
  appearanceMode: 'system',
  baseGradient: 'moon',
  uiMotionLevel: 'medium',
  typographyMode: 'default',
};

type SettingsContextType = {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  isSettingsLoaded: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  useEffect(() => {
    try {
        const savedSettings = localStorage.getItem('labSettings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
    } finally {
        setIsSettingsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isSettingsLoaded) {
      localStorage.setItem('labSettings', JSON.stringify(settings));
    }
  }, [settings, isSettingsLoaded]);

  const value = useMemo(() => ({
    settings,
    setSettings,
    isSettingsLoaded
  }), [settings, isSettingsLoaded]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
