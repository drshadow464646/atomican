
'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ExperimentState, LabLog, Chemical, Equipment, Solution } from '@/lib/experiment';
import { calculatePH, getIndicatorColor } from '@/lib/experiment';
import { useToast } from '@/hooks/use-toast';
import { getInitialInventoryEquipment, ALL_APPARATUS } from '@/lib/apparatus-catalog';
import { ALL_CHEMICALS } from '@/lib/chemical-catalog';

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
  heldEquipment: Equipment | null;
  setSafetyGogglesOn: (on: boolean) => void;
  handleAddEquipmentToWorkbench: (equipment: Equipment) => void;
  handleAddEquipmentToInventory: (equipment: Omit<Equipment, 'position' | 'isSelected' | 'size'>) => void;
  handleRemoveSelectedEquipment: (id: string) => void;
  handleResizeEquipment: (equipmentId: string, size: number) => void;
  handleMoveEquipment: (equipmentId: string, position: { x: number, y: number }) => void;
  handleSelectEquipment: (equipmentId: string | null, e: React.MouseEvent | MouseEvent) => void;
  handleDropOnApparatus: (equipmentId: string) => void;
  handlePickUpEquipment: (id: string, e: React.MouseEvent) => void;
  handlePour: (targetId: string) => void;
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
  const [heldEquipment, setHeldEquipment] = useState<Equipment | null>(null);
  const { toast } = useToast();

  const [inventoryChemicals, setInventoryChemicals] = useState<Chemical[]>([]);
  const [inventoryEquipment, setInventoryEquipment] = useState<Equipment[]>([]);

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
  
  const updatePhAndColor = useCallback((state: ExperimentState): ExperimentState => {
    const newState = { ...state };
    const mainContainer = newState.equipment.find(e => e.type === 'beaker' || e.type === 'erlenmeyer-flask');

    if (mainContainer && mainContainer.solutions) {
      const newPh = calculatePH(mainContainer.solutions);
      mainContainer.ph = newPh;
      const indicator = mainContainer.solutions.find(s => s.chemical.type === 'indicator')?.chemical;
      if (indicator) {
        const newColor = getIndicatorColor(indicator.id, newPh);
        if (newColor !== mainContainer.color) {
          addLog(`Solution color changed to ${newColor}.`);
        }
        mainContainer.color = newColor;
      } else {
        mainContainer.color = 'transparent';
      }
    }
    
    // Legacy support for top-level beaker state
    if (newState.beaker) {
        const newPh = calculatePH(newState.beaker.solutions);
        newState.ph = newPh;
         if (newState.beaker.indicator) {
            const newColor = getIndicatorColor(newState.beaker.indicator.id, newPh);
            if (newColor !== newState.color) {
                addLog(`Beaker solution color changed.`);
            }
            newState.color = newColor;
        }
    }

    return newState;
  }, [addLog]);


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
  
  const handleSelectEquipment = useCallback((equipmentId: string | null, e: React.MouseEvent | MouseEvent) => {
    e.stopPropagation();
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

    if (experimentState.equipment.some((e) => e.type === equipment.type && (e.type === 'beaker' || e.type === 'burette'))) {
      setTimeout(() => toast({ title: 'Notice', description: `A ${equipment.name} is already on the workbench.` }), 0);
      return;
    }

    setExperimentState((prevState) => {
      addLog(`Added ${equipment.name} to the workbench.`);
      const newEquipment: Equipment = { 
        ...equipment, 
        id: `${equipment.type}-${Date.now()}`,
        size: 0.8,
        position: { x: 250 + (Math.random() * 50 - 25), y: 100 + (Math.random() * 50 - 25) },
        isSelected: false,
        solutions: [],
        ph: 7,
        color: 'transparent'
      }; 
      return { ...prevState, equipment: [...prevState.equipment, newEquipment] };
    });
  }, [addLog, handleSafetyCheck, toast, experimentState.equipment]);

  const handleAddEquipmentToInventory = useCallback((equipment: Omit<Equipment, 'position' | 'isSelected' | 'size'>) => {
    if (inventoryEquipment.find((e) => e.id === equipment.id)) {
       setTimeout(() => toast({ title: 'Already in Inventory', description: `${equipment.name} is already in your inventory.` }), 0);
      return;
    }
    const newInventoryItem: Equipment = {
        ...equipment,
        position: { x: 0, y: 0 },
        size: 1,
        isSelected: false,
        solutions: [],
    };
    setInventoryEquipment(prev => [...prev, newInventoryItem]);
     setTimeout(() => toast({ title: 'Added to Inventory', description: `${equipment.name} has been added to your inventory.` }), 0);
  }, [inventoryEquipment, toast]);
  
  const handleRemoveSelectedEquipment = useCallback((id: string) => {
    setExperimentState(prevState => {
      const equipmentToRemove = prevState.equipment.find(e => e.id === id);
      if (!equipmentToRemove) return prevState;

      addLog(`Removed ${equipmentToRemove.name} from the workbench.`);
      
      const newEquipment = prevState.equipment.filter(e => e.id !== equipmentToRemove.id);
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

    setExperimentState(prevState => {
        let newState = { ...prevState };
        const equipmentOnWorkbench = newState.equipment.find(e => e.id === equipmentId);
        if (!equipmentOnWorkbench) return prevState;

        const canAddChemical = !equipmentOnWorkbench.solutions || equipmentOnWorkbench.solutions.length === 0;

        if ((heldItem.type === 'acid' || heldItem.type === 'base') && canAddChemical) {
            equipmentOnWorkbench.solutions = [{ chemical: heldItem, volume: Math.min(50, equipmentOnWorkbench.volume || 50) }];
            addLog(`Added ${equipmentOnWorkbench.solutions[0].volume}ml of ${heldItem.name} to ${equipmentOnWorkbench.name}.`);
            setHeldItem(null);
        } else if (heldItem.type === 'indicator' && !canAddChemical) {
            equipmentOnWorkbench.solutions.push({ chemical: heldItem, volume: 1 }); // Assume 1ml of indicator
            addLog(`Added ${heldItem.name} indicator to ${equipmentOnWorkbench.name}.`);
            setHeldItem(null);
        } else if (!canAddChemical) {
            setTimeout(() => toast({ title: 'Invalid Action', description: `${equipmentOnWorkbench.name} already contains a solution.`, variant: 'destructive' }), 0);
        } else {
            setTimeout(() => toast({ title: 'Invalid Action', description: `Cannot add ${heldItem.name} to ${equipmentOnWorkbench.name}.`, variant: 'destructive' }), 0);
        }
        
        // Legacy Beaker/Burette state
        if (equipmentOnWorkbench.type === 'beaker') {
            newState.beaker = { solutions: equipmentOnWorkbench.solutions, indicator: equipmentOnWorkbench.solutions.find(s=>s.chemical.type === 'indicator')?.chemical || null };
        }
        if (equipmentOnWorkbench.type === 'burette') {
            newState.burette = equipmentOnWorkbench.solutions[0];
        }

        return updatePhAndColor(newState);
    });
  }, [addLog, handleSafetyCheck, toast, updatePhAndColor, heldItem]);
  
  const handlePour = useCallback((targetId: string) => {
    if (!heldEquipment || heldEquipment.id === targetId) return;

    setExperimentState(prevState => {
      const source = prevState.equipment.find(e => e.id === heldEquipment.id);
      const target = prevState.equipment.find(e => e.id === targetId);

      if (!source || !target || !source.solutions || source.solutions.length === 0) {
        return prevState;
      }
      
      const pourVolume = Math.min(source.solutions.reduce((t, s) => t + s.volume, 0), 50);
      addLog(`Pouring ${pourVolume.toFixed(1)}ml from ${source.name} into ${target.name}.`);

      // Simple transfer logic for now, doesn't handle complex reactions yet.
      // Merges solutions.
      if (!target.solutions) target.solutions = [];
      
      for (const sourceSolution of source.solutions) {
        const existingTargetSolution = target.solutions.find(s => s.chemical.id === sourceSolution.chemical.id);
        if (existingTargetSolution) {
          existingTargetSolution.volume += sourceSolution.volume;
        } else {
          target.solutions.push({...sourceSolution});
        }
      }

      source.solutions = [];

      const newState = {
        ...prevState,
        equipment: prevState.equipment.map(e => {
          if (e.id === source.id) return source;
          if (e.id === target.id) return target;
          return e;
        })
      };

      setHeldEquipment(null);
      return updatePhAndColor(newState);
    });

  }, [addLog, heldEquipment, updatePhAndColor]);
  
  const handlePickUpChemical = useCallback((chemical: Chemical) => {
    handleClearHeldItem();
    setHeldItem(chemical);
    setTimeout(() => {
      toast({
        title: `Holding ${chemical.name}`,
        description: "Click on a piece of equipment to add it.",
      });
    }, 0);
  }, [toast]);

  const handlePickUpEquipment = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleClearHeldItem();
    const equipment = experimentState.equipment.find(e => e.id === id);
    if (equipment) {
      setHeldEquipment(equipment);
      setTimeout(() => {
        toast({
          title: `Holding ${equipment.name}`,
          description: "Click on another piece of equipment to pour into it.",
        });
      }, 0);
    }
  }, [experimentState.equipment, toast]);

  const handleClearHeldItem = useCallback(() => {
    if (heldItem || heldEquipment) {
      setHeldItem(null);
      setHeldEquipment(null);
      setTimeout(() => {
        toast({
          title: `Action Canceled`,
          description: "You are no longer holding an item.",
          variant: 'default',
        });
      }, 0);
    }
  }, [toast, heldItem, heldEquipment]);

  const handleAddChemicalToInventory = useCallback((chemical: Chemical) => {
    if (inventoryChemicals.find((c) => c.id === chemical.id)) {
        setTimeout(() => toast({ title: 'Already in Inventory', description: `${chemical.name} is already in your inventory.` }), 0);
        return;
    }
    setInventoryChemicals(prev => [...prev, chemical]);
    setTimeout(() => toast({ title: 'Added to Inventory', description: `${chemical.name} has been added to your inventory.` }), 0);
  }, [inventoryChemicals, toast]);
  
  const handleTitrate = useCallback((volume: number) => {
    if (!handleSafetyCheck()) return;
    
    setExperimentState(prevState => {
      const burette = prevState.equipment.find(e => e.type === 'burette');
      const beaker = prevState.equipment.find(e => e.type === 'beaker' || e.type === 'erlenmeyer-flask');

      if (!beaker || !burette || !burette.solutions || burette.solutions.length === 0) {
        setTimeout(() => toast({ title: 'Error', description: 'Ensure a beaker/flask and a filled burette are on the workbench.', variant: 'destructive' }), 0);
        return prevState;
      }
      
      const titrantSolution = burette.solutions[0];
      const volumeToPour = Math.min(volume, titrantSolution.volume);

      if (volumeToPour <= 0) {
        setTimeout(() => toast({ title: 'Notice', description: 'Burette is empty.' }), 0);
        return prevState;
      }

      titrantSolution.volume -= volumeToPour;
      addLog(`Added ${volumeToPour.toFixed(1)}ml of ${titrantSolution.chemical.name} from burette.`);
      
      if (!beaker.solutions) beaker.solutions = [];
      const existingTitrantInBeaker = beaker.solutions.find(s => s.chemical.id === titrantSolution.chemical.id);

      if(existingTitrantInBeaker) {
        existingTitrantInBeaker.volume += volumeToPour;
      } else {
        beaker.solutions.push({ chemical: titrantSolution.chemical, volume: volumeToPour });
      }
      
      const newState = {...prevState, equipment: prevState.equipment.map(e => {
        if(e.id === burette.id) return burette;
        if(e.id === beaker.id) return beaker;
        return e;
      })};

      return updatePhAndColor(newState);
    });
  }, [addLog, handleSafetyCheck, toast, updatePhAndColor]);


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
    heldEquipment,
    setSafetyGogglesOn,
    handleAddEquipmentToWorkbench,
    handleAddEquipmentToInventory,
    handleRemoveSelectedEquipment,
    handleResizeEquipment,
    handleMoveEquipment,
    handleSelectEquipment,
    handleDropOnApparatus,
    handlePickUpEquipment,
    handlePour,
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
    heldEquipment,
    setSafetyGogglesOn,
    handleAddEquipmentToWorkbench,
    handleAddEquipmentToInventory,
    handleRemoveSelectedEquipment,
    handleResizeEquipment,
    handleMoveEquipment,
    handleSelectEquipment,
    handleDropOnApparatus,
    handlePickUpEquipment,
    handlePour,
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
