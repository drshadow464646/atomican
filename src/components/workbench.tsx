
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Beaker, Pipette, FlaskConical, TestTube, X, ZoomIn, Trash2, Hand } from 'lucide-react';
import type { Chemical, Equipment, ExperimentState } from '@/lib/experiment';
import { Slider } from './ui/slider';
import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

const BeakerIcon = ({ color, fillPercentage, size }: { color: string; fillPercentage: number; size: number }) => {
  const liquidHeight = 95 * (fillPercentage / 100);
  const liquidY = 115 - liquidHeight;
  
  const width = 7 * size;
  const height = 10 * size;

  return (
    <div className="relative" style={{ height: `${height}rem`, width: `${width}rem`}}>
      <svg viewBox="0 0 100 120" className="h-full w-full">
        <defs>
           <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.7" />
              <stop offset="50%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        {fillPercentage > 0 && (
          <g>
            <path
              d={`M20,${liquidY} L 80,${liquidY} L 80,115 A 5,5 0 0 1 75,120 H 25 A 5,5 0 0 1 20,115 Z`}
              fill={color === 'transparent' ? 'hsl(var(--background))' : `url(#liquidGradient)`}
              className="transition-all duration-500"
            />
          </g>
        )}
        <path
          d="M10,10 L20,115 A 5,5 0 0 0 25,120 H 75 A 5,5 0 0 0 80,115 L 90,10"
          stroke="hsl(var(--foreground) / 0.3)"
          strokeWidth="2"
          fill="transparent"
        />
        <path
          d="M10,10 H 90"
          stroke="hsl(var(--foreground) / 0.3)"
          strokeWidth="3"
          fill="none"
        />
      </svg>
    </div>
  );
};


const EquipmentDisplay = ({ 
  item, 
  state,
  onMouseDown,
  onSelect,
  onDrop,
  isHoverTarget,
}: { 
  item: Equipment, 
  state: ExperimentState,
  onMouseDown: (e: React.MouseEvent, id: string) => void,
  onSelect: (id: string) => void,
  onDrop: (id: string) => void,
  isHoverTarget: boolean,
}) => {
    const beakerSolution = state.beaker?.solutions[0];
    const buretteSolution = state.burette;
    const fillPercentage = beakerSolution ? ((beakerSolution.volume + state.volumeAdded) / 250) * 100 : 0;
    
    const size = item.size ?? 1;
    const iconClass = "text-muted-foreground/50 transition-all";

    const renderContent = () => {
        const iconStyle = { height: `${8 * size}rem`, width: `${8 * size}rem` };
        switch (item.type) {
            case 'beaker':
                return <BeakerIcon color={state.color} fillPercentage={fillPercentage} size={size} />;
            case 'burette':
                return <Pipette className={iconClass} style={iconStyle} />;
            case 'erlenmeyer-flask':
                 return <FlaskConical className={iconClass} style={iconStyle} />;
            default:
                return <TestTube className={iconClass} style={iconStyle} />;
        }
    };

    return (
        <div 
            id={item.id}
            className={cn(
                "absolute flex flex-col items-center justify-center p-2 bg-transparent cursor-grab active:cursor-grabbing transition-all duration-200 rounded-lg",
                item.isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-2xl z-10",
                isHoverTarget && "ring-2 ring-accent ring-offset-2 ring-offset-background shadow-2xl",
            )}
            style={{ 
                left: `${item.position.x}px`, 
                top: `${item.position.y}px`,
                touchAction: 'none', // prevent default touch actions
            }}
            onMouseDown={(e) => {
              onSelect(item.id);
              onMouseDown(e, item.id);
            }}
            onClick={() => onDrop(item.id)}
        >
            <div className="flex-1 flex flex-col items-center justify-center pointer-events-none">
                {renderContent()}
            </div>
             <p className="text-xs font-medium text-foreground/80 pointer-events-none select-none">{item.name}</p>
        </div>
    );
};

