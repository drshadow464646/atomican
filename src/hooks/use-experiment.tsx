

'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ExperimentState, LabLog, Chemical, Equipment, Solution, ReactionPrediction, EquipmentConnection } from '@/lib/experiment';
import { useToast } from '@/hooks/use-toast';
import { getReactionPrediction } from '@/app/actions';
import { useInventory } from './use-inventory'; // Import the lightweight inventory hook

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

type DragState = { 
  id: string; 
  offset: { x: number; y: number; }; 
  hasMoved: boolean; 
} | null;

type AttachmentState = {
    sourceId: string;
} | null;


type ExperimentContextType = {
  experimentState: ExperimentState;
  handleResetWorkbench: () => void;
  handleAddEquipmentToWorkbench: (equipment: Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>) => void;
  handleRemoveSelectedEquipment: (id: string) => void;
  handleResizeEquipment: (equipmentId: string, size: number) => void;
  handleMoveEquipment: (equipmentId: string, position: { x: number, y: number }) => void;
  handleSelectEquipment: (equipmentId: string | null, append?: boolean) => void;
  handleDropOnApparatus: (equipmentId: string) => void;
  handlePickUpEquipment: (id: string) => void;
  handlePour: (volume: number) => void;
  handleInitiatePour: (targetId: string) => void;
  handleCancelPour: () => void;
  handleTitrate: (volume: number) => void;
  handleClearHeldItem: () => void;
  dragState: React.RefObject<DragState>;
  handleDragStart: (id: string, e: React.MouseEvent) => void;
  handleWorkbenchClick: (e: React.MouseEvent) => void;
  handleEquipmentClick: (id: string, e: React.MouseEvent) => void;
  handleMouseUpOnEquipment: (id: string) => void;
  handleDetach: (equipmentId: string) => void;
  handleInitiateAttachment: (sourceId: string) => void;
  handleCancelAttachment: () => void;
  handleRemoveConnection: (connectionId: string) => void;
  
  // From InventoryContext
  labLogs: LabLog[];
  inventoryChemicals: Chemical[];
  inventoryEquipment: Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>[];
  safetyGogglesOn: boolean;
  heldItem: Chemical | null;
  heldEquipment: Equipment | null;
  pouringState: { sourceId: string; targetId: string; } | null;
  attachmentState: AttachmentState;
  setSafetyGogglesOn: (on: boolean) => void;
  handlePickUpChemical: (chemical: Chemical) => void;
};

const ExperimentContext = createContext<ExperimentContextType | undefined>(undefined);

