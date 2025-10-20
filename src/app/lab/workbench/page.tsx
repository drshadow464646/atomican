
'use client';

import { useEffect, useState } from 'react';
import { InventoryPanel } from '@/components/inventory-panel';
import { Workbench } from '@/components/workbench';
import { EquipmentDetailsPanel } from '@/components/equipment-details-panel';
import { cn } from '@/lib/utils';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ExperimentProvider, useExperiment } from '@/hooks/use-experiment';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer } from "vaul";
import { Package, ChevronUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsClient } from '@/hooks/use-is-client';

// The actual page content is now in its own component
function WorkbenchPageContent() {
  const { 
    experimentState,
    inventory,
    heldEquipment,
    pouringState,
    setPouringState,
    attachmentState,
    setAttachmentState,
    handleClearHeldItem,
    handleRemoveSelectedEquipment,
  } = useExperiment();
  
  const isMobile = useIsMobile();
  const isClient = useIsClient();
  const [isInventoryPanelVisible, setIsInventoryPanelVisible] = useState(true);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inventory.heldItem || heldEquipment) {
            handleClearHeldItem();
        }
        if (pouringState) {
            setPouringState(null);
        }
        if (attachmentState) {
            setAttachmentState(null);
        }
      }
      const selectedIds = experimentState.equipment.filter(eq => eq.isSelected).map(eq => eq.id);
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        selectedIds.forEach(id => handleRemoveSelectedEquipment(id));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
      inventory.heldItem, heldEquipment, pouringState, attachmentState, 
      handleClearHeldItem, setPouringState, setAttachmentState,
      experimentState.equipment, handleRemoveSelectedEquipment
  ]);

  const selectedEquipment = experimentState.equipment.find(e => e.isSelected);
  const selectedCount = experimentState.equipment.filter(e => e.isSelected).length;
  const isHoldingSomething = !!inventory.heldItem || !!heldEquipment;
  
  const workbenchContent = <Workbench />;
  
  const inventoryContent = (
      <InventoryPanel
        isCollapsed={isMobile ? false : !isInventoryPanelVisible}
      />
  );
  
  if (!isClient) {
    return (
        <div className="flex h-full bg-transparent text-foreground">
            <Skeleton className="w-[25%] h-full" />
            <div className="w-px bg-border" />
            <Skeleton className="w-[75%] h-full" />
        </div>
    );
  }

  if (isMobile) {
    return (
        <Drawer.Root shouldScaleBackground>
          <div className="h-full flex flex-col relative">
            <div className="flex-1 min-h-0">
              {workbenchContent}
            </div>
            <Drawer.Trigger asChild>
              <button className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 p-2 mb-2 rounded-lg bg-background/80 backdrop-blur-sm border shadow-lg flex items-center justify-center gap-2">
                <Package className="h-5 w-5" />
                <span className="font-medium">Inventory</span>
                <ChevronUp className="h-4 w-4" />
              </button>
            </Drawer.Trigger>
          </div>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40" />
            <Drawer.Content className="bg-background flex flex-col rounded-t-[10px] h-[90%] mt-24 fixed bottom-0 left-0 right-0">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/50 my-4" />
                <div className="flex-1 overflow-auto p-4">
                  {inventoryContent}
                </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
    )
  }

  return (
    <div className="flex flex-col h-full bg-transparent text-foreground">
      <ResizablePanelGroup 
        direction={"horizontal"} 
        className="flex-1"
      >
        <ResizablePanel
          defaultSize={25}
          minSize={20}
          maxSize={40}
          collapsible
          collapsedSize={0}
          onCollapse={() => setIsInventoryPanelVisible(false)}
          onExpand={() => setIsInventoryPanelVisible(true)}
          className={cn(
            'transition-all duration-300 ease-in-out',
            !isInventoryPanelVisible && 'w-0 min-w-0'
          )}
        >
          {inventoryContent}
        </ResizablePanel>
        <ResizableHandle withHandle suppressHydrationWarning />
        <ResizablePanel defaultSize={75} className="relative p-4">
            <div className="relative w-full h-full">
                {workbenchContent}
                {selectedEquipment && selectedCount === 1 && !isHoldingSomething && !pouringState && !attachmentState && (
                  <div className="absolute top-0 right-0 z-20 w-full max-w-sm sm:w-80">
                    <EquipmentDetailsPanel equipment={selectedEquipment} />
                  </div>
                )}
            </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

// The default export now wraps the page content with the heavy provider.
export default function WorkbenchPage() {
  return (
    <ExperimentProvider>
      <WorkbenchPageContent />
    </ExperimentProvider>
  )
}
