
'use client';

import { LabHeader } from '@/components/lab-header';
import { SettingsForm } from '@/components/settings-form';
import { ExperimentProvider, useExperiment } from '@/hooks/use-experiment';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { 
    safetyGogglesOn, 
    setSafetyGogglesOn, 
    handleResetExperiment, 
    heldItem,
    heldEquipment
  } = useExperiment();
  
  useEffect(() => {
    const isHolding = !!heldItem || !!heldEquipment;
    document.body.classList.toggle('cursor-copy', isHolding);
    
    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('cursor-copy');
    }
  }, [heldItem, heldEquipment]);

  return (
    <div className={cn("flex flex-col h-screen")}>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <LabHeader
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
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <ExperimentProvider>
      <LayoutContent>{children}</LayoutContent>
    </ExperimentProvider>
  );
}
