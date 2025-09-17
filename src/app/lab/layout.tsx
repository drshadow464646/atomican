
'use client';

import { LabHeader } from '@/components/lab-header';
import { SettingsForm } from '@/components/settings-form';
import { ExperimentProvider, useExperiment } from '@/hooks/use-experiment';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { safetyGogglesOn, setSafetyGogglesOn, handleResetExperiment, heldItem } = useExperiment();

  return (
    <div className={cn("flex flex-col h-screen", heldItem && "cursor-copy")}>
      <LabHeader
        safetyGogglesOn={safetyGogglesOn}
        onGoggleToggle={setSafetyGogglesOn}
        onResetExperiment={handleResetExperiment}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <div className="hidden">
        <SettingsForm />
      </div>
    </div>
  );
}


export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <ExperimentProvider>
      {isClient ? <LayoutContent>{children}</LayoutContent> : null}
    </ExperimentProvider>
  );
}
