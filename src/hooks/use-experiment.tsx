
'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ExperimentState, LabLog, Chemical, Equipment, Solution, ReactionPrediction, EquipmentConnection } from '@/lib/experiment';
import { useToast } from '@/hooks/use-toast';
import { getReactionPrediction } from '@/app/actions';
import { useInventory } from './use-inventory';

let logIdCounter = 0;
const getUniqueLogId = () => {
    return `${Date.now()}-${logIdCounter++}`;
};

let equipmentIdCounter = 0;
let connectionIdCounter = 0;

const initialExperimentState: ExperimentState = {
  equipment: [],
  connections: [],
  volumeAdded: 0,
  ph: null,
  color: 'transparent',
};

type AttachmentState = {
    sourceId: string;
} | null;

type ExperimentContextType = {
  experimentState: ExperimentState;
  labLogs: LabLog[];
  heldEquipment: Equipment | null;
  pouringState: { sourceId: string; targetId: string; } | null;
  setPouringState: React.Dispatch<React.SetStateAction<{ sourceId: string; targetId: string; } | null>>;
  attachmentState: AttachmentState;
  setAttachmentState: React.Dispatch<React.SetStateAction<AttachmentState>>;
  
  handleResetWorkbench: () => void;
  addLog: (text: string, isCustom?: boolean) => void;
  handleAddEquipmentToWorkbench: (equipment: Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>) => void;
  handleRemoveSelectedEquipment: (id: string) => void;
  handleResizeEquipment: (equipmentId: string, size: number) => void;
  handleMoveEquipment: (equipmentId: string, position: { x: number, y: number }) => void;
  handleSelectEquipment: (equipmentId: string | null, append?: boolean) => void;
  handleDropOnApparatus: (equipmentId: string) => void;
  handlePickUpEquipment: (id: string) => void;
  handlePour: (volume: number) => void;
  handleTitrate: (volume: number) => void;
  handleClearHeldItem: () => void;
  handleDetach: (equipmentId: string) => void;
  handleInitiateAttachment: (sourceId: string) => void;
  onRemoveConnection: (connectionId: string) => void;

  onTitrate: (volume: number) => void; // for workbench

  // From InventoryContext
  inventory: {
    chemicals: Chemical[];
    equipment: Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>[];
    heldItem: Chemical | null;
    clearHeldItem: () => void;
    pickUpChemical: (chemical: Chemical) => void;
  },
  safetyGogglesOn: boolean;
};

const ExperimentContext = createContext<ExperimentContextType | undefined>(undefined);

