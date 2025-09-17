
'use client';

import { useState, useCallback, useTransition, useEffect } from 'react';
import { InventoryPanel } from '@/components/inventory-panel';
import { Workbench } from '@/components/workbench';
import { GuidancePanel } from '@/components/guidance-panel';
import { useToast } from '@/hooks/use-toast';
import {
  type ExperimentState,
  type LabLog,
  type AiSuggestion,
} from '@/lib/experiment';
import { getSuggestion } from '@/app/actions';
import { cn } from '@/lib/utils';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';
import { useExperiment } from '@/hooks/use-experiment';

export default function WorkbenchPage() {
  const { 
    experimentState, 
    labLogs,
    inventoryChemicals,
    inventoryEquipment,
    handleAddEquipmentToWorkbench,
    handleDropOnApparatus,
    handleTitrate,
    handleAddCustomLog,
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
  } = useExperiment();

  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion>(null);
  const [isSuggestionLoading, startSuggestionTransition] = useTransition();

  const [isInventoryPanelVisible, setIsInventoryPanelVisible] = useState(true);
  const [isGuidancePanelVisible, setIsGuidancePanelVisible] = useState(true);
  const isMobile = useIsMobile();

  const handleGetSuggestion = useCallback(() => {
    startSuggestionTransition(async () => {
      const studentActions = labLogs.map(log => log.text).join('\n');
      const currentStepDescription = labLogs.length > 0 ? labLogs[labLogs.length - 1].text : "Experiment just started.";
      const suggestion = await getSuggestion(currentStepDescription, studentActions, experimentState);
      setAiSuggestion(suggestion);
    });
  }, [labLogs, experimentState]);
  
  useEffect(() => {
    // Clear suggestion when logs change
    setAiSuggestion(null);
  }, [labLogs])
  
  useEffect(() => {
    // Add a global key listener to drop the held item with Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (heldItem || heldEquipment)) {
        handleClearHeldItem();
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
  }, [heldItem, heldEquipment, handleClearHeldItem, experimentState.equipment, handleRemoveSelectedEquipment]);


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
                  defaultSize={50}
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
                <ResizableHandle withHandle className={cn(!isInventoryPanelVisible && 'hidden')}/>
                <ResizablePanel
                  collapsible
                  collapsedSize={0}
                  onCollapse={() => setIsGuidancePanelVisible(false)}
                  onExpand={() => setIsGuidancePanelVisible(true)}
                  className={cn(
                    'transition-all duration-300 ease-in-out',
                    !isGuidancePanelVisible && 'w-0 min-w-0'
                  )}
                   defaultSize={50}
                   minSize={30}
                >
                  <GuidancePanel
                    logs={labLogs}
                    onGetSuggestion={handleGetSuggestion}
                    suggestion={aiSuggestion}
                    isSuggestionLoading={isSuggestionLoading}
                    isCollapsed={!isGuidancePanelVisible}
                    onAddCustomLog={handleAddCustomLog}
                  />
                </ResizablePanel>
            </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
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
                heldItem={heldItem}
                heldEquipment={heldEquipment}
                onRemoveSelectedEquipment={handleRemoveSelectedEquipment}
            />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