export function Workbench({ 
    state, 
    onTitrate,
    onRemoveEquipment,
    onResizeEquipment,
    onMoveEquipment,
    onSelectEquipment,
    onDropOnApparatus,
    heldItem,
}: { 
    state: ExperimentState, 
    onTitrate: (volume: number, sourceId?: string, targetId?: string) => void;
    onRemoveEquipment: (id: string) => void;
    onResizeEquipment: (id: string, size: number) => void;
    onMoveEquipment: (id: string, pos: { x: number, y: number }) => void;
    onSelectEquipment: (id: string | null) => void;
    onDropOnApparatus: (equipmentId: string) => void;
    heldItem: Chemical | null;
}) {
  const [titrationAmount, setTitrationAmount] = useState(1);
  const workbenchRef = useRef<HTMLDivElement>(null);
  const draggedItemRef = useRef<{ id: string; offset: { x: number; y: number } } | null>(null);
  const [hoveredEquipment, setHoveredEquipment] = useState<string | null>(null);

  const hasBeaker = state.equipment.some((e) => e.type === 'beaker');
  const hasBurette = state.equipment.some((e) => e.type === 'burette');
  
  const selectedEquipment = state.equipment.find(e => e.isSelected);
  
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (heldItem) return; // Don't drag if holding a chemical
    const workbenchRect = workbenchRef.current?.getBoundingClientRect();
    const item = state.equipment.find(i => i.id === id);
    if (!workbenchRect || !item) return;

    draggedItemRef.current = {
      id,
      offset: {
        x: e.clientX - workbenchRect.left - item.position.x,
        y: e.clientY - workbenchRect.top - item.position.y,
      },
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedItemRef.current || !workbenchRef.current) return;
    
    // Check for equipment under cursor during drag
    const draggedItemId = draggedItemRef.current.id;
    let targetId: string | null = null;
    const allEquipment = Array.from(workbenchRef.current.querySelectorAll('[id^="beaker-"], [id^="burette-"]'));

    for (const elem of allEquipment) {
        if (elem.id !== draggedItemId) {
            const rect = elem.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                targetId = elem.id;
                break;
            }
        }
    }
    setHoveredEquipment(targetId);

    const workbenchRect = workbenchRef.current.getBoundingClientRect();
    const newX = e.clientX - workbenchRect.left - draggedItemRef.current.offset.x;
    const newY = e.clientY - workbenchRect.top - draggedItemRef.current.offset.y;

    onMoveEquipment(draggedItemRef.current.id, { x: newX, y: newY });
  }, [onMoveEquipment]);


  const handleMouseUp = useCallback(() => {
    if (draggedItemRef.current && hoveredEquipment) {
      onTitrate(5, draggedItemRef.current.id, hoveredEquipment);
    }
    draggedItemRef.current = null;
    setHoveredEquipment(null);
  }, [hoveredEquipment, onTitrate]);

  const handleMouseLeave = useCallback(() => {
    draggedItemRef.current = null;
  }, []);

  // Attach and clean up global event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseUp, handleMouseLeave]);

  return (
    <div className="h-full flex flex-col">
      <Card 
        className="h-full rounded-none flex flex-col text-card-foreground bg-card/50"
        style={{
          backgroundColor: 'hsl(var(--muted))',
        }}
      >
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-foreground'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-test-tube-diagonal"><path d="M14.5 2.5 16 4l-1.5 1.5"/><path d="M17.5 5.5 19 7l-1.5 1.5"/><path d="m3 21 7-7"/><path d="M13.5 6.5 16 9l4-4"/><path d="m3 21 7-7"/><path d="M14.5 6.5 17 9l4-4"/><path d="M10.586 11.414a2 2 0 1 1 2.828-2.828"/></svg>
            Workbench
          </CardTitle>
           {heldItem && (
            <CardDescription className="flex items-center gap-2 text-accent-foreground p-2 bg-accent rounded-md">
              <Hand className="h-4 w-4"/>
              Holding: {heldItem.name}. Click on an apparatus to add it. (Press Esc to cancel)
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-2 md:p-6 text-foreground">
            <div 
              ref={workbenchRef}
              className="relative w-full flex-1 rounded-2xl shadow-inner"
              style={{ background: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)), repeating-linear-gradient(0deg, hsl(var(--border)) 0, hsl(var(--border)) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, hsl(var(--border)) 0, hsl(var(--border)) 1px, transparent 1px, transparent 40px)'}}
              onClick={(e) => {
                if (e.target === workbenchRef.current) {
                  onSelectEquipment(null);
                }
              }}
            >
              {state.equipment.length > 0 ? (
                  <>
                    <div className="absolute inset-4 rounded-xl bg-background/70 shadow-xl backdrop-blur-sm border border-black/5"></div>
                      {state.equipment.map(item => (
                          <div
                            key={item.id}
                            onMouseEnter={() => { if (heldItem || draggedItemRef.current) setHoveredEquipment(item.id)}}
                            onMouseLeave={() => { if (heldItem || draggedItemRef.current) setHoveredEquipment(null)}}
                          >
                            <EquipmentDisplay 
                                item={item} 
                                state={state} 
                                onMouseDown={handleMouseDown}
                                onSelect={onSelectEquipment}
                                onDrop={onDropOnApparatus}
                                isHoverTarget={(!!heldItem || !!draggedItemRef.current) && hoveredEquipment === item.id && draggedItemRef.current?.id !== item.id}
                            />
                          </div>
                      ))}
                  </>
              ) : (
                   <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                        <p className="text-lg font-medium">Your workbench is ready.</p>
                        <p className="text-sm">Add equipment and chemicals from the inventory to begin.</p>
                  </div>
              )}
            </div>
          
          <div className="w-full max-w-2xl mt-4">
              {selectedEquipment ? (
                <div className="flex flex-col items-center gap-4 w-full p-4 rounded-lg border border-border bg-background/80 backdrop-blur-sm shadow-lg">
                    <p className="text-base font-bold text-foreground">Editing: {selectedEquipment.name}</p>
                    <div className="flex items-center gap-4 w-full">
                        <ZoomIn className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <Slider
                            value={[selectedEquipment.size ?? 1]}
                            onValueChange={(value) => onResizeEquipment(selectedEquipment.id, value[0])}
                            min={0.5}
                            max={1.5}
                            step={0.1}
                        />
                        <Button variant="destructive" size="sm" onClick={() => onRemoveEquipment(selectedEquipment.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                        </Button>
                    </div>
                </div>
              ) : hasBeaker && hasBurette && !heldItem ? (
                 <div className="flex flex-col items-center gap-4 w-full p-4 rounded-lg border border-border bg-background/80 backdrop-blur-sm shadow-lg">
                    <p className="text-sm font-medium text-foreground">Titration Control</p>
                    <div className="flex items-center gap-4 w-full">
                        <Slider 
                          value={[titrationAmount]}
                          onValueChange={(value) => setTitrationAmount(value[0])}
                          min={0.1}
                          max={10}
                          step={0.1}
                          disabled={!hasBurette || !hasBeaker}
                        />
                        <Button onClick={() => onTitrate(titrationAmount)} disabled={!hasBurette || !hasBeaker} className='w-48' variant="secondary">
                            Add {titrationAmount.toFixed(1)}ml
                        </Button>
                    </div>
                </div>
              ) : null}
            </div>

        </CardContent>
      </Card>
    </div>
  );
}
