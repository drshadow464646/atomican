
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
  handleSelectEquipment: (equipmentId: string | null) => void;
  handleDropOnApparatus: (equipmentId: string) => void;
  handlePickUpEquipment: (id: string) => void;
  handlePour: (volume: number) => void;
  handleInitiatePour: (targetId: string) => void;
  handleCancelPour: () => void;
  handleAddChemicalToInventory: (chemical: Chemical) => void;
  handleTitrate: (volume: number) => void;
  handleAddCustomLog: (note: string) => void;
  handleResetExperiment: () => void;
  handlePickUpChemical: (chemical: Chemical) => void;
  handleClearHeldItem: () => void;
  draggedItemRef: React.RefObject<{ id: string; offset: { x: number, y: number }; hasMoved: boolean }>;
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

  const draggedItemRef = useRef<{ id: string; offset: { x: number; y: number }; hasMoved: boolean; } | null>(null);

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
  
  const handleSelectEquipment = useCallback((equipmentId: string | null) => {
    setExperimentState(prevState => {
        return {
            ...prevState,
            equipment: prevState.equipment.map(e => ({
            ...e,
            isSelected: e.id === equipmentId,
            })),
        };
    });
  }, []);

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
  }, [inventoryEquipment]);
  
  const handleRemoveSelectedEquipment = useCallback((id: string) => {
    setExperimentState(prevState => {
      const equipmentToRemove = prevState.equipment.find(e => e.id === id);
      if (!equipmentToRemove) return prevState;

      addLog(`Removed ${equipmentToRemove.name} from the workbench.`);
      
      const newEquipment = prevState.equipment.filter(e => e.id !== id);
      
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

  const handleClearHeldItem = useCallback(() => {
    setHeldItem(null);
    setHeldEquipment(null);
  }, []);

  const handleDropOnApparatus = useCallback((equipmentId: string) => {
    if (!handleSafetyCheck() || !heldItem) return;

    setExperimentState(prevState => {
        const equipmentOnWorkbench = prevState.equipment.find(e => e.id === equipmentId);
        if (!equipmentOnWorkbench) return prevState;

        const canAddChemical = !equipmentOnWorkbench.solutions || equipmentOnWorkbench.solutions.length === 0;

        if (heldItem.type === 'indicator') {
            const newState = {...prevState};
            if (!equipmentOnWorkbench.solutions) equipmentOnWorkbench.solutions = [];
            equipmentOnWorkbench.solutions.push({ chemical: heldItem, volume: 1 }); // Assume 1ml of indicator
            addLog(`Added ${heldItem.name} indicator to ${equipmentOnWorkbench.name}.`);
            handleClearHeldItem();
            return updatePhAndColor(newState);
        } else if ((heldItem.type === 'acid' || heldItem.type === 'base') && canAddChemical) {
            setPouringState({ sourceId: 'inventory', targetId: equipmentId });
        } else if (!canAddChemical) {
            setTimeout(() => toast({ title: 'Invalid Action', description: `${equipmentOnWorkbench.name} already contains a solution.`, variant: 'destructive' }), 0);
            handleClearHeldItem();
        } else {
            setTimeout(() => toast({ title: 'Invalid Action', description: `Cannot add ${heldItem.name} to ${equipmentOnWorkbench.name}.`, variant: 'destructive' }), 0);
            handleClearHeldItem();
        }
        
        return prevState;
    });
  }, [addLog, handleSafetyCheck, toast, updatePhAndColor, heldItem, handleClearHeldItem]);
  
  const handlePour = useCallback((volume: number) => {
    if (!pouringState) return;
    const { sourceId, targetId } = pouringState;

    setExperimentState(prevState => {
      let newState = {...prevState};
      const target = newState.equipment.find(e => e.id === targetId);
      if (!target) {
        setPouringState(null);
        return prevState;
      }
      
      if (!target.solutions) target.solutions = [];

      if (sourceId === 'inventory') {
          if (!heldItem) return prevState;
          const pourVolumeClamped = Math.min(volume, target.volume || volume);
          target.solutions = [{ chemical: heldItem, volume: pourVolumeClamped }];
          addLog(`Added ${pourVolumeClamped.toFixed(1)}ml of ${heldItem.name} to ${target.name}.`);

      } else {
        const source = newState.equipment.find(e => e.id === sourceId);
        if (!source || !source.solutions || source.solutions.length === 0) {
            setPouringState(null);
            return prevState;
        }

        const totalSourceVolume = source.solutions.reduce((t, s) => t + s.volume, 0);
        const pourVolumeClamped = Math.min(volume, totalSourceVolume);
        addLog(`Pouring ${pourVolumeClamped.toFixed(1)}ml from ${source.name} into ${target.name}.`);

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
      }

      newState = {
        ...newState,
        equipment: newState.equipment.map(e => e.id === target.id ? target : e)
      };

      setPouringState(null);
      handleClearHeldItem();
      return updatePhAndColor(newState);
    });

  }, [addLog, pouringState, updatePhAndColor, heldItem, handleClearHeldItem]);

  const handleInitiatePour = useCallback((targetId: string) => {
    if (!heldEquipment || heldEquipment.id === targetId) return;
    const target = experimentState.equipment.find(e => e.id === targetId);
    if (!target) return;
    
    // Only allow pouring into certain types of containers
    const validTargets = ['beaker', 'erlenmeyer-flask', 'graduated-cylinder', 'volumetric-flask', 'test-tube'];
    if (validTargets.includes(target.type)) {
       setPouringState({ sourceId: heldEquipment.id, targetId });
    } else {
        setTimeout(() => toast({ title: 'Invalid Action', description: `You cannot pour into a ${target.name}.`, variant: 'destructive' }), 0);
        handleClearHeldItem();
    }
  }, [heldEquipment, experimentState.equipment, toast, handleClearHeldItem]);
  
  const handleCancelPour = useCallback(() => {
    setPouringState(null);
    handleClearHeldItem();
  }, [handleClearHeldItem]);
  
  const handlePickUpChemical = useCallback((chemical: Chemical) => {
    if (pouringState) return;
    handleClearHeldItem();
    setHeldItem(chemical);
  }, [pouringState, handleClearHeldItem]);

  const handlePickUpEquipment = useCallback((id: string) => {
    if(pouringState) return;

    handleClearHeldItem();
    const equipment = experimentState.equipment.find(e => e.id === id);
    if (equipment && equipment.solutions && equipment.solutions.length > 0) {
      setHeldEquipment(equipment);
    }
  }, [experimentState.equipment, pouringState, handleClearHeldItem]);

  const handleAddChemicalToInventory = useCallback((chemical: Chemical) => {
    if (inventoryChemicals.find((c) => c.id === chemical.id)) {
        return;
    }
    setInventoryChemicals(prev => [...prev, chemical]);
  }, [inventoryChemicals]);
  
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
        if (draggedItemRef.current && draggedItemRef.current.id) {
            if (!draggedItemRef.current.hasMoved && e.buttons === 1) {
              // Check for small movements to differentiate click from drag
              const startX = draggedItemRef.current.offset.x;
              const startY = draggedItemRef.current.offset.y;
              if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
                  draggedItemRef.current.hasMoved = true;
              }
            }

            if (draggedItemRef.current.hasMoved) {
              const { id, offset } = draggedItemRef.current;
              const workbench = (e.target as HTMLElement).closest('.relative.w-full.flex-1');
              if (workbench) {
                  const rect = workbench.getBoundingClientRect();
                  const x = e.clientX - rect.left - offset.x;
                  const y = e.clientY - rect.top - offset.y;
                  handleMoveEquipment(id, { x, y });
              }
            }
        }
    };

    const handleMouseUp = () => {
        if (draggedItemRef.current && !draggedItemRef.current.hasMoved) {
            const id = draggedItemRef.current.id;
            // It's a click, not a drag. Now decide what to do.
            if (heldItem) {
                handleDropOnApparatus(id);
            } else if (heldEquipment) {
                if (heldEquipment.id !== id) {
                    handleInitiatePour(id);
                } else {
                    handleClearHeldItem(); // Clicked on the item already being held
                }
            } else {
                handlePickUpEquipment(id);
            }
        }
        draggedItemRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMoveEquipment, heldItem, heldEquipment, handleDropOnApparatus, handleInitiatePour, handlePickUpEquipment, handleClearHeldItem]);


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
    draggedItemRef,
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
