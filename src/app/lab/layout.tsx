
'use client';

import { LabHeader } from '@/components/lab-header';
import { SettingsForm } from '@/components/settings-form';
import { ExperimentProvider, useExperiment } from '@/hooks/use-experiment';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { 
    experimentState,
    safetyGogglesOn, 
    setSafetyGogglesOn, 
    handleResetExperiment, 
    setExperimentTitle,
    heldItem,
    heldEquipment
  } = useExperiment();
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={cn("flex flex-col h-screen fade-in", (heldItem || heldEquipment) && "cursor-copy")}>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <LabHeader
        experimentTitle={experimentState.title}
        onTitleChange={setExperimentTitle}
        safetyGogglesOn={safetyGogglesOn}
        onGoggleToggle={setSafetyGogglesOn}
        onResetExperiment={handleResetExperiment}
      />
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

  return (
    <ExperimentProvider>
      <LayoutContent>{children}</LayoutContent>
    </ExperimentProvider>
  );
}
