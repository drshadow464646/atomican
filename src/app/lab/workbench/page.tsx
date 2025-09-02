
'use client';

import { useState, useCallback, useTransition, useEffect } from 'react';
import { LabHeader } from '@/components/lab-header';
import { InventoryPanel } from '@/components/inventory-panel';
import { Workbench } from '@/components/workbench';
import { GuidancePanel } from '@/components/guidance-panel';
import { useToast } from '@/hooks/use-toast';
import {
  type ExperimentState,
  type LabLog,
  type AiSuggestion,
  type Chemical,
  type Equipment,
  INITIAL_EQUIPMENT,
  INITIAL_CHEMICALS,
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
    safetyGogglesOn, 
    setSafetyGogglesOn,
    handleAddEquipment,
    handleAddChemical,
    handleAddIndicator,
    handleTitrate,
    handleAddCustomLog,
    handleResetExperiment,
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

  return (
    <div className="flex flex-col h-screen bg-transparent text-foreground">
      <LabHeader 
        safetyGogglesOn={safetyGogglesOn} 
        onGoggleToggle={setSafetyGogglesOn}
        onResetExperiment={handleResetExperiment}
      />
      <ResizablePanelGroup 
        direction={isMobile ? "vertical" : "horizontal"} 
        className="flex-1"
      >
        <ResizablePanel
          collapsible
          collapsedSize={0}
          onCollapse={() => setIsInventoryPanelVisible(false)}
          onExpand={() => setIsInventoryPanelVisible(true)}
          className={cn(
            'transition-all duration-300 ease-in-out',
            !isInventoryPanelVisible && 'w-0 min-w-0'
          )}
          defaultSize={isMobile ? 30 : 20}
          minSize={15}
          maxSize={isMobile ? 40 : 25}
        >
          <InventoryPanel
            equipment={INITIAL_EQUIPMENT}
            chemicals={INITIAL_CHEMICALS}
            onAddEquipment={handleAddEquipment}
            onAddChemical={handleAddChemical}
            onAddIndicator={handleAddIndicator}
            isCollapsed={!isInventoryPanelVisible}
          />
        </ResizablePanel>
        <ResizableHandle withHandle className={cn(!isInventoryPanelVisible && 'hidden')}/>
        
        <ResizablePanel defaultSize={isMobile ? 40 : 55} minSize={30}>
          <Workbench state={experimentState} onTitrate={handleTitrate} />
        </ResizablePanel>

        <ResizableHandle withHandle className={cn(!isGuidancePanelVisible && 'hidden')} />
        <ResizablePanel
          collapsible
          collapsedSize={0}
          onCollapse={() => setIsGuidancePanelVisible(false)}
          onExpand={() => setIsGuidancePanelVisible(true)}
          className={cn(
            'transition-all duration-300 ease-in-out',
            !isGuidancePanelVisible && 'w-0 min-w-0'
          )}
           defaultSize={isMobile ? 30 : 25}
           minSize={15}
           maxSize={isMobile ? 50 : 30}
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
    </div>
  );
}