export function ExperimentProvider({ children }: { children: React.ReactNode }) {
  const inventoryContext = useInventory();
  
  const [labLogs, setLabLogs] = useState<LabLog[]>([]);
  const [experimentState, setExperimentState] = useState<ExperimentState>(initialExperimentState);
  const [heldEquipment, setHeldEquipment] = useState<Equipment | null>(null);
  const [pouringState, setPouringState] = useState<{ sourceId: string; targetId: string; } | null>(null);
  const [attachmentState, setAttachmentState] = useState<AttachmentState>(null);
  const { toast } = useToast();

  const addLog = useCallback((text: string, isCustom: boolean = false) => {
    const newLog: LabLog = {
      id: getUniqueLogId(),
      timestamp: new Date().toISOString(),
      text,
      isCustom,
    };
    setLabLogs(prevLogs => [...prevLogs, newLog]);
  }, []);

  const handleResetWorkbench = useCallback(() => {
    setExperimentState(initialExperimentState);
    setHeldEquipment(null);
    setPouringState(null);
    setAttachmentState(null);
    addLog('Workbench has been cleared.');
  }, [addLog]);

  useEffect(() => {
    const resetListener = () => handleResetWorkbench();
    window.addEventListener('reset-workbench', resetListener);
    return () => window.removeEventListener('reset-workbench', resetListener);
  }, [handleResetWorkbench]);
  
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
            temperatureChange: prediction.temperatureChange,
            key: Date.now(),
        };

        addLog(`Reaction in ${container.name}: ${prediction.description}`);
        if(prediction.isExplosive) {
             toast({ title: 'DANGER!', description: 'The reaction is explosive!', variant: 'destructive' });
        }

        if (container.attachments) {
            container.attachments = container.attachments.map(instrument => {
                if (instrument.type === 'thermometer') {
                    return { ...instrument, measuredTemp: 20 + (container.reactionEffects?.temperatureChange ?? 0) };
                }
                if (instrument.type === 'ph-meter') {
                    return { ...instrument, measuredPh: container.ph };
                }
                return instrument;
            });
        }

        return { ...newState, equipment: [...newState.equipment] };
    });
  };

  const handleSafetyCheck = useCallback(() => {
    if (!inventoryContext.safetyGogglesOn) {
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
  }, [inventoryContext.safetyGogglesOn, toast]);

  const handleClearHeldItem = useCallback(() => {
    inventoryContext.handleClearHeldItem();
    setHeldEquipment(null);
  }, [inventoryContext]);
  
  const handleSelectEquipment = useCallback((equipmentId: string | null, append: boolean = false) => {
    if (attachmentState && equipmentId) {
        if (attachmentState.sourceId === equipmentId) {
            setAttachmentState(null); 
            return;
        }
        connectionIdCounter++;
        const newConnection: EquipmentConnection = {
            id: `conn-${connectionIdCounter}`,
            from: attachmentState.sourceId,
            to: equipmentId,
        };
        setExperimentState(prevState => ({
            ...prevState,
            connections: [...prevState.connections, newConnection],
        }));
        const sourceName = experimentState.equipment.find(e => e.id === attachmentState.sourceId)?.name;
        const targetName = experimentState.equipment.find(e => e.id === equipmentId)?.name;
        addLog(`Connected ${sourceName} to ${targetName}.`);
        setAttachmentState(null);
        return;
    }

    setExperimentState(prevState => ({
        ...prevState,
        equipment: prevState.equipment.map(e => ({
            ...e,
            isSelected: append ? (e.isSelected || e.id === equipmentId) : e.id === equipmentId,
        })),
    }));
  }, [attachmentState, addLog, experimentState.equipment]);

  const handleAddEquipmentToWorkbench = useCallback((equipment: Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>) => {
    if (!handleSafetyCheck()) return;

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
      attachments: [],
    }; 
    setExperimentState((prevState) => {
      return { ...prevState, equipment: [...prevState.equipment.map(e => ({...e, isSelected: false})), newEquipment], connections: prevState.connections };
    });
  }, [addLog, handleSafetyCheck]);
  
  const handleRemoveSelectedEquipment = useCallback((id: string) => {
    setExperimentState(prevState => {
      const allEquipment = [...prevState.equipment, ...prevState.equipment.flatMap(e => e.attachments || [])];
      const equipmentToRemove = allEquipment.find(e => e.id === id);
      if (!equipmentToRemove) return prevState;

      addLog(`Removed ${equipmentToRemove.name} from the workbench.`);
      
      const newEquipment = prevState.equipment.filter(e => e.id !== id).map(e => ({
          ...e,
          attachments: e.attachments?.filter(att => att.id !== id)
      }));

      const newConnections = prevState.connections.filter(c => c.from !== id && c.to !== id);
      
      return {
        ...prevState,
        equipment: newEquipment,
        connections: newConnections,
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
  
  const handleDropOnApparatus = useCallback((targetId: string) => {
    if (!handleSafetyCheck()) return;

    const targetContainer = experimentState.equipment.find(e => e.id === targetId);
    if (!targetContainer) return;

    if (inventoryContext.heldItem) {
        setPouringState({ sourceId: 'inventory', targetId: targetId });
    } else if (heldEquipment) {
        const attachmentTypes = ['thermometer', 'ph-meter', 'clamp'];
        if (attachmentTypes.includes(heldEquipment.type)) {
            const canAttachTo = ['beaker', 'erlenmeyer-flask', 'graduated-cylinder', 'volumetric-flask', 'stand', 'test-tube', 'clamp'];
            if (canAttachTo.includes(targetContainer.type)) {
                setExperimentState(prevState => {
                    const equipmentToAttach = { ...heldEquipment, attachedTo: targetId, isSelected: false };
                    
                    if (equipmentToAttach.type === 'thermometer') {
                        equipmentToAttach.attachmentPoint = {x: (targetContainer.size * 35), y: 0};
                        equipmentToAttach.measuredTemp = 20 + (targetContainer.reactionEffects?.temperatureChange ?? 0);
                        addLog(`Attached ${equipmentToAttach.name} to ${targetContainer.name}.`);
                    } else if (equipmentToAttach.type === 'ph-meter') {
                        equipmentToAttach.attachmentPoint = {x: (targetContainer.size * 35), y: 0};
                        equipmentToAttach.measuredPh = targetContainer.ph;
                        addLog(`Attached ${equipmentToAttach.name} to ${targetContainer.name}.`);
                    } else if (equipmentToAttach.type === 'clamp' && targetContainer.type === 'stand') {
                         equipmentToAttach.attachmentPoint = {x: 20, y: 50};
                         addLog(`Attached ${equipmentToAttach.name} to ${targetContainer.name}.`);
                    } else if (targetContainer.type === 'clamp') {
                         addLog(`Attached ${equipmentToAttach.name} to ${targetContainer.name}.`);
                    }

                    const newEquipment = prevState.equipment.filter(e => e.id !== equipmentToAttach.id);
                    
                    const updatedEquipment = newEquipment.map(e => {
                        if (e.id === targetId) {
                            return { ...e, attachments: [...(e.attachments || []), equipmentToAttach], isSelected: true };
                        }
                        return {...e, isSelected: false};
                    });
                    
                    return { ...prevState, equipment: updatedEquipment };
                });
                handleClearHeldItem();
            }
        } else {
             if (!heldEquipment || heldEquipment.id === targetId) return;
             const target = experimentState.equipment.find(e => e.id === targetId);
             if (!target) return;
             setPouringState({ sourceId: heldEquipment.id, targetId: targetId });
             handleClearHeldItem();
        }
    }
}, [handleSafetyCheck, inventoryContext.heldItem, heldEquipment, experimentState.equipment, toast, addLog, handleClearHeldItem]);

  const handlePour = useCallback((volume: number) => {
    if (!pouringState) return;
    const { sourceId, targetId } = pouringState;

    let pouredSolutions: Solution[] = [];
    let allReactants: Solution[] = [];
    
    setExperimentState(prevState => {
      const newState = { ...prevState };
      const target = newState.equipment.find(e => e.id === targetId);
      if (!target) return prevState;

      const currentTargetVolume = target.solutions.reduce((acc, s) => acc + s.volume, 0);
      const availableCapacity = (target.volume || Infinity) - currentTargetVolume;
      const pourVolumeClamped = Math.min(volume, availableCapacity);

      if (pourVolumeClamped <= 0) {
        toast({ title: 'Container Full', description: `${target.name} cannot hold any more liquid.`, variant: 'destructive' });
        return prevState;
      }

      if (sourceId === 'inventory') {
        if (!inventoryContext.heldItem) return prevState;
        addLog(`Adding ${pourVolumeClamped.toFixed(1)}ml of ${inventoryContext.heldItem.name} to ${target.name}.`);
        pouredSolutions = [{ chemical: inventoryContext.heldItem, volume: pourVolumeClamped }];
      } else {
        const source = newState.equipment.find(e => e.id === sourceId);
        if (!source || !source.solutions) return prevState;
        
        const sourceVolume = source.solutions.reduce((t, s) => t + s.volume, 0);
        if (sourceVolume <= 0) {
          toast({ title: 'Cannot Pour', description: `${source.name} is empty.`, variant: 'destructive' });
          return prevState;
        }

        const sourceVolumeToAdjust = Math.min(pourVolumeClamped, sourceVolume);
        const pourFraction = sourceVolumeToAdjust / sourceVolume;
        addLog(`Pouring ${sourceVolumeToAdjust.toFixed(1)}ml from ${source.name} to ${target.name}.`);

        pouredSolutions = source.solutions.map(sol => ({ ...sol, volume: sol.volume * pourFraction }));
        
        source.solutions = source.solutions.map(s => ({
            ...s,
            volume: s.volume * (1 - pourFraction)
        })).filter(s => s.volume > 0.01);
        
        if (source.solutions.length === 0) {
            source.color = 'transparent';
            source.ph = 7;
        }
      }

      for (const pouredSol of pouredSolutions) {
        const existingSol = target.solutions.find(s => s.chemical.id === pouredSol.chemical.id);
        if (existingSol) {
          existingSol.volume += pouredSol.volume;
        } else {
          target.solutions.push(pouredSol);
        }
      }
      
      allReactants = [...target.solutions];
      target.isReacting = true;
      return { ...newState };
    });
    
    setPouringState(null);
    handleClearHeldItem();
    
    if (allReactants.length > 0) {
      addLog('Analyzing reaction...');
      getReactionPrediction(allReactants).then(prediction => {
        applyReactionPrediction(targetId, prediction);
      });
    } else {
       // This can happen if pouring into an empty container from an empty one.
       // We should still turn off the reacting state.
       setExperimentState(prevState => {
         const equipment = prevState.equipment.find(e => e.id === targetId);
         if (equipment) equipment.isReacting = false;
         return {...prevState};
       });
    }

  }, [addLog, pouringState, inventoryContext.heldItem, toast, handleClearHeldItem]);
  
  const handlePickUpEquipment = useCallback((id: string) => {
    const allEquipment = [...experimentState.equipment, ...experimentState.equipment.flatMap(e => e.attachments || [])];
    const equipment = allEquipment.find(e => e.id === id);
    if (!equipment || equipment.isReacting) return;
    
    handleClearHeldItem();
    
    const validPouringEquipment = ['beaker', 'erlenmeyer-flask', 'graduated-cylinder', 'volumetric-flask', 'test-tube', 'thermometer', 'ph-meter', 'clamp'];
    if ((equipment.solutions && equipment.solutions.length > 0) || validPouringEquipment.includes(equipment.type)) {
      setHeldEquipment(equipment);
      handleSelectEquipment(id);
    }
  }, [experimentState.equipment, handleClearHeldItem, handleSelectEquipment]);

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
        equipment: prevState.equipment.map(e => e.id === beaker.id ? {...e, isReacting: true} : e),
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
  
  const handleDetach = useCallback((equipmentId: string) => {
      setExperimentState(prevState => {
          const newState = {...prevState};
          let foundAttachment: Equipment | undefined;
          let parentContainer: Equipment | undefined;

          for (const container of newState.equipment) {
              const attachment = container.attachments?.find(att => att.id === equipmentId);
              if (attachment) {
                  foundAttachment = attachment;
                  parentContainer = container;
                  break;
              }
          }

          if (foundAttachment && parentContainer) {
              addLog(`Detached ${foundAttachment.name} from ${parentContainer.name}.`);
              parentContainer.attachments = parentContainer.attachments?.filter(att => att.id !== equipmentId);

              const detachedItem = { ...foundAttachment, attachedTo: undefined, attachmentPoint: undefined, position: {...parentContainer.position, y: parentContainer.position.y - 100}, isSelected: true };
              newState.equipment.push(detachedItem);
              
              newState.equipment = newState.equipment.map(e => e.id === parentContainer!.id ? {...parentContainer, isSelected: false} : e);
          }

          return { ...newState, equipment: [...newState.equipment] };
      });
  }, [addLog]);

  const handleInitiateAttachment = useCallback((sourceId: string) => {
    setAttachmentState({ sourceId });
    addLog('Select another piece of equipment to connect to.');
  }, [addLog]);
  
  const onRemoveConnection = useCallback((connectionId: string) => {
    setExperimentState(prevState => {
        const conn = prevState.connections.find(c => c.id === connectionId);
        if (conn) {
            const sourceName = prevState.equipment.find(e => e.id === conn.from)?.name;
            const targetName = prevState.equipment.find(e => e.id === conn.to)?.name;
            addLog(`Disconnected ${sourceName} from ${targetName}.`);
        }
        return {
            ...prevState,
            connections: prevState.connections.filter(c => c.id !== connectionId),
        };
    });
  }, [addLog]);
  
  const value = useMemo(() => ({
    experimentState,
    labLogs,
    heldEquipment,
    setHeldEquipment: ()=>{},
    pouringState,
    setPouringState,
    attachmentState,
    setAttachmentState,
    handleResetWorkbench,
    addLog,
    handleAddEquipmentToWorkbench,
    handleRemoveSelectedEquipment,
    handleResizeEquipment,
    handleMoveEquipment,
    handleSelectEquipment,
    handleDropOnApparatus,
    handlePickUpEquipment,
    handlePour,
    onTitrate: handleTitrate,
    handleClearHeldItem,
    handleDetach,
    handleInitiateAttachment,
    onRemoveConnection,
    inventory: {
        chemicals: inventoryContext.inventoryChemicals,
        equipment: inventoryContext.inventoryEquipment,
        heldItem: inventoryContext.heldItem,
        clearHeldItem: inventoryContext.handleClearHeldItem,
        pickUpChemical: inventoryContext.handlePickUpChemical,
    },
    safetyGogglesOn: inventoryContext.safetyGogglesOn,
  }), [
    experimentState, labLogs, heldEquipment, pouringState, attachmentState,
    handleResetWorkbench, addLog, handleAddEquipmentToWorkbench, handleRemoveSelectedEquipment,
    handleResizeEquipment, handleMoveEquipment, handleSelectEquipment, handleDropOnApparatus,
    handlePickUpEquipment, handlePour, handleTitrate, handleClearHeldItem,
    handleDetach, handleInitiateAttachment, onRemoveConnection,
    inventoryContext,
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
