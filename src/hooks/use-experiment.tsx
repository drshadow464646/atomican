

'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ExperimentState, LabLog, Chemical, Equipment, Solution, ReactionPrediction } from '@/lib/experiment';
import { useToast } from '@/hooks/use-toast';
import { getReactionPrediction } from '@/app/actions';

let logIdCounter = 0;
const getUniqueLogId = () => {
    return `${Date.now()}-${logIdCounter++}`;
};

let equipmentIdCounter = 0;

const initialExperimentState: ExperimentState = {
  title: 'Untitled Experiment',
  equipment: [],
  volumeAdded: 0,
  ph: null,
  color: 'transparent',
};

type DragState = { 
  id: string; 
  offset: { x: number; y: number; }; 
  hasMoved: boolean; 
} | null;


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
  dragState: React.RefObject<DragState>;
  handleDragStart: (id: string, e: React.MouseEvent) => void;
  handleWorkbenchClick: (e: React.MouseEvent) => void;
  handleEquipmentClick: (id: string, e: React.MouseEvent) => void;
  handleMouseUpOnEquipment: (id: string) => void;
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

  const dragState = useRef<DragState>(null);
  const mouseDownTimer = useRef<NodeJS.Timeout | null>(null);

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
  
  const applyReactionPrediction = (containerId: string, prediction: ReactionPrediction) => {
    setExperimentState(prevState => {
        const newState = { ...prevState };
        const container = newState.equipment.find(e => e.id === containerId);
        if (!container) return prevState;

        container.isReacting = false; // Turn off analyzing state
        container.solutions = prediction.products;
        container.ph = prediction.ph;
        container.color = prediction.color;
        container.reactionEffects = {
            gas: prediction.gasProduced || undefined,
            precipitate: prediction.precipitateFormed || undefined,
            isExplosive: prediction.isExplosive,
            equation: prediction.equation,
            description: prediction.description,
            key: Date.now(), // new key to trigger animation
        };

        addLog(`Reaction in ${container.name}: ${prediction.description}`);
        if(prediction.isExplosive) {
             toast({ title: 'DANGER!', description: 'The reaction is explosive!', variant: 'destructive' });
        }

        return { ...newState, equipment: [...newState.equipment] };
    });
  };


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
    if (pouringState) return;
    setExperimentState(prevState => {
        if (heldEquipment && equipmentId !== heldEquipment.id) {
            return prevState;
        }
        return {
            ...prevState,
            equipment: prevState.equipment.map(e => ({
            ...e,
            isSelected: e.id === equipmentId,
            })),
        };
    });
  }, [heldEquipment, pouringState]);

  const handleAddEquipmentToWorkbench = useCallback((equipment: Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>) => {
    if (!handleSafetyCheck()) return;

    setExperimentState((prevState) => {
      addLog(`Added ${equipment.name} to the workbench.`);
      equipmentIdCounter++;
      const newEquipment: Equipment = { 
        ...equipment, 
        id: `${equipment.id}-${equipmentIdCounter}`,
        size: 1,
        position: { x: 250 + (Math.random() * 50 - 25), y: 100 + (Math.random() * 50 - 25) },
        isSelected: true,
        solutions: [],
        ph: 7,
        color: 'transparent',
        isReacting: false,
      }; 
      return { ...prevState, equipment: [...prevState.equipment.map(e => ({...e, isSelected: false})), newEquipment] };
    });
  }, [addLog, handleSafetyCheck]);

  const handleAddEquipmentToInventory = useCallback((equipment: Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>) => {
    if (inventoryEquipment.some((e) => e.id === equipment.id)) {
      return;
    }
    const newInventoryItem: Equipment = {
        ...equipment,
        position: { x: 0, y: 0 },
        size: 1,
        isSelected: false,
        solutions: [],
        isReacting: false,
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
  
  const handleCancelPour = useCallback(() => {
    setPouringState(null);
    handleClearHeldItem();
  }, [handleClearHeldItem]);

  const handleDropOnApparatus = useCallback((equipmentId: string) => {
    if (!handleSafetyCheck() || !heldItem) return;
    setPouringState({ sourceId: 'inventory', targetId: equipmentId });
  }, [handleSafetyCheck, heldItem]);
  
  const handlePour = useCallback(async (volume: number) => {
    if (!pouringState) return;
    const { sourceId, targetId } = pouringState;

    const target = experimentState.equipment.find(e => e.id === targetId);
    if (!target) {
        setPouringState(null);
        return;
    }

    const currentTargetVolume = target.solutions.reduce((acc, s) => acc + s.volume, 0);
    const availableCapacity = (target.volume || Infinity) - currentTargetVolume;
    const pourVolumeClamped = Math.min(volume, availableCapacity);

    if (pourVolumeClamped <= 0) {
        toast({ title: 'Container Full', description: `${target.name} cannot hold any more liquid.`, variant: 'destructive' });
        setPouringState(null);
        handleClearHeldItem();
        return;
    }

    let reactants: Solution[] = [...(target.solutions || [])];
    let sourceVolumeToAdjust = 0;
    
    if (sourceId === 'inventory') {
        if (!heldItem) return;
        addLog(`Adding ${pourVolumeClamped.toFixed(1)}ml of ${heldItem.name} to ${target.name}.`);
        reactants.push({ chemical: heldItem, volume: pourVolumeClamped });
    } else {
        const source = experimentState.equipment.find(e => e.id === sourceId);
        if (!source || !source.solutions) return;

        const sourceVolume = source.solutions.reduce((t, s) => t + s.volume, 0);
        if (sourceVolume <= 0) {
             toast({ title: 'Cannot Pour', description: `${source.name} is empty.`, variant: 'destructive' });
             setPouringState(null);
             return;
        }

        sourceVolumeToAdjust = Math.min(pourVolumeClamped, sourceVolume);
        const pourFraction = sourceVolumeToAdjust / sourceVolume;
        addLog(`Pouring ${sourceVolumeToAdjust.toFixed(1)}ml from ${source.name} to ${target.name}.`);
        
        for (const sol of source.solutions) {
            reactants.push({ ...sol, volume: sol.volume * pourFraction });
        }
    }
    
    setPouringState(null);
    handleClearHeldItem();
    addLog('Analyzing reaction...');
    
    setExperimentState(prevState => ({
      ...prevState,
      equipment: prevState.equipment.map(e => e.id === targetId ? {...e, isReacting: true} : e)
    }));

    const prediction = await getReactionPrediction(reactants);
    
    applyReactionPrediction(targetId, prediction);

    if (sourceId !== 'inventory') {
        setExperimentState(prevState => {
            const newState = { ...prevState };
            const sourceToUpdate = newState.equipment.find(e => e.id === sourceId);
            if (!sourceToUpdate || !sourceToUpdate.solutions) return prevState;

            const originalSourceVolume = sourceToUpdate.solutions.reduce((t, s) => t + s.volume, 0);
            if (originalSourceVolume > 0) {
                const fractionToRemove = sourceVolumeToAdjust / originalSourceVolume;
                sourceToUpdate.solutions = sourceToUpdate.solutions.map(s => ({
                    ...s,
                    volume: s.volume * (1 - fractionToRemove)
                })).filter(s => s.volume > 0.01);
            }
            
            const remainingSourceVolume = sourceToUpdate.solutions.reduce((t, s) => t + s.volume, 0);
            if (remainingSourceVolume > 0.01) {
              sourceToUpdate.ph = calculatePH(sourceToUpdate.solutions);
              sourceToUpdate.color = 'transparent'; // Simplified
            } else {
              sourceToUpdate.ph = 7;
              sourceToUpdate.color = 'transparent';
              sourceToUpdate.solutions = [];
            }

            return {
                ...newState,
                equipment: newState.equipment.map(e => e.id === sourceId ? { ...sourceToUpdate } : e)
            };
        });
    }

  }, [addLog, pouringState, experimentState.equipment, heldItem, handleClearHeldItem, toast]);

  const handleInitiatePour = useCallback((targetId: string) => {
    if (!heldEquipment || heldEquipment.id === targetId) return;
    const target = experimentState.equipment.find(e => e.id === targetId);
    if (!target) return;
    
    const validTargets = ['beaker', 'erlenmeyer-flask', 'graduated-cylinder', 'volumetric-flask', 'test-tube'];
    if (validTargets.includes(target.type)) {
       setPouringState({ sourceId: heldEquipment.id, targetId });
    } else {
        setTimeout(() => toast({ title: 'Invalid Action', description: `You cannot pour into a ${target.name}.`, variant: 'destructive' }), 0);
    }
    handleClearHeldItem();
  }, [heldEquipment, experimentState.equipment, toast, handleClearHeldItem]);
  
  const handlePickUpChemical = useCallback((chemical: Chemical) => {
    if (pouringState) return;
    handleClearHeldItem();
    setHeldItem(chemical);
  }, [pouringState, handleClearHeldItem]);

  const handlePickUpEquipment = useCallback((id: string) => {
    const equipment = experimentState.equipment.find(e => e.id === id);
    if (!equipment || equipment.isReacting) return;
    
    handleClearHeldItem();
    handleSelectEquipment(id);
    
    const validPouringEquipment = ['beaker', 'erlenmeyer-flask', 'graduated-cylinder', 'volumetric-flask', 'test-tube'];
    if (equipment.solutions && equipment.solutions.length > 0 && validPouringEquipment.includes(equipment.type)) {
      setHeldEquipment(equipment);
    }
  }, [experimentState.equipment, handleClearHeldItem, handleSelectEquipment]);

  const handleAddChemicalToInventory = useCallback((chemical: Chemical) => {
    if (inventoryChemicals.some((c) => c.id === chemical.id)) {
        return;
    }
    setInventoryChemicals(prev => [...prev, chemical]);
  }, [inventoryChemicals]);
  
  const handleTitrate = useCallback(async (volume: number) => {
    if (!handleSafetyCheck()) return;
    
    const burette = experimentState.equipment.find(e => e.type === 'burette');
    const beaker = experimentState.equipment.find(e => e.type === 'beaker' || e.type === 'erlenmeyer-flask');

    if (!beaker || !burette || !burette.solutions || burette.solutions.length === 0) {
      toast({ title: 'Error', description: 'Ensure a flask/beaker and a filled burette are on the workbench.', variant: 'destructive' });
      return;
    }
    
    const titrantSolution = burette.solutions[0];
    const volumeToPour = Math.min(volume, titrantSolution.volume);

    if (volumeToPour <= 0) {
      toast({ title: 'Notice', description: 'Burette is empty.' });
      return;
    }

    const reactants = [
        ...(beaker.solutions || []),
        { chemical: titrantSolution.chemical, volume: volumeToPour }
    ];

    addLog(`Adding ${volumeToPour.toFixed(1)}ml of ${titrantSolution.chemical.name} via burette. Analyzing reaction...`);
    
    setExperimentState(prevState => ({
        ...prevState,
        equipment: prevState.equipment.map(e => e.id === beaker.id ? {...e, isReacting: true} : e)
    }));

    const prediction = await getReactionPrediction(reactants);
    applyReactionPrediction(beaker.id, prediction);

    setExperimentState(prevState => {
        const newBuretteState = { ...prevState };
        const newBurette = newBuretteState.equipment.find(e => e.id === burette.id);
        if (newBurette && newBurette.solutions && newBurette.solutions.length > 0) {
            newBurette.solutions[0].volume -= volumeToPour;
            if (newBurette.solutions[0].volume < 0.01) {
                newBurette.solutions = [];
            }
        }
        return { ...newBuretteState, equipment: newBuretteState.equipment.map(e => e.id === burette.id ? {...newBurette} : e) };
    });

  }, [addLog, handleSafetyCheck, toast, experimentState.equipment]);


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
    handleClearHeldItem();
    setPouringState(null);
    addLog('Experiment reset.');
  }, [addLog, handleClearHeldItem]);
  
  const handleDragStart = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (mouseDownTimer.current) clearTimeout(mouseDownTimer.current);
    mouseDownTimer.current = setTimeout(() => {
        if (!dragState.current?.hasMoved) {
            handlePickUpEquipment(id);
        }
    }, 200);
    
    const equip = experimentState.equipment.find(eq => eq.id === id);
    if (equip && e.button === 0) {
        const workbenchEl = (e.target as HTMLElement).closest('.relative.w-full.flex-1');
        if (!workbenchEl) return;
        const rect = workbenchEl.getBoundingClientRect();
        dragState.current = {
            id,
            offset: {
                x: e.clientX - rect.left - equip.position.x,
                y: e.clientY - rect.top - equip.position.y,
            },
            hasMoved: false,
        };
    }
  }, [experimentState.equipment, handlePickUpEquipment]);
  
  const handleWorkbenchClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'lab-slab') {
      handleSelectEquipment(null);
      if(heldEquipment || heldItem) {
        handleClearHeldItem();
      }
    }
  }, [heldItem, heldEquipment, handleClearHeldItem, handleSelectEquipment]);
  
  const handleEquipmentClick = useCallback((id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (dragState.current?.hasMoved) {
          return;
      }
      
      if (heldItem) {
          handleDropOnApparatus(id);
          return;
      }
      
      handleSelectEquipment(id);

  }, [dragState, heldItem, handleDropOnApparatus, handleSelectEquipment]);

  const handleMouseUpOnEquipment = useCallback((id: string) => {
    if (mouseDownTimer.current) {
        clearTimeout(mouseDownTimer.current);
        mouseDownTimer.current = null;
    }
    
    if (heldEquipment && heldEquipment.id !== id) {
        handleInitiatePour(id);
    } else if (heldEquipment && heldEquipment.id === id) {
        handleClearHeldItem();
    }
  }, [heldEquipment, handleInitiatePour, handleClearHeldItem]);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (dragState.current && !heldEquipment) {
            const item = dragState.current;
            const workbench = document.getElementById('lab-slab')?.parentElement;
            if (workbench) {
                const rect = workbench.getBoundingClientRect();
                const newX = e.clientX - rect.left - item.offset.x;
                const newY = e.clientY - rect.top - item.offset.y;
                
                const currentPos = experimentState.equipment.find(eq=>eq.id===item.id)?.position;
                
                if (!item.hasMoved && currentPos && (Math.abs(newX - currentPos.x) > 5 || Math.abs(newY - currentPos.y) > 5)) {
                    item.hasMoved = true;
                     if (mouseDownTimer.current) {
                        clearTimeout(mouseDownTimer.current);
                        mouseDownTimer.current = null;
                    }
                    handleClearHeldItem();
                }

                if (item.hasMoved) {
                  handleMoveEquipment(item.id, { x: newX, y: newY });
                }
            }
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (dragState.current?.hasMoved) {
            handleSelectEquipment(dragState.current.id);
        }
        dragState.current = null;
         if (mouseDownTimer.current) {
            clearTimeout(mouseDownTimer.current);
        }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
         if (mouseDownTimer.current) {
            clearTimeout(mouseDownTimer.current);
        }
    };
  }, [handleMoveEquipment, experimentState.equipment, handleSelectEquipment, heldEquipment, handleClearHeldItem]);
  
  // A local pH calculation function as a fallback/helper
  const calculatePH = (solutions: Solution[]): number => {
      if (!solutions || solutions.length === 0) return 7;

      let molesH = 0;
      let molesOH = 0;
      let totalVolumeL = 0;

      for (const solution of solutions) {
          if (solution.chemical.type === 'indicator') continue;
          const volumeL = solution.volume / 1000;
          totalVolumeL += volumeL;
          if (solution.chemical.type === 'acid' && solution.chemical.concentration) {
              molesH += volumeL * solution.chemical.concentration;
          } else if (solution.chemical.type === 'base' && solution.chemical.concentration) {
              molesOH += volumeL * solution.chemical.concentration;
          }
      }

      if (totalVolumeL === 0) return 7;

      if (molesH > molesOH) {
          const remainingMolesH = molesH - molesOH;
          const concentrationH = remainingMolesH / totalVolumeL;
          return concentrationH > 0 ? -Math.log10(concentrationH) : 7;
      } else if (molesOH > molesH) {
          const remainingMolesOH = molesOH - molesH;
          const concentrationOH = remainingMolesOH / totalVolumeL;
          const pOH = concentrationOH > 0 ? -Math.log10(concentrationOH) : 7;
          return 14 - pOH;
      } else {
          return 7; // Equivalence point
      }
  };


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
    dragState,
    handleDragStart,
    handleWorkbenchClick,
    handleEquipmentClick,
    handleMouseUpOnEquipment,
  }), [
    experimentState, 
    labLogs, 
    inventoryChemicals, 
    inventoryEquipment, 
    safetyGogglesOn,
    heldItem,
    heldEquipment,
    pouringState,
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
    dragState,
    handleDragStart,
    handleWorkbenchClick,
    handleEquipmentClick,
    handleMouseUpOnEquipment
  ]);

  return (
    <ExperimentContext.Provider value={value}>
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperiment() {
  const context = useContext<ExperimentContextType | undefined>(ExperimentContext);
  if (context === undefined) {
    throw new Error('useExperiment must be used within an ExperimentProvider');
  }
  return context;
}

    

    