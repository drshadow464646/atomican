
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, LayoutGrid } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [isClient, setIsClient] = useState(false);
  const [isInventoryPanelVisible, setIsInventoryPanelVisible] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
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
  
  const workbenchContent = <Workbench />;
  
  const inventoryContent = (
      <InventoryPanel
        isCollapsed={isMobile ? false : !isInventoryPanelVisible}
      />
  );

  if (isMobile) {
    return (
        <Tabs defaultValue="workbench" className="w-full h-full flex flex-col p-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workbench"><LayoutGrid className="mr-2 h-4 w-4"/> Workbench</TabsTrigger>
            <TabsTrigger value="inventory"><Package className="mr-2 h-4 w-4"/> Inventory</TabsTrigger>
          </TabsList>
          <TabsContent value="workbench" className="flex-1 overflow-auto mt-2">
            {workbenchContent}
          </TabsContent>
          <TabsContent value="inventory" className="flex-1 overflow-auto mt-2">
            {inventoryContent}
          </TabsContent>
        </Tabs>
    )
  }

  if (!isClient) {
    return (
        <div className="flex h-full bg-transparent text-foreground">
            <Skeleton className="w-[25%] h-full" />
            <div className="w-px bg-border" />
            <Skeleton className="w-[75%] h-full" />
        </div>
    );
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
        <ResizablePanel defaultSize={75} className="relative">
            {workbenchContent}
            {selectedEquipment && selectedCount === 1 && !inventory.heldItem && !heldEquipment && !pouringState && !attachmentState && (
              <div className="absolute top-4 right-4 z-20 w-80">
                <EquipmentDetailsPanel equipment={selectedEquipment} />
              </div>
            )}
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
