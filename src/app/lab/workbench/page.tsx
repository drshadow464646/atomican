
'use client';

import { useState, useCallback, useEffect } from 'react';
import { InventoryPanel } from '@/components/inventory-panel';
import { Workbench } from '@/components/workbench';
import { EquipmentDetailsPanel } from '@/components/equipment-details-panel';
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
    handleSelectEquipment,
    heldItem,
    heldEquipment,
    handlePickUpChemical,
    handleClearHeldItem,
    handlePour,
    handleCancelPour,
    pouringState,
    attachmentState,
    handleDragStart,
    handleWorkbenchClick,
    handleEquipmentClick,
    handleMouseUpOnEquipment,
    handleDetach,
    handleCancelAttachment,
    handleRemoveConnection,
  } = useExperiment();

  const [isInventoryPanelVisible, setIsInventoryPanelVisible] = useState(true);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (heldItem || heldEquipment) {
            handleClearHeldItem();
        }
        if (pouringState) {
            handleCancelPour();
        }
        if (attachmentState) {
            handleCancelAttachment();
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
  }, [heldItem, heldEquipment, pouringState, attachmentState, handleClearHeldItem, handleCancelPour, handleCancelAttachment, experimentState.equipment, handleRemoveSelectedEquipment]);

  const selectedEquipment = experimentState.equipment.find(e => e.isSelected);
  const selectedCount = experimentState.equipment.filter(e => e.isSelected).length;

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
          <InventoryPanel
            equipment={inventoryEquipment}
            chemicals={inventoryChemicals}
            onAddEquipment={handleAddEquipmentToWorkbench}
            onPickUpChemical={handlePickUpChemical}
            isCollapsed={!isInventoryPanelVisible}
            heldItem={heldItem}
          />
        </ResizablePanel>
        <ResizableHandle withHandle suppressHydrationWarning />
        <ResizablePanel defaultSize={75} className="relative">
            <Workbench 
                state={experimentState} 
                onTitrate={handleTitrate}
                onResizeEquipment={handleResizeEquipment}
                onSelectEquipment={handleSelectEquipment}
                onDropOnApparatus={handleDropOnApparatus}
                onPour={handlePour}
                onCancelPour={handleCancelPour}
                heldItem={heldItem}
                heldEquipment={heldEquipment}
                onRemoveSelectedEquipment={handleRemoveSelectedEquipment}
                pouringState={pouringState}
                attachmentState={attachmentState}
                onDragStart={handleDragStart}
                onWorkbenchClick={handleWorkbenchClick}
                onEquipmentClick={handleEquipmentClick}
                onMouseUpOnEquipment={handleMouseUpOnEquipment}
                onDetach={handleDetach}
                onRemoveConnection={handleRemoveConnection}
            />
            {selectedEquipment && selectedCount === 1 && !heldItem && !heldEquipment && !pouringState && !attachmentState && (
              <div className="absolute top-4 right-4 z-20 w-80">
                <EquipmentDetailsPanel equipment={selectedEquipment} />
              </div>
            )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