export function ExperimentProvider({ children }: { children: React.ReactNode }) {
  const inventoryContext = useInventory();
  const { addLog } = inventoryContext;

  const [experimentState, setExperimentState] = useState<ExperimentState>(initialExperimentState);
  const [heldEquipment, setHeldEquipment] = useState<Equipment | null>(null);
  const [pouringState, setPouringState] = useState<{ sourceId: string; targetId: string; } | null>(null);
  const [attachmentState, setAttachmentState] = useState<AttachmentState>(null);
  const { toast } = useToast();
  
  const dragState = useRef<DragState>(null);

  const handleResetWorkbench = useCallback(() => {
    setExperimentState(initialExperimentState);
    setHeldEquipment(null);
    setPouringState(null);
    setAttachmentState(null);
    addLog('Workbench has been cleared.');
  }, [addLog]);
  
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
            key: Date.now(), // new key to trigger animation
        };

        addLog(`Reaction in ${container.name}: ${prediction.description}`);
        if(prediction.isExplosive) {
             toast({ title: 'DANGER!', description: 'The reaction is explosive!', variant: 'destructive' });
        }

        // Update any attached instruments
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

  const handleCancelPour = useCallback(() => {
    setPouringState(null);
    inventoryContext.handleClearHeldItem();
  }, [inventoryContext]);

  const handleCancelAttachment = useCallback(() => {
    setAttachmentState(null);
  }, []);
  
  const handleSelectEquipment = useCallback((equipmentId: string | null, append: boolean = false) => {
    if (attachmentState && equipmentId) {
        if (attachmentState.sourceId === equipmentId) {
            setAttachmentState(null); // Cancel attachment if clicking the source again
            return;
        }
        // Complete the attachment
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
        attachments: [],
      }; 
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

      // Also remove any connections associated with this equipment
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

  const handleInitiatePour = useCallback((targetId: string) => {
    if (!heldEquipment || heldEquipment.id === targetId) return;

    const target = experimentState.equipment.find(e => e.id === targetId);
    if (!target) return;

    setPouringState({ sourceId: heldEquipment.id, targetId: targetId });
    inventoryContext.handleClearHeldItem();
    setHeldEquipment(null);
  }, [heldEquipment, experimentState.equipment, inventoryContext]);

  const handleDropOnApparatus = useCallback((targetId: string) => {
    if (!handleSafetyCheck()) return;

    const targetContainer = experimentState.equipment.find(e => e.id === targetId);
    if (!targetContainer) return;

    if (inventoryContext.heldItem) { // Adding a chemical from inventory
        setPouringState({ sourceId: 'inventory', targetId: targetId });
    
    } else if (heldEquipment) { // Attaching an item or initiating a pour
        const attachmentTypes = ['thermometer', 'ph-meter', 'clamp'];
        if (attachmentTypes.includes(heldEquipment.type)) {
            // Logic for attaching items
            const canAttachTo = ['beaker', 'erlenmeyer-flask', 'graduated-cylinder', 'volumetric-flask', 'stand', 'test-tube'];
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


                    const newEquipment = prevState.equipment.filter(e => e.id !== equipmentToAttach.id); // remove from top level
                    
                    const updatedEquipment = newEquipment.map(e => {
                        if (e.id === targetId) {
                            return { ...e, attachments: [...(e.attachments || []), equipmentToAttach], isSelected: true };
                        }
                        return {...e, isSelected: false};
                    });
                    
                    return { ...prevState, equipment: updatedEquipment };
                });
                inventoryContext.handleClearHeldItem();
                setHeldEquipment(null);
            }
        } else {
            // Logic for initiating a pour from another container
            handleInitiatePour(targetId);
        }
    }
}, [handleSafetyCheck, inventoryContext, heldEquipment, experimentState.equipment, toast, addLog, handleInitiatePour]);

  const handlePour = useCallback((volume: number) => {
    if (!pouringState) return;
    const { sourceId, targetId } = pouringState;

    // --- Immediate UI Update ---
    let pouredSolutions: Solution[] = [];
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
        
        // Update source immediately
        source.solutions = source.solutions.map(s => ({
            ...s,
            volume: s.volume * (1 - pourFraction)
        })).filter(s => s.volume > 0.01);
        
        if (source.solutions.length === 0) {
            source.color = 'transparent';
            source.ph = 7;
        }
      }

      // Update target immediately with poured liquids
      for (const pouredSol of pouredSolutions) {
        const existingSol = target.solutions.find(s => s.chemical.id === pouredSol.chemical.id);
        if (existingSol) {
          existingSol.volume += pouredSol.volume;
        } else {
          target.solutions.push(pouredSol);
        }
      }

      target.isReacting = true; // Set analyzing state
      return { ...newState, equipment: [...newState.equipment] };
    });
    
    // --- Cleanup and Background AI Call ---
    const allReactants = [...(experimentState.equipment.find(e => e.id === targetId)?.solutions || []), ...pouredSolutions];
    setPouringState(null);
    inventoryContext.handleClearHeldItem();
    addLog('Analyzing reaction...');
    
    // Run AI prediction in the background
    getReactionPrediction(allReactants).then(prediction => {
      applyReactionPrediction(targetId, prediction);
    });

  }, [addLog, pouringState, experimentState.equipment, inventoryContext, toast]);
  
  const handlePickUpEquipment = useCallback((id: string) => {
    const allEquipment = [...experimentState.equipment, ...experimentState.equipment.flatMap(e => e.attachments || [])];
    const equipment = allEquipment.find(e => e.id === id);
    if (!equipment || equipment.isReacting) return;
    
    inventoryContext.handleClearHeldItem();
    setHeldEquipment(null);
    
    const validPouringEquipment = ['beaker', 'erlenmeyer-flask', 'graduated-cylinder', 'volumetric-flask', 'test-tube', 'thermometer', 'ph-meter', 'clamp'];
    if ((equipment.solutions && equipment.solutions.length > 0) || validPouringEquipment.includes(equipment.type)) {
      setHeldEquipment(equipment);
      handleSelectEquipment(id);
    }
  }, [experimentState.equipment, inventoryContext, handleSelectEquipment]);

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

  const handleDragStart = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const allEquipment = [...experimentState.equipment, ...experimentState.equipment.flatMap(e => e.attachments || [])];
    const equip = allEquipment.find(eq => eq.id === id);

    if (equip && e.button === 0) {
        if (equip.attachedTo) return; 

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
        // If we start dragging, we should only be concerned with the dragged item.
        // Deselect all others to prevent confusion.
        handleSelectEquipment(id);
    }
  }, [experimentState.equipment, handleSelectEquipment]);
  
  const handleWorkbenchClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'lab-slab') {
      if (!pouringState && !attachmentState) {
        handleSelectEquipment(null);
      }
      if(heldEquipment || inventoryContext.heldItem) {
        inventoryContext.handleClearHeldItem();
        setHeldEquipment(null);
      }
      if (attachmentState) {
          handleCancelAttachment();
      }
    }
  }, [inventoryContext, heldEquipment, pouringState, attachmentState, handleSelectEquipment, handleCancelAttachment]);
  
  const handleEquipmentClick = useCallback((id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (dragState.current?.hasMoved) {
          return;
      }
      
      if (inventoryContext.heldItem) {
          handleDropOnApparatus(id);
          return;
      }
      
      // If holding equipment, drop it on the clicked item.
      if (heldEquipment && heldEquipment.id !== id) {
          handleDropOnApparatus(id);
          return;
      }

      handleSelectEquipment(id, e.shiftKey);

  }, [dragState, inventoryContext.heldItem, heldEquipment, handleDropOnApparatus, handleSelectEquipment]);

  const handleMouseUpOnEquipment = useCallback((id: string) => {
    if (dragState.current?.hasMoved) {
        // Drag just ended on this item
    } else {
        // This was a click, not a drag. If not holding anything, pick up the item.
        if (!inventoryContext.heldItem && !heldEquipment) {
            handlePickUpEquipment(id);
        }
    }
    
    if (heldEquipment && heldEquipment.id !== id) {
        handleDropOnApparatus(id);
    } else if (heldEquipment && heldEquipment.id === id) {
        // If you mouse-up on the item you're holding, clear the hold.
        inventoryContext.handleClearHeldItem();
        setHeldEquipment(null);
    }
  }, [dragState, inventoryContext, heldEquipment, handleDropOnApparatus, handlePickUpEquipment]);
  
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
  
  const handleRemoveConnection = useCallback((connectionId: string) => {
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (dragState.current && !heldEquipment) {
            const item = dragState.current;
            const workbench = document.getElementById('lab-slab')?.parentElement;
            if (workbench) {
                const rect = workbench.getBoundingClientRect();
                const newX = e.clientX - rect.left - item.offset.x;
                const newY = e.clientY - rect.top - item.offset.y;
                
                if (!item.hasMoved) {
                    const allEquipment = experimentState.equipment.flatMap(eq => [eq, ...(eq.attachments || [])]);
                    const currentPos = allEquipment.find(eq => eq.id === item.id)?.position;
                    if (currentPos && (Math.abs(newX - currentPos.x) > 5 || Math.abs(newY - currentPos.y) > 5)) {
                        item.hasMoved = true;
                    }
                }

                if (item.hasMoved) {
                  handleMoveEquipment(item.id, { x: newX, y: newY });
                }
            }
        }
    };

    const handleMouseUp = () => {
        dragState.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMoveEquipment, experimentState.equipment, heldEquipment]);
  
  const handleClearHeldItem = useCallback(() => {
    inventoryContext.handleClearHeldItem();
    setHeldEquipment(null);
  }, [inventoryContext]);

  const value = useMemo(() => ({
    experimentState,
    handleResetWorkbench,
    handleAddEquipmentToWorkbench,
    handleRemoveSelectedEquipment,
    handleResizeEquipment,
    handleMoveEquipment,
    handleSelectEquipment,
    handleDropOnApparatus,
    handlePickUpEquipment,
    handlePour,
    handleInitiatePour,
    handleCancelPour,
    handleTitrate,
    handleClearHeldItem,
    dragState,
    handleDragStart,
    handleWorkbenchClick,
    handleEquipmentClick,
    handleMouseUpOnEquipment,
    handleDetach,
    handleInitiateAttachment,
    handleCancelAttachment,
    handleRemoveConnection,
    // From inventory context
    labLogs: inventoryContext.labLogs,
    inventoryChemicals: inventoryContext.inventoryChemicals,
    inventoryEquipment: inventoryContext.inventoryEquipment,
    safetyGogglesOn: inventoryContext.safetyGogglesOn,
    heldItem: inventoryContext.heldItem,
    heldEquipment,
    pouringState,
    attachmentState,
    setSafetyGogglesOn: inventoryContext.setSafetyGogglesOn,
    handlePickUpChemical: inventoryContext.handlePickUpChemical,
  }), [
    experimentState,
    handleResetWorkbench,
    handleAddEquipmentToWorkbench,
    handleRemoveSelectedEquipment,
    handleResizeEquipment,
    handleMoveEquipment,
    handleSelectEquipment,
    handleDropOnApparatus,
    handlePickUpEquipment,
    handlePour,
    handleInitiatePour,
    handleCancelPour,
    handleTitrate,
    handleClearHeldItem,
    dragState,
    handleDragStart,
    handleWorkbenchClick,
    handleEquipmentClick,
    handleMouseUpOnEquipment,
    handleDetach,
    handleInitiateAttachment,
    handleCancelAttachment,
    handleRemoveConnection,
    inventoryContext,
    heldEquipment,
    pouringState,
    attachmentState,
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
