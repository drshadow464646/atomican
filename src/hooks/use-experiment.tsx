
'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ExperimentState, LabLog, Chemical, Equipment } from '@/lib/experiment';
import { calculatePH, INITIAL_CHEMICALS, INITIAL_EQUIPMENT, ALL_EQUIPMENT } from '@/lib/experiment';
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
  handleTitrate: (volume: number, sourceId?: string, targetId?: string) => void;
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
      setTimeout(() => {
        toast({
          title: 'Safety Warning!',
          description: 'Looking cool is great, but safety is cooler. Put your shades on!',
          variant: 'destructive',
        });
      }, 0);
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

    if (experimentState.equipment.some((e) => e.type === equipment.type)) {
      setTimeout(() => toast({ title: 'Notice', description: `${equipment.name} is already on the workbench.` }), 0);
      return;
    }

    setExperimentState((prevState) => {
      addLog(`Added ${equipment.name} to the workbench.`);
      const newEquipment: Equipment = { 
        ...equipment, 
        id: `${equipment.id}-${Date.now()}`, // Make ID unique
        size: 1, // Default size
        position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 }, // Random position
        isSelected: false,
      }; 
      return { ...prevState, equipment: [...prevState.equipment, newEquipment] };
    });
  }, [addLog, handleSafetyCheck, toast, experimentState.equipment]);

  const handleAddEquipmentToInventory = useCallback((equipment: Equipment) => {
    if (inventoryEquipment.find((e) => e.id === equipment.id)) {
       setTimeout(() => toast({ title: 'Already in Inventory', description: `${equipment.name} is already in your inventory.` }), 0);
      return;
    }
    setInventoryEquipment(prev => [...prev, equipment]);
     setTimeout(() => toast({ title: 'Added to Inventory', description: `${equipment.name} has been added to your inventory.` }), 0);
  }, [inventoryEquipment, toast]);
  
  const handleRemoveEquipmentFromWorkbench = useCallback((equipmentId: string) => {
    setExperimentState(prevState => {
      const equipmentToRemove = prevState.equipment.find(e => e.id === equipmentId);
      if (equipmentToRemove) {
        addLog(`Removed ${equipmentToRemove.name} from the workbench.`);
      }
      const newEquipment = prevState.equipment.filter(e => e.id !== equipmentId);
      let newBeaker = prevState.beaker;
      let newBurette = prevState.burette;
      if (equipmentToRemove?.type === 'beaker') {
        newBeaker = null;
      }
      if (equipmentToRemove?.type === 'burette') {
        newBurette = null;
      }
      return {
        ...prevState,
        equipment: newEquipment,
        beaker: newBeaker,
        burette: newBurette
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

    const equipmentOnWorkbench = experimentState.equipment.find(e => e.id === equipmentId);
    if (!equipmentOnWorkbench) return;

    setExperimentState(prevState => {
        const newState = { ...prevState };
        let success = false;

        if (equipmentOnWorkbench.type === 'beaker') {
            if (heldItem.type === 'acid' && !prevState.beaker) {
                newState.beaker = { solutions: [{ chemical: heldItem, volume: 50 }], indicator: null };
                addLog(`Added 50ml of ${heldItem.name} to the beaker.`);
                success = true;
            } else if (heldItem.type === 'indicator' && prevState.beaker) {
                newState.beaker = { ...prevState.beaker, indicator: heldItem };
                addLog(`Added ${heldItem.name} indicator to the beaker.`);
                success = true;
            } else {
                 setTimeout(() => toast({ title: 'Invalid Action', description: `Cannot add ${heldItem.name} to the beaker.`, variant: 'destructive' }), 0);
            }
        }
        else if (equipmentOnWorkbench.type === 'burette') {
            if (heldItem.type === 'base' && !prevState.burette) {
                newState.burette = { chemical: heldItem, volume: 50 };
                addLog(`Filled the burette with 50ml of ${heldItem.name}.`);
                success = true;
            } else {
                setTimeout(() => toast({ title: 'Invalid Action', description: `Cannot add ${heldItem.name} to the burette.`, variant: 'destructive' }), 0);
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
    setTimeout(() => {
      toast({
        title: `Holding ${chemical.name}`,
        description: "Click on a piece of equipment to add it.",
      });
    }, 0);
  }, [toast]);

  const handleClearHeldItem = useCallback(() => {
    setHeldItem(null);
     setTimeout(() => {
      toast({
        title: `Action Canceled`,
        description: "You are no longer holding an item.",
        variant: 'default',
      });
    }, 0);
  }, [toast]);

  const handleAddChemicalToInventory = useCallback((chemical: Chemical) => {
    if (inventoryChemicals.find((c) => c.id === chemical.id)) {
        setTimeout(() => toast({ title: 'Already in Inventory', description: `${chemical.name} is already in your inventory.` }), 0);
        return;
    }
    setInventoryChemicals(prev => [...prev, chemical]);
    setTimeout(() => toast({ title: 'Added to Inventory', description: `${chemical.name} has been added to your inventory.` }), 0);
  }, [inventoryChemicals, toast]);
  
  const handlePour = useCallback((volume: number, sourceId?: string, targetId?: string) => {
    if (!handleSafetyCheck()) return;

    const sourceEquipment = experimentState.equipment.find(e => e.id === sourceId);
    const targetEquipment = experimentState.equipment.find(e => e.id === targetId);
    
    if (sourceEquipment?.type !== 'burette' || targetEquipment?.type !== 'beaker') {
      setTimeout(() => toast({ title: 'Invalid Action', description: 'Can only pour from a burette into a beaker.', variant: 'destructive' }), 0);
      return;
    }

    if (!experimentState.beaker || !experimentState.burette) {
        setTimeout(() => toast({ title: 'Error', description: 'Ensure both beaker and burette are set up with solutions.', variant: 'destructive' }), 0);
        return;
    }

    const newVolumeAdded = Math.max(0, Math.min(experimentState.burette.volume, experimentState.volumeAdded + volume));

    if (newVolumeAdded === experimentState.volumeAdded && volume > 0) {
        setTimeout(() => toast({ title: 'Notice', description: 'Burette is empty.' }), 0);
        return;
    }

    setExperimentState(prevState => {
        if (!prevState.burette) return prevState;
        if (volume > 0) {
            addLog(`Added ${volume.toFixed(1)}ml of ${prevState.burette.chemical.name}. Total added: ${newVolumeAdded.toFixed(1)}ml.`);
        }
        const newState = { ...prevState, volumeAdded: newVolumeAdded };
        return updatePhAndColor(newState);
    });
  }, [addLog, handleSafetyCheck, toast, updatePhAndColor, experimentState]);
  
  const handleTitrate = useCallback((volume: number, sourceId?: string, targetId?: string) => {
      const burette = experimentState.equipment.find(e => e.type === 'burette');
      const beaker = experimentState.equipment.find(e => e.type === 'beaker');

      // If source and target are not provided, find them on the workbench
      const source = sourceId ?? burette?.id;
      const target = targetId ?? beaker?.id;
      
      if (!source || !target) {
           setTimeout(() => toast({ title: 'Error', description: 'Burette or beaker not found on workbench.', variant: 'destructive' }), 0);
           return;
      }
      handlePour(volume, source, target);
  }, [handlePour, experimentState.equipment, toast]);


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
