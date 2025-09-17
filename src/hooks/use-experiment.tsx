
'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ExperimentState, LabLog, Chemical, Equipment, Solution } from '@/lib/experiment';
import { calculatePH, getIndicatorColor } from '@/lib/experiment';
import { useToast } from '@/hooks/use-toast';
import { ALL_CHEMICALS, COMMON_CHEMICAL_IDS } from '@/lib/chemical-catalog';
import { ALL_APPARATUS, COMMON_APPARATUS_IDS } from '@/lib/apparatus-catalog';

let logIdCounter = 0;
const getUniqueLogId = () => {
    return `${Date.now()}-${logIdCounter++}`;
};

const initialExperimentState: ExperimentState = {
  title: '',
  equipment: [],
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
  pouringState: { sourceId: string; targetId: string; } | null;
  setSafetyGogglesOn: (on: boolean) => void;
  setExperimentTitle: (title: string) => void;
  handleAddEquipmentToWorkbench: (equipment: Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>) => void;
  handleAddEquipmentToInventory: (equipment: Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>) => void;
  handleRemoveSelectedEquipment: (id: string) => void;
  handleResizeEquipment: (equipmentId: string, size: number) => void;
  handleMoveEquipment: (equipmentId: string, position: { x: number, y: number }) => void;
  handleSelectEquipment: (equipmentId: string | null, e: React.MouseEvent | MouseEvent) => void;
  handleDropOnApparatus: (equipmentId: string) => void;
  handlePickUpEquipment: (id: string, e: React.MouseEvent | MouseEvent) => void;
  handlePour: (volume: number) => void;
  handleInitiatePour: (targetId: string) => void;
  handleCancelPour: () => void;
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
  const [pouringState, setPouringState] = useState<{ sourceId: string; targetId: string; } | null>(null);
  const { toast } = useToast();

  const [inventoryChemicals, setInventoryChemicals] = useState<Chemical[]>([]);
  const [inventoryEquipment, setInventoryEquipment] = useState<Equipment[]>([]);

  const draggedItemRef = useRef<{ id: string; offset: { x: number; y: number } } | null>(null);

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
    
    newState.equipment.forEach(container => {
      if (container.solutions) {
        const newPh = calculatePH(container.solutions);
        container.ph = newPh;
        const indicator = container.solutions.find(s => s.chemical.type === 'indicator')?.chemical;
        if (indicator) {
          const newColor = getIndicatorColor(indicator.id, newPh);
          if (newColor !== container.color) {
            addLog(`Solution color in ${container.name} changed to ${newColor}.`);
          }
          container.color = newColor;
        } else {
          container.color = 'transparent';
        }
      }
    });

    const mainContainer = newState.equipment.find(e => e.type === 'beaker' || e.type === 'erlenmeyer-flask');
    if (mainContainer) {
        newState.ph = mainContainer.ph ?? null;
        newState.color = mainContainer.color ?? 'transparent';
    } else {
        newState.ph = null;
        newState.color = 'transparent';
    }

    return newState;
  }, [addLog]);


  const handleSafetyCheck = useCallback(() => {
    if (!safetyGogglesOn) {
      setTimeout(() => {
        toast({
          title: 'Safety Warning!',
          description: 'Safety is paramount. Please put on your goggles.',
          variant: 'destructive',
        });
      }, 0);
      return false;
    }
    return true;
  }, [safetyGogglesOn, toast]);

  const setExperimentTitle = useCallback((title: string) => {
    setExperimentState(prev => ({ ...prev, title }));
  }, []);
  
  const handleSelectEquipment = useCallback((equipmentId: string | null, e: React.MouseEvent | MouseEvent) => {
    e.stopPropagation();

    // If we are holding equipment and click on another, it's a pour action
    if (heldEquipment && equipmentId && heldEquipment.id !== equipmentId) {
        handleInitiatePour(equipmentId);
        return;
    }

    // Otherwise, it's a selection or drag-start action
    setExperimentState(prevState => {
      const equip = prevState.equipment.find(eq => eq.id === equipmentId);
      if (equip && e.nativeEvent instanceof MouseEvent) {
          const workbenchRect = (e.currentTarget as HTMLElement).closest('.relative.w-full.flex-1')?.getBoundingClientRect();
          if (workbenchRect) {
              draggedItemRef.current = {
                  id: equipmentId!,
                  offset: {
                      x: e.nativeEvent.clientX - workbenchRect.left - equip.position.x,
                      y: e.nativeEvent.clientY - workbenchRect.top - equip.position.y,
                  },
              };
          }
      }
      return {
        ...prevState,
        equipment: prevState.equipment.map(e => ({
          ...e,
          isSelected: e.id === equipmentId,
        })),
      };
    });
  }, [heldEquipment]);

  const handleAddEquipmentToWorkbench = useCallback((equipment: Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>) => {
    if (!handleSafetyCheck()) return;

    setExperimentState((prevState) => {
      addLog(`Added ${equipment.name} to the workbench.`);
      const newEquipment: Equipment = { 
        ...equipment, 
        id: `${equipment.id}-${Date.now()}`,
        size: 1,
        position: { x: 250 + (Math.random() * 50 - 25), y: 100 + (Math.random() * 50 - 25) },
        isSelected: true,
        solutions: [],
        ph: 7,
        color: 'transparent'
      }; 
      return { ...prevState, equipment: [...prevState.equipment.map(e => ({...e, isSelected: false})), newEquipment] };
    });
  }, [addLog, handleSafetyCheck]);

  const handleAddEquipmentToInventory = useCallback((equipment: Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>) => {
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
      
      return {
        ...prevState,
        equipment: newEquipment,
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
        } else if (heldItem.type === 'indicator') {
             if (!equipmentOnWorkbench.solutions) equipmentOnWorkbench.solutions = [];
            equipmentOnWorkbench.solutions.push({ chemical: heldItem, volume: 1 }); // Assume 1ml of indicator
            addLog(`Added ${heldItem.name} indicator to ${equipmentOnWorkbench.name}.`);
        } else if (!canAddChemical) {
            setTimeout(() => toast({ title: 'Invalid Action', description: `${equipmentOnWorkbench.name} already contains a solution.`, variant: 'destructive' }), 0);
        } else {
            setTimeout(() => toast({ title: 'Invalid Action', description: `Cannot add ${heldItem.name} to ${equipmentOnWorkbench.name}.`, variant: 'destructive' }), 0);
        }
        
        handleClearHeldItem();
        return updatePhAndColor(newState);
    });
  }, [addLog, handleSafetyCheck, toast, updatePhAndColor, heldItem]);
  
  const handlePour = useCallback((volume: number) => {
    if (!pouringState) return;
    const { sourceId, targetId } = pouringState;

    setExperimentState(prevState => {
      const source = prevState.equipment.find(e => e.id === sourceId);
      const target = prevState.equipment.find(e => e.id === targetId);

      if (!source || !target || !source.solutions || source.solutions.length === 0) {
        return prevState;
      }
      
      const totalSourceVolume = source.solutions.reduce((t, s) => t + s.volume, 0);
      const pourVolumeClamped = Math.min(volume, totalSourceVolume);

      addLog(`Pouring ${pourVolumeClamped.toFixed(1)}ml from ${source.name} into ${target.name}.`);

      if (!target.solutions) target.solutions = [];
      
      let remainingPourVolume = pourVolumeClamped;
      for (const sourceSolution of source.solutions) {
        const pourFraction = sourceSolution.volume / totalSourceVolume;
        const volToTake = pourFraction * pourVolumeClamped;
        
        const existingTargetSolution = target.solutions.find(s => s.chemical.id === sourceSolution.chemical.id);
        if (existingTargetSolution) {
          existingTargetSolution.volume += volToTake;
        } else {
          target.solutions.push({...sourceSolution, volume: volToTake});
        }
        sourceSolution.volume -= volToTake;
      }
      
      source.solutions = source.solutions.filter(s => s.volume > 0.01);

      const newState = {
        ...prevState,
        equipment: prevState.equipment.map(e => {
          if (e.id === source.id) return source;
          if (e.id === target.id) return target;
          return e;
        })
      };

      setPouringState(null);
      handleClearHeldItem();
      return updatePhAndColor(newState);
    });

  }, [addLog, pouringState, updatePhAndColor]);

  const handleInitiatePour = useCallback((targetId: string) => {
    if (!heldEquipment || heldEquipment.id === targetId) return;
    setPouringState({ sourceId: heldEquipment.id, targetId });
  }, [heldEquipment]);
  
  const handleCancelPour = useCallback(() => {
    setPouringState(null);
  }, []);
  
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

  const handlePickUpEquipment = useCallback((id: string, e: React.MouseEvent | MouseEvent) => {
    e.stopPropagation();
    handleClearHeldItem();
    const equipment = experimentState.equipment.find(e => e.id === id);
    if (equipment && equipment.solutions && equipment.solutions.length > 0) {
      setHeldEquipment(equipment);
      setTimeout(() => {
        toast({
          title: `Holding ${equipment.name}`,
          description: "Click another apparatus to pour.",
        });
      }, 0);
    }
  }, [experimentState.equipment, toast]);

  const handleClearHeldItem = useCallback(() => {
    if (heldItem || heldEquipment) {
      if (heldItem) setHeldItem(null);
      if (heldEquipment) setHeldEquipment(null);
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
        setTimeout(() => toast({ title: 'Error', description: 'Ensure a flask/beaker and a filled burette are on the workbench.', variant: 'destructive' }), 0);
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
    setInventoryChemicals([]);
    setInventoryEquipment([]);
    setLabLogs([]);
    addLog('Experiment reset.');
  }, [addLog]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (draggedItemRef.current) {
            const { id, offset } = draggedItemRef.current;
            const workbench = (e.target as HTMLElement).closest('.relative.w-full.flex-1');
            if (workbench) {
                const rect = workbench.getBoundingClientRect();
                const x = e.clientX - rect.left - offset.x;
                const y = e.clientY - rect.top - offset.y;
                handleMoveEquipment(id, { x, y });
            }
        }
    };

    const handleMouseUp = () => {
        draggedItemRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMoveEquipment]);


  const value = useMemo(() => ({
    experimentState,
    labLogs,
    inventoryChemicals,
    inventoryEquipment,
    safetyGogglesOn,
    heldItem,
    heldEquipment,
    pouringState,
    setSafetyGogglesOn,
    setExperimentTitle,
    handleAddEquipmentToWorkbench,
    handleAddEquipmentToInventory,
    handleRemoveSelectedEquipment,
    handleResizeEquipment,
    handleMoveEquipment,
    handleSelectEquipment,
    handleDropOnApparatus,
    handlePickUpEquipment,
    handlePour,
    handleInitiatePour,
    handleCancelPour,
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
    pouringState,
    setSafetyGogglesOn,
    setExperimentTitle,
    handleAddEquipmentToWorkbench,
    handleAddEquipmentToInventory,
    handleRemoveSelectedEquipment,
    handleResizeEquipment,
    handleMoveEquipment,
    handleSelectEquipment,
    handleDropOnApparatus,
    handlePickUpEquipment,
    handlePour,
    handleInitiatePour,
    handleCancelPour,
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
