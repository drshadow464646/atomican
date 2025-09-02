
'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ExperimentState, LabLog, Chemical, Equipment } from '@/lib/experiment';
import { calculatePH } from '@/lib/experiment';
import { useToast } from '@/hooks/use-toast';

const initialExperimentState: ExperimentState = {
  equipment: [],
  beaker: null,
  burette: null,
  volumeAdded: 0,
  ph: null,
  color: 'transparent',
};

type ExperimentContextType = {
  experimentState: ExperimentState;
  labLogs: LabLog[];
  safetyGogglesOn: boolean;
  setSafetyGogglesOn: (on: boolean) => void;
  addLog: (text: string, isCustom?: boolean) => void;
  handleAddEquipment: (equipment: Equipment) => void;
  handleAddChemical: (chemical: Chemical, target: 'beaker' | 'burette') => void;
  handleAddIndicator: (chemical: Chemical) => void;
  handleTitrate: (volume: number) => void;
  handleAddCustomLog: (note: string) => void;
  handleResetExperiment: () => void;
};

const ExperimentContext = createContext<ExperimentContextType | undefined>(undefined);

export function ExperimentProvider({ children }: { children: React.ReactNode }) {
  const [experimentState, setExperimentState] = useState<ExperimentState>(initialExperimentState);
  const [labLogs, setLabLogs] = useState<LabLog[]>([]);
  const [safetyGogglesOn, setSafetyGogglesOn] = useState(true);
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
        description: 'Looking cool is great, but safety is cooler. Put your shades on!',
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

  const handleAddCustomLog = (note: string) => {
    if(note.trim()) {
      addLog(note, true);
    }
  };

  const handleResetExperiment = () => {
    setExperimentState(initialExperimentState);
    setLabLogs([]);
    toast({
      title: 'Experiment Reset',
      description: 'The lab has been reset to its initial state.',
    });
  }

  const value = useMemo(() => ({
    experimentState,
    labLogs,
    safetyGogglesOn,
    setSafetyGogglesOn,
    addLog,
    handleAddEquipment,
    handleAddChemical,
    handleAddIndicator,
    handleTitrate,
    handleAddCustomLog,
    handleResetExperiment,
  }), [experimentState, labLogs, safetyGogglesOn, addLog, handleAddEquipment, handleAddChemical, handleAddIndicator, handleTitrate, handleAddCustomLog, handleResetExperiment]);

  return (
    <ExperimentContext.Provider value={value}>
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperiment() {
  const context = useContext(ExperimentContext);
  if (context === undefined) {
    throw new Error('useExperiment must be used within an ExperimentProvider');
  }
  return context;
}
