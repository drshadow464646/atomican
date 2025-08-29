
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
  calculatePH,
} from '@/lib/experiment';
import { getSuggestion } from '@/app/actions';
import { cn } from '@/lib/utils';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelRightClose, PanelLeftOpen, PanelRightOpen, ArrowLeftToLine, ArrowRightToLine } from 'lucide-react';

const initialExperimentState: ExperimentState = {
  equipment: [],
  beaker: null,
  burette: null,
  volumeAdded: 0,
  ph: null,
  color: 'transparent',
};

export default function WorkbenchPage() {
  const [experimentState, setExperimentState] = useState<ExperimentState>(initialExperimentState);
  const [labLogs, setLabLogs] = useState<LabLog[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion>(null);
  const [safetyGogglesOn, setSafetyGogglesOn] = useState(true);
  const [isSuggestionLoading, startSuggestionTransition] = useTransition();

  const [isInventoryPanelVisible, setIsInventoryPanelVisible] = useState(true);
  const [isGuidancePanelVisible, setIsGuidancePanelVisible] = useState(true);
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { toast } = useToast();

  const addLog = useCallback((text: string, isCustom: boolean = false) => {
    setLabLogs(prevLogs => {
      const newLog: LabLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        text,
        isCustom,
      };
      return [...prevLogs, newLog]
    });
  }, []);

  const handleSafetyCheck = useCallback(() => {
    if (!safetyGogglesOn) {
      toast({
        title: 'Safety Warning!',
        description: 'Please put on your safety goggles before proceeding.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  }, [safetyGogglesOn, toast]);

  const updatePhAndColor = useCallback((newState: ExperimentState) => {
    const newPh = calculatePH(newState);
    newState.ph = newPh;
    if (newState.beaker?.indicator) {
      if (newPh > 8.2) {
        if (newState.color !== 'hsl(var(--primary) / 0.3)') {
          addLog('Solution color changed to pink.');
        }
        newState.color = 'hsl(var(--primary) / 0.3)';
      } else {
        newState.color = 'transparent';
      }
    }
    return newState;
  }, [addLog]);

  const handleAddEquipment = useCallback((equipment: Equipment) => {
    if (!handleSafetyCheck()) return;
    setExperimentState((prevState) => {
      if (prevState.equipment.find((e) => e.id === equipment.id)) {
        toast({ title: 'Notice', description: `${equipment.name} is already on the workbench.` });
        return prevState;
      }
      addLog(`Added ${equipment.name} to the workbench.`);
      return { ...prevState, equipment: [...prevState.equipment, equipment] };
    });
  }, [addLog, handleSafetyCheck, toast]);
  
  const handleAddChemical = useCallback((chemical: Chemical, target: 'beaker' | 'burette') => {
      if (!handleSafetyCheck()) return;
  
      setExperimentState((prevState) => {
        const newState = { ...prevState };
        const targetEquipmentType = target;
  
        const hasEquipment = newState.equipment.some((e) => e.type === targetEquipmentType);
  
        if (!hasEquipment) {
          toast({ title: 'Error', description: `Please add a ${target} to the workbench first.`, variant: 'destructive' });
          return prevState;
        }
  
        if (target === 'beaker') {
          if (!newState.beaker) newState.beaker = { solutions: [], indicator: null };
          newState.beaker.solutions = [{ chemical, volume: 50 }]; // Default 50ml
          addLog(`Added 50ml of ${chemical.name} to the beaker.`);
        } else { // burette
          newState.burette = { chemical, volume: 50 }; // Fill burette
          addLog(`Filled the burette with 50ml of ${chemical.name}.`);
        }
        return updatePhAndColor(newState);
      });
  }, [addLog, handleSafetyCheck, toast, updatePhAndColor]);
  
  const handleAddIndicator = useCallback((chemical: Chemical) => {
    if (!handleSafetyCheck()) return;
    setExperimentState((prevState) => {
      if (!prevState.beaker) {
        toast({ title: 'Error', description: 'Add a solution to the beaker first.', variant: 'destructive' });
        return prevState;
      }
      addLog(`Added ${chemical.name} indicator to the beaker.`);
      const newState = { ...prevState, beaker: { ...prevState.beaker, indicator: chemical } };
      return updatePhAndColor(newState);
    });
  }, [addLog, handleSafetyCheck, toast, updatePhAndColor]);
  
  const handleTitrate = useCallback((volume: number) => {
    if (!handleSafetyCheck()) return;
    setExperimentState(prevState => {
        if (!prevState.beaker || !prevState.burette) {
            toast({ title: 'Error', description: 'Ensure both beaker and burette are set up with solutions.', variant: 'destructive' });
            return prevState;
        }
        const newVolumeAdded = Math.max(0, Math.min(prevState.burette.volume, prevState.volumeAdded + volume));
        if (newVolumeAdded === prevState.volumeAdded && volume !== 0) {
            toast({ title: 'Notice', description: volume > 0 ? 'Burette is empty.' : 'Cannot remove solution.' });
            return prevState;
        }
        if (volume !== 0) {
            addLog(`Added ${volume.toFixed(1)}ml of ${prevState.burette.chemical.name}. Total added: ${newVolumeAdded.toFixed(1)}ml.`);
        }
        const newState = { ...prevState, volumeAdded: newVolumeAdded };
        return updatePhAndColor(newState);
    });
  }, [addLog, handleSafetyCheck, toast, updatePhAndColor]);

  const handleGetSuggestion = useCallback(() => {
    startSuggestionTransition(async () => {
      const studentActions = labLogs.map(log => log.text).join('\n');
      const currentStepDescription = labLogs.length > 0 ? labLogs[labLogs.length - 1].text : "Experiment just started.";
      const suggestion = await getSuggestion(currentStepDescription, studentActions, experimentState);
      setAiSuggestion(suggestion);
    });
  }, [labLogs, experimentState]);

  const handleAddCustomLog = (note: string) => {
    if(note.trim()) {
      addLog(note, true);
    }
  };

  const handleResetExperiment = () => {
    setExperimentState(initialExperimentState);
    setLabLogs([]);
    setAiSuggestion(null);
    toast({
      title: 'Experiment Reset',
      description: 'The lab has been reset to its initial state.',
    });
  }

  const handleTogglePanels = () => {
    if(isInventoryPanelVisible || isGuidancePanelVisible) {
        setIsInventoryPanelVisible(false);
        setIsGuidancePanelVisible(false);
    } else {
        setIsInventoryPanelVisible(true);
        setIsGuidancePanelVisible(true);
    }
  }

  const arePanelsVisible = isInventoryPanelVisible || isGuidancePanelVisible;

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <LabHeader 
        safetyGogglesOn={safetyGogglesOn} 
        onGoggleToggle={setSafetyGogglesOn}
        onResetExperiment={handleResetExperiment}
      />
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
         <Button variant="ghost" size="sm" onClick={() => setIsInventoryPanelVisible(!isInventoryPanelVisible)}>
            {isInventoryPanelVisible ? <PanelLeftClose /> : <PanelLeftOpen />}
            <span className='ml-2 hidden md:inline'>{isInventoryPanelVisible ? 'Hide Inventory' : 'Show Inventory'}</span>
         </Button>
         <Button variant="outline" size="sm" onClick={handleTogglePanels}>
            {arePanelsVisible ? <ArrowLeftToLine className="md:mr-2" /> : <ArrowRightToLine className="md:mr-2" />}
            <span className="hidden md:inline">{arePanelsVisible ? 'Hide Panels' : 'Show Panels'}</span>
         </Button>
         <Button variant="ghost" size="sm" onClick={() => setIsGuidancePanelVisible(!isGuidancePanelVisible)}>
             <span className='mr-2 hidden md:inline'>{isGuidancePanelVisible ? 'Hide Guidance' : 'Show Guidance'}</span>
             {isGuidancePanelVisible ? <PanelRightClose /> : <PanelRightOpen />}
         </Button>
      </div>

      <ResizablePanelGroup 
        direction={isMobile ? "vertical" : "horizontal"} 
        className="flex-1"
      >
        {isInventoryPanelVisible && (
          <>
            <ResizablePanel
              defaultSize={isMobile ? 30 : 20}
              minSize={15}
              maxSize={isMobile ? 40 : 25}
              collapsible
              collapsedSize={0}
              className={cn(
                'transition-all duration-300 ease-in-out'
              )}
            >
              <InventoryPanel
                equipment={INITIAL_EQUIPMENT}
                chemicals={INITIAL_CHEMICALS}
                onAddEquipment={handleAddEquipment}
                onAddChemical={handleAddChemical}
                onAddIndicator={handleAddIndicator}
                isCollapsed={false}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}
        <ResizablePanel defaultSize={isMobile ? 40 : 55} minSize={30}>
          <Workbench state={experimentState} onTitrate={handleTitrate} />
        </ResizablePanel>
        {isGuidancePanelVisible && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={isMobile ? 30 : 25}
              minSize={15}
              maxSize={isMobile ? 50 : 30}
              collapsible
              collapsedSize={0}
              className={cn(
                'transition-all duration-300 ease-in-out'
              )}
            >
              <GuidancePanel
                logs={labLogs}
                onGetSuggestion={handleGetSuggestion}
                suggestion={aiSuggestion}
                isSuggestionLoading={isSuggestionLoading}
                isCollapsed={false}
                onAddCustomLog={handleAddCustomLog}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
