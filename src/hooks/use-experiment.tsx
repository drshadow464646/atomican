
'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ExperimentState, LabLog, Chemical, Equipment } from '@/lib/experiment';
import { calculatePH, INITIAL_CHEMICALS, INITIAL_EQUIPMENT } from '@/lib/experiment';
import { useToast } from '@/hooks/use-toast';

let logIdCounter = 0;
const getUniqueLogId = () => {
    return `${Date.now()}-${logIdCounter++}`;
};

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
  inventoryChemicals: Chemical[];
  inventoryEquipment: Equipment[];
  safetyGogglesOn: boolean;
  heldItem: Chemical | null;
  setSafetyGogglesOn: (on: boolean) => void;
  handleAddEquipmentToWorkbench: (equipment: Equipment) => void;
  handleAddEquipmentToInventory: (equipment: Equipment) => void;
  handleRemoveEquipmentFromWorkbench: (equipmentId: string) => void;
  handleResizeEquipment: (equipmentId: string, size: number) => void;
  handleMoveEquipment: (equipmentId: string, position: { x: number, y: number }) => void;
  handleSelectEquipment: (equipmentId: string | null) => void;
  handleDropOnApparatus: (equipmentId: string) => void;
  handleAddChemicalToInventory: (chemical: Chemical) => void;
  handleTitrate: (volume: number) => void;
  handleAddCustomLog: (note: string) => void;
  handleResetExperiment: () => void;
  handlePickUpChemical: (chemical: Chemical) => void;
  handleClearHeldItem: () => void;
};

const ExperimentContext = createContext<ExperimentContextType | undefined>(undefined);

