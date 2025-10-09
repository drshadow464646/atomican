
'use client';

import { LabHeader } from '@/components/lab-header';
import { SettingsForm } from '@/components/settings-form';
import { ExperimentProvider, useExperiment } from '@/hooks/use-experiment';

// This is a new, lightweight provider for inventory and basic actions
// that are needed across all lab pages.
import { InventoryProvider, useInventory } from '@/hooks/use-inventory';
import { useEffect } from 'react';

function LayoutContent({ children }: { children: React.ReactNode }) {
  // Now using the lightweight inventory context
  const { 
    safetyGogglesOn, 
    setSafetyGogglesOn, 
    handleResetExperiment, 
    heldItem,
    heldEquipment
  } = useInventory();
  
  useEffect(() => {
    const isHolding = !!heldItem; // Simplified, as heldEquipment is only on workbench
    document.body.classList.toggle('cursor-copy', isHolding);
    
    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('cursor-copy');
    }
  }, [heldItem]);

  return (
    <div className="h-screen flex flex-col pb-[env(safe-area-inset-bottom)]">
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
  return (
    // We now wrap the layout with the new, lightweight InventoryProvider
    <InventoryProvider>
      <LayoutContent>{children}</LayoutContent>
    </InventoryProvider>
  );
}
