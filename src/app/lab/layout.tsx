
'use client';

import { LabHeader } from '@/components/lab-header';
import { SettingsForm } from '@/components/settings-form';
import { ExperimentProvider, useExperiment } from '@/hooks/use-experiment';
import { cn } from '@/lib/utils';

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
  return (
    <ExperimentProvider>
      <LayoutContent>
        {children}
      </LayoutContent>
    </ExperimentProvider>
  );
}