export function ExperimentProvider({ children }: { children: React.ReactNode }) {
  const [experimentState, setExperimentState] = useState<ExperimentState>(initialExperimentState);
  const [labLogs, setLabLogs] = useState<LabLog[]>([]);
  const [safetyGogglesOn, setSafetyGogglesOn] = useState(true);
  const [heldItem, setHeldItem] = useState<Chemical | null>(null);
  const { toast } = useToast();

  const [inventoryChemicals, setInventoryChemicals] = useState<Chemical[]>(INITIAL_CHEMICALS);
  const [inventoryEquipment, setInventoryEquipment] = useState<Equipment[]>(INITIAL_EQUIPMENT);

  const addLog = useCallback((text: string, isCustom: boolean = false) => {
    setLabLogs(prevLogs => {
      const newLog: LabLog = {
        id: getUniqueLogId(),
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

  const handleSelectEquipment = useCallback((equipmentId: string | null) => {
    setExperimentState(prevState => ({
      ...prevState,
      equipment: prevState.equipment.map(e => ({
        ...e,
        isSelected: e.id === equipmentId,
      })),
    }));
  }, []);

  const handleAddEquipmentToWorkbench = useCallback((equipment: Equipment) => {
    if (!handleSafetyCheck()) return;

    if (experimentState.equipment.find((e) => e.id === equipment.id)) {
      toast({ title: 'Notice', description: `${equipment.name} is already on the workbench.` });
      return;
    }

    setExperimentState((prevState) => {
      addLog(`Added ${equipment.name} to the workbench.`);
      const newEquipment: Equipment = { 
        ...equipment, 
        size: 1, // Default size
        position: { x: 50, y: 50 }, // Default position
        isSelected: false,
      }; 
      return { ...prevState, equipment: [...prevState.equipment, newEquipment] };
    });
  }, [addLog, handleSafetyCheck, toast, experimentState.equipment]);

  const handleAddEquipmentToInventory = useCallback((equipment: Equipment) => {
    if (inventoryEquipment.find((e) => e.id === equipment.id)) {
      toast({ title: 'Already in Inventory', description: `${equipment.name} is already in your inventory.` });
      return;
    }
    setInventoryEquipment(prev => [...prev, equipment]);
    toast({ title: 'Added to Inventory', description: `${equipment.name} has been added to your inventory.` });
  }, [inventoryEquipment, toast]);
  
  const handleRemoveEquipmentFromWorkbench = useCallback((equipmentId: string) => {
    setExperimentState(prevState => {
      const equipmentToRemove = prevState.equipment.find(e => e.id === equipmentId);
      if (equipmentToRemove) {
        addLog(`Removed ${equipmentToRemove.name} from the workbench.`);
      }
      return {
        ...prevState,
        equipment: prevState.equipment.filter(e => e.id !== equipmentId)
      };
    });
  }, [addLog]);

  const handleResizeEquipment = useCallback((equipmentId: string, size: number) => {
    setExperimentState(prevState => ({
      ...prevState,
      equipment: prevState.equipment.map(e => 
        e.id === equipmentId ? { ...e, size } : e
      ),
    }));
  }, []);
  
  const handleMoveEquipment = useCallback((equipmentId: string, position: { x: number, y: number }) => {
    setExperimentState(prevState => ({
      ...prevState,
      equipment: prevState.equipment.map(e =>
        e.id === equipmentId ? { ...e, position } : e
      ),
    }));
  }, []);

  const handleDropOnApparatus = useCallback((equipmentId: string) => {
    if (!handleSafetyCheck() || !heldItem) return;

    const targetEquipment = experimentState.equipment.find(e => e.id === equipmentId);
    if (!targetEquipment) return;

    setExperimentState(prevState => {
        const newState = { ...prevState };
        let success = false;

        // Drop into Beaker
        if (targetEquipment.type === 'beaker') {
            if (heldItem.type === 'acid' && !prevState.beaker) {
                newState.beaker = { solutions: [{ chemical: heldItem, volume: 50 }], indicator: null };
                addLog(`Added 50ml of ${heldItem.name} to the beaker.`);
                success = true;
            } else if (heldItem.type === 'indicator' && prevState.beaker) {
                newState.beaker = { ...prevState.beaker, indicator: heldItem };
                addLog(`Added ${heldItem.name} indicator to the beaker.`);
                success = true;
            } else {
                 toast({ title: 'Invalid Action', description: `Cannot add ${heldItem.name} to the beaker.`, variant: 'destructive' });
            }
        }
        // Drop into Burette
        else if (targetEquipment.type === 'burette') {
            if (heldItem.type === 'base' && !prevState.burette) {
                newState.burette = { chemical: heldItem, volume: 50 };
                addLog(`Filled the burette with 50ml of ${heldItem.name}.`);
                success = true;
            } else {
                toast({ title: 'Invalid Action', description: `Cannot add ${heldItem.name} to the burette.`, variant: 'destructive' });
            }
        }

        if (success) {
          setHeldItem(null);
          return updatePhAndColor(newState);
        }

        return prevState;
    });
  }, [addLog, handleSafetyCheck, toast, updatePhAndColor, experimentState, heldItem]);
  
  const handlePickUpChemical = useCallback((chemical: Chemical) => {
    setHeldItem(chemical);
    toast({
      title: `Holding ${chemical.name}`,
      description: "Click on a piece of equipment to add it.",
    });
  }, [toast]);

  const handleClearHeldItem = useCallback(() => {
    setHeldItem(null);
     toast({
      title: `Action Canceled`,
      description: "You are no longer holding an item.",
      variant: 'default',
    });
  }, [toast]);

  const handleAddChemicalToInventory = useCallback((chemical: Chemical) => {
    if (inventoryChemicals.find((c) => c.id === chemical.id)) {
        toast({ title: 'Already in Inventory', description: `${chemical.name} is already in your inventory.` });
        return;
    }
    setInventoryChemicals(prev => [...prev, chemical]);
    toast({ title: 'Added to Inventory', description: `${chemical.name} has been added to your inventory.` });
  }, [inventoryChemicals, toast]);
  
  const handleTitrate = useCallback((volume: number) => {
    if (!handleSafetyCheck()) return;

    if (!experimentState.beaker || !experimentState.burette) {
        toast({ title: 'Error', description: 'Ensure both beaker and burette are set up with solutions.', variant: 'destructive' });
        return;
    }

    const newVolumeAdded = Math.max(0, Math.min(experimentState.burette.volume, experimentState.volumeAdded + volume));

    if (newVolumeAdded === experimentState.volumeAdded && volume !== 0) {
        toast({ title: 'Notice', description: volume > 0 ? 'Burette is empty.' : 'Cannot remove solution.' });
        return;
    }

    setExperimentState(prevState => {
        if (volume !== 0) {
            addLog(`Added ${volume.toFixed(1)}ml of ${prevState.burette!.chemical.name}. Total added: ${newVolumeAdded.toFixed(1)}ml.`);
        }
        const newState = { ...prevState, volumeAdded: newVolumeAdded };
        return updatePhAndColor(newState);
    });
  }, [addLog, handleSafetyCheck, toast, updatePhAndColor, experimentState]);

  const handleAddCustomLog = useCallback((note: string) => {
    if(note.trim()) {
      addLog(note, true);
    }
  }, [addLog]);

  const handleResetExperiment = useCallback(() => {
    setExperimentState(initialExperimentState);
    setLabLogs([]);
    addLog('Experiment reset.');
  }, [addLog]);

  const value = useMemo(() => ({
    experimentState,
    labLogs,
    inventoryChemicals,
    inventoryEquipment,
    safetyGogglesOn,
    heldItem,
    setSafetyGogglesOn,
    handleAddEquipmentToWorkbench,
    handleAddEquipmentToInventory,
    handleRemoveEquipmentFromWorkbench,
    handleResizeEquipment,
    handleMoveEquipment,
    handleSelectEquipment,
    handleDropOnApparatus,
    handleAddChemicalToInventory,
    handleTitrate,
    handleAddCustomLog,
    handleResetExperiment,
    handlePickUpChemical,
    handleClearHeldItem,
  }), [
    experimentState, 
    labLogs, 
    inventoryChemicals, 
    inventoryEquipment, 
    safetyGogglesOn,
    heldItem,
    setSafetyGogglesOn,
    handleAddEquipmentToWorkbench,
    handleAddEquipmentToInventory,
    handleRemoveEquipmentFromWorkbench,
    handleResizeEquipment,
    handleMoveEquipment,
    handleSelectEquipment,
    handleDropOnApparatus,
    handleAddChemicalToInventory,
    handleTitrate,
    handleAddCustomLog,
    handleResetExperiment,
    handlePickUpChemical,
    handleClearHeldItem,
  ]);

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
