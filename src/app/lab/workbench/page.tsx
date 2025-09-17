'use client';

import { useState, useCallback, useEffect } from 'react';
import { InventoryPanel } from '@/components/inventory-panel';
import { Workbench } from '@/components/workbench';
import { cn } from '@/lib/utils';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useExperiment } from '@/hooks/use-experiment';

export default function WorkbenchPage() {
  const { 
    experimentState, 
    inventoryChemicals,
    inventoryEquipment,
    handleAddEquipmentToWorkbench,
    handleDropOnApparatus,
    handleTitrate,
    handleRemoveSelectedEquipment,
    handleResizeEquipment,
    handleMoveEquipment,
    handleSelectEquipment,
    heldItem,
    heldEquipment,
    handlePickUpChemical,
    handlePickUpEquipment,
    handleClearHeldItem,
    handlePour,
    pouringState,
    handleInitiatePour,
    handleCancelPour,
  } = useExperiment();

  const [isInventoryPanelVisible, setIsInventoryPanelVisible] = useState(true);
  
  useEffect(() => {
    // Add a global key listener to drop the held item with Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (heldItem || heldEquipment) {
            handleClearHeldItem();
        }
        if (pouringState) {
            handleCancelPour();
        }
      }
      const selectedId = experimentState.equipment.find(eq => eq.isSelected)?.id;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        handleRemoveSelectedEquipment(selectedId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [heldItem, heldEquipment, pouringState, handleClearHeldItem, handleCancelPour, experimentState.equipment, handleRemoveSelectedEquipment]);


  return (
    <div className="flex flex-col h-full bg-transparent text-foreground">
      <ResizablePanelGroup 
        direction={"vertical"} 
        className="flex-1"
      >
        <ResizablePanel 
            defaultSize={35} 
            minSize={20}
            collapsible={true}
            collapsedSize={0}
        >
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel
                  collapsible
                  collapsedSize={0}
                  onCollapse={() => setIsInventoryPanelVisible(false)}
                  onExpand={() => setIsInventoryPanelVisible(true)}
                  className={cn(
                    'transition-all duration-300 ease-in-out',
                    !isInventoryPanelVisible && 'w-0 min-w-0'
                  )}
                  defaultSize={100}
                  minSize={30}
                >
                  <InventoryPanel
                    equipment={inventoryEquipment}
                    chemicals={inventoryChemicals}
                    onAddEquipment={handleAddEquipmentToWorkbench}
                    onPickUpChemical={handlePickUpChemical}
                    isCollapsed={!isInventoryPanelVisible}
                    heldItem={heldItem}
                  />
                </ResizablePanel>
            </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle suppressHydrationWarning />
        <ResizablePanel defaultSize={65} minSize={30}>
            <Workbench 
                state={experimentState} 
                onTitrate={handleTitrate}
                onResizeEquipment={handleResizeEquipment}
                onMoveEquipment={handleMoveEquipment}
                onSelectEquipment={handleSelectEquipment}
                onDropOnApparatus={handleDropOnApparatus}
                onPickUpEquipment={handlePickUpEquipment}
                onPour={handlePour}
                onInitiatePour={handleInitiatePour}
                onCancelPour={handleCancelPour}
                heldItem={heldItem}
                heldEquipment={heldEquipment}
                onRemoveSelectedEquipment={handleRemoveSelectedEquipment}
                pouringState={pouringState}
            />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
