
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useExperiment } from './use-experiment';
import type { Equipment } from '@/lib/experiment';

type DragState = { 
  id: string; 
  offset: { x: number; y: number; }; 
  hasMoved: boolean; 
} | null;

export function useInteractions(workbenchRef: React.RefObject<HTMLDivElement>) {
  const {
    experimentState,
    inventory,
    heldEquipment,
    pouringState,
    attachmentState,
    setAttachmentState,
    handleClearHeldItem,
    handleSelectEquipment,
    handleDropOnApparatus,
    handlePickUpEquipment,
    handleMoveEquipment
  } = useExperiment();

  const [hoveredEquipmentId, setHoveredEquipmentId] = useState<string | null>(null);
  const dragState = useRef<DragState>(null);

  const isHoldingSomething = !!inventory.heldItem || !!heldEquipment;

  // Mouse move handler to detect which equipment is being hovered over
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    let targetId: string | null = null;
    
    if (isHoldingSomething && workbenchRef.current) {
        const elements = Array.from(workbenchRef.current.children);
        for (const elem of elements) {
            const equipmentId = elem.getAttribute('data-equipment-id');
            if (!equipmentId) continue;
            
            const isSelf = equipmentId === heldEquipment?.id;
            const allAttachments = experimentState.equipment.flatMap(eq => eq.attachments || []);
            const isAttached = allAttachments.some(att => att.id === equipmentId);
            
            if (!isSelf && !isAttached) {
                 const rect = elem.getBoundingClientRect();
                 if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                     targetId = equipmentId;
                     break;
                 }
            }
        }
    }
    setHoveredEquipmentId(targetId);

    // Drag movement logic
    if (dragState.current && !heldEquipment) {
        const item = dragState.current;
        if (workbenchRef.current) {
            const rect = workbenchRef.current.getBoundingClientRect();
            const newX = e.clientX - rect.left - item.offset.x;
            const newY = e.clientY - rect.top - item.offset.y;
            
            if (!item.hasMoved) {
                const allEquipment = experimentState.equipment.flatMap(eq => [eq, ...(eq.attachments || [])]);
                const currentPos = allEquipment.find(eq => eq.id === item.id)?.position;
                if (currentPos && (Math.abs(newX - currentPos.x) > 5 || Math.abs(newY - currentPos.y) > 5)) {
                    dragState.current.hasMoved = true;
                }
            }

            if (item.hasMoved) {
              handleMoveEquipment(item.id, { x: newX, y: newY });
            }
        }
    }
  }, [isHoldingSomething, heldEquipment, experimentState.equipment, workbenchRef, handleMoveEquipment]);

  const handleGlobalMouseUp = useCallback(() => {
    // End drag for non-held items (direct drag)
    if (dragState.current && !heldEquipment) {
        dragState.current = null;
    }
    // For held items, drop logic is in handleEquipmentMouseUp
  }, [heldEquipment]);
  
  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleGlobalMouseMove, handleGlobalMouseUp]);


  const handleWorkbenchClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'lab-slab') {
      if (!pouringState && !attachmentState) {
        handleSelectEquipment(null);
      }
      if(heldEquipment || inventory.heldItem) {
        handleClearHeldItem();
      }
      if (attachmentState) {
          setAttachmentState(null);
      }
    }
  }, [inventory.heldItem, heldEquipment, pouringState, attachmentState, handleSelectEquipment, handleClearHeldItem, setAttachmentState]);
  
  const handleEquipmentMouseDown = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const allEquipment = [...experimentState.equipment, ...experimentState.equipment.flatMap(e => e.attachments || [])];
    const equip = allEquipment.find(eq => eq.id === id);

    if (equip && e.button === 0) {
        if (equip.attachedTo) return; 

        if (workbenchRef.current) {
            const rect = workbenchRef.current.getBoundingClientRect();
            dragState.current = {
                id,
                offset: {
                    x: e.clientX - rect.left - equip.position.x,
                    y: e.clientY - rect.top - equip.position.y,
                },
                hasMoved: false,
            };
            handleSelectEquipment(id);
        }
    }
  }, [experimentState.equipment, workbenchRef, handleSelectEquipment]);

  const handleEquipmentClick = useCallback((id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (dragState.current?.hasMoved) {
          return;
      }
      
      if (inventory.heldItem) {
          handleDropOnApparatus(id);
          return;
      }
      
      if (heldEquipment && heldEquipment.id !== id) {
          handleDropOnApparatus(id);
          return;
      }

      handleSelectEquipment(id, e.shiftKey);
  }, [dragState, inventory.heldItem, heldEquipment, handleDropOnApparatus, handleSelectEquipment]);

  const handleEquipmentMouseUp = useCallback((id: string) => {
    // If not dragging something, pick it up
    if (!dragState.current?.hasMoved) {
        if (!inventory.heldItem && !heldEquipment) {
            handlePickUpEquipment(id);
        }
    }
    
    // If holding something, drop it
    if (heldEquipment && heldEquipment.id !== id) {
        handleDropOnApparatus(id);
    } else if (heldEquipment && heldEquipment.id === id) {
        // If you mouse-up on the item you're holding, clear the hold.
        handleClearHeldItem();
    }
    
    // Clear drag state
    dragState.current = null;
  }, [dragState, inventory.heldItem, heldEquipment, handleDropOnApparatus, handlePickUpEquipment, handleClearHeldItem]);

  return {
    hoveredEquipmentId,
    handleWorkbenchClick,
    handleEquipmentMouseDown,
    handleEquipmentClick,
    handleEquipmentMouseUp
  };
}
