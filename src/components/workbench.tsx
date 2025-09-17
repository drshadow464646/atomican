'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Beaker, Pipette, FlaskConical, TestTube, X, Hand, Scaling } from 'lucide-react';
import type { Chemical, Equipment, ExperimentState } from '@/lib/experiment';
import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Slider } from './ui/slider';

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
  onSelect,
  onDrop,
  onInitiatePour,
  onRemove,
  onResize,
  isHoverTarget,
  isHeld,
}: { 
  item: Equipment, 
  state: ExperimentState,
  onSelect: (id: string, e: React.MouseEvent) => void,
  onDrop: (id: string) => void,
  onInitiatePour: (id: string) => void,
  onRemove: (id: string) => void,
  onResize: (id: string, size: number) => void,
  isHoverTarget: boolean,
  isHeld: boolean,
}) => {
    let fillPercentage = 0;
    const workbenchItem = state.equipment.find(e => e.id === item.id);
    if(workbenchItem?.solutions && workbenchItem.solutions.length > 0 && workbenchItem.volume) {
        const totalVolume = workbenchItem.solutions.reduce((sum, s) => sum + s.volume, 0);
        fillPercentage = (totalVolume / workbenchItem.volume) * 100;
    }

    const color = workbenchItem?.color || 'transparent';
    
    const size = item.size ?? 1;
    const iconClass = "text-muted-foreground/50 transition-all";
    
    const resizeHandleRef = useRef<HTMLDivElement>(null);

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        const startSize = size;
        const startY = e.clientY;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaY = moveEvent.clientY - startY;
            const newSize = Math.max(0.5, Math.min(2.5, startSize + deltaY / 100));
            onResize(item.id, newSize);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const renderContent = () => {
        const iconStyle = { height: `${8 * size}rem`, width: `${8 * size}rem` };
        switch (item.type) {
            case 'beaker':
            case 'erlenmeyer-flask':
            case 'graduated-cylinder':
            case 'volumetric-flask':
                return <BeakerIcon color={color} fillPercentage={fillPercentage} size={size} />;
            case 'burette':
                return <Pipette className={iconClass} style={iconStyle} />;
            default:
                return <TestTube className={iconClass} style={iconStyle} />;
        }
    };

    const hasLiquid = (item.solutions && item.solutions.length > 0);

    return (
        <div 
            id={item.id}
            className={cn(
                "absolute flex flex-col items-center justify-center p-2 bg-transparent transition-all duration-200 rounded-lg group",
                item.isSelected && !isHeld && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-2xl z-10",
                isHoverTarget && "ring-2 ring-accent ring-offset-2 ring-offset-background shadow-2xl",
                isHeld ? "cursor-grabbing opacity-75" : "cursor-grab"
            )}
            style={{ 
                left: `${item.position.x}px`, 
                top: `${item.position.y}px`,
                touchAction: 'none',
            }}
            onMouseDown={(e) => onSelect(item.id, e)}
            onClick={(e) => {
              e.stopPropagation(); 
              onDrop(item.id);
              if (hasLiquid) {
                onInitiatePour(item.id);
              }
            }}
        >
            {item.isSelected && !isHeld && (
              <>
                <Button 
                    size="icon" 
                    variant="destructive" 
                    className="absolute -top-3 -right-3 h-6 w-6 rounded-full z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(item.id);
                    }}
                >
                    <X className="h-4 w-4" />
                </Button>
                <div 
                    ref={resizeHandleRef}
                    className="absolute -bottom-2 -right-2 h-5 w-5 bg-primary rounded-full z-20 cursor-nwse-resize flex items-center justify-center"
                    onMouseDown={handleResizeMouseDown}
                >
                    <Scaling className="h-3 w-3 text-primary-foreground" />
                </div>
              </>
            )}
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
    onResizeEquipment,
    onMoveEquipment,
    onSelectEquipment,
    onDropOnApparatus,
    onPickUpEquipment,
    onPour,
    onInitiatePour,
    onCancelPour,
    heldItem,
    heldEquipment,
    onRemoveSelectedEquipment,
    pouringState,
}: { 
    state: ExperimentState, 
    onTitrate: (volume: number, sourceId?: string, targetId?: string) => void;
    onResizeEquipment: (id: string, size: number) => void;
    onMoveEquipment: (id: string, pos: { x: number, y: number }) => void;
    onSelectEquipment: (id: string | null, e: React.MouseEvent | MouseEvent) => void;
    onDropOnApparatus: (equipmentId: string) => void;
    onPickUpEquipment: (id: string, e: React.MouseEvent) => void;
    onPour: (volume: number) => void;
    onInitiatePour: (targetId: string) => void;
    onCancelPour: () => void;
    heldItem: Chemical | null;
    heldEquipment: Equipment | null;
    onRemoveSelectedEquipment: (id: string) => void;
    pouringState: { sourceId: string; targetId: string; } | null;
}) {
  const workbenchRef = useRef<HTMLDivElement>(null);
  const [hoveredEquipment, setHoveredEquipment] = useState<string | null>(null);
  const [pourVolume, setPourVolume] = useState(10);
  
  const hasBurette = state.equipment.some((e) => e.type === 'burette');
  const hasTitrationTarget = state.equipment.some((e) => e.type === 'beaker' || e.type === 'erlenmeyer-flask');
  
  const selectedEquipment = state.equipment.find(e => e.isSelected);
  const isHoldingSomething = !!heldItem || !!heldEquipment;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    let targetId: string | null = null;
    if (isHoldingSomething && workbenchRef.current) {
        const heldId = heldItem ? null : heldEquipment?.id;
        const equipmentElements = Array.from(workbenchRef.current.children).filter(
          (child) => child.id && child.id !== heldId && child.id !== 'lab-slab'
        );

        for (const elem of equipmentElements) {
            const rect = elem.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                targetId = elem.id;
                break;
            }
        }
    }
    setHoveredEquipment(targetId);
  }, [isHoldingSomething, heldItem, heldEquipment]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (heldEquipment && hoveredEquipment) {
        onInitiatePour(hoveredEquipment);
    } else if (heldItem && hoveredEquipment) {
        onDropOnApparatus(hoveredEquipment);
    }
    
    // Clear selection if clicking on the workbench background
    const isWorkbenchClick = target === workbenchRef.current || target.id === 'lab-slab';
    if (!selectedEquipment && isWorkbenchClick) {
      onSelectEquipment(null, e);
    }
    setHoveredEquipment(null);
  }, [hoveredEquipment, heldItem, heldEquipment, selectedEquipment, onInitiatePour, onDropOnApparatus, onSelectEquipment]);

  const pouringSource = pouringState ? state.equipment.find(e => e.id === pouringState.sourceId) : null;
  const maxPourVolume = pouringSource?.solutions.reduce((total, s) => total + s.volume, 0) || 0;

  useEffect(() => {
    if (pouringState) {
        setPourVolume(Math.min(10, maxPourVolume));
    }
  }, [pouringState, maxPourVolume]);


  useEffect(() => {
    const ref = workbenchRef.current;
    if (!ref) return;
    
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalMouseUp = (e: MouseEvent) => handleMouseUp(e);

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="h-full flex flex-col">
      <Card 
        className="h-full rounded-none flex flex-col text-card-foreground bg-card/50 border-0"
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
          {heldEquipment && !pouringState && (
            <CardDescription className="flex items-center gap-2 text-accent-foreground p-2 bg-accent rounded-md">
              <Hand className="h-4 w-4"/>
              Holding: {heldEquipment.name}. Drag and drop on another apparatus to pour. (Press Esc to cancel)
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-2 md:p-6 text-foreground bg-muted">
            <div 
              ref={workbenchRef}
              className={cn(
                "relative w-full flex-1",
                (heldItem || heldEquipment) && "cursor-copy"
              )}
              onMouseDown={(e) => {
                if (e.target === workbenchRef.current || (e.target as HTMLElement).id === 'lab-slab') {
                  onSelectEquipment(null, e);
                }
              }}
            >
              <div 
                id="lab-slab" 
                className="absolute inset-4 rounded-xl bg-background/70 shadow-2xl backdrop-blur-sm border border-black/10"
                style={{
                  backgroundSize: '40px 40px',
                  backgroundImage: 'repeating-linear-gradient(0deg, hsl(var(--border) / 0.5) 0, hsl(var(--border) / 0.5) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, hsl(var(--border) / 0.5) 0, hsl(var(--border) / 0.5) 1px, transparent 1px, transparent 40px)',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3), inset 0 0 10px rgba(255,255,255,0.05)'
                }}
              ></div>
              {state.equipment.length > 0 ? (
                  <>
                      {state.equipment.map(item => (
                          <div
                            key={item.id}
                            onMouseEnter={() => { if (isHoldingSomething) setHoveredEquipment(item.id)}}
                            onMouseLeave={() => { if (isHoldingSomething) setHoveredEquipment(null)}}
                          >
                            <EquipmentDisplay 
                                item={item} 
                                state={state} 
                                onSelect={(id, e) => {
                                  onSelectEquipment(id, e);
                                  onPickUpEquipment(id, e);
                                }}
                                onDrop={onDropOnApparatus}
                                onInitiatePour={onInitiatePour}
                                onRemove={onRemoveSelectedEquipment}
                                onResize={onResizeEquipment}
                                isHoverTarget={(isHoldingSomething) && hoveredEquipment === item.id && item.id !== heldEquipment?.id}
                                isHeld={heldEquipment?.id === item.id}
                            />
                          </div>
                      ))}
                  </>
              ) : (
                   <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                     <p className="text-lg mb-2">Workbench is empty</p>
                     <p className="text-sm">Add equipment from your inventory to get started.</p>
                  </div>
              )}
            </div>
          
            <div className="w-full max-w-md mt-4">
              {pouringState && pouringSource && (
                <div className="flex flex-col items-center gap-4 w-full p-4 rounded-lg border border-border bg-background/80 backdrop-blur-sm shadow-lg">
                    <p className="text-sm font-medium text-foreground">Pour from {pouringSource.name}</p>
                    <div className="flex items-center gap-4 w-full px-4">
                        <Slider
                            value={[pourVolume]}
                            onValueChange={(v) => setPourVolume(v[0])}
                            min={0}
                            max={maxPourVolume}
                            step={Math.max(0.1, maxPourVolume/100)}
                        />
                        <span className="text-sm font-mono w-24 text-center">{pourVolume.toFixed(2)} ml</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => onPour(pourVolume)} className='flex-1' variant="default">Pour</Button>
                        <Button onClick={onCancelPour} className='flex-1' variant="outline">Cancel</Button>
                    </div>
                </div>
              )}
              {!pouringState && !selectedEquipment && hasBurette && hasTitrationTarget && (
                 <div className="flex flex-col items-center gap-4 w-full p-4 rounded-lg border border-border bg-background/80 backdrop-blur-sm shadow-lg">
                    <p className="text-sm font-medium text-foreground">Titration Control</p>
                     <div className="flex items-center gap-4 w-full px-4">
                         <Button onClick={() => onTitrate(0.1)} className='flex-1' variant="outline">Add 0.1ml</Button>
                         <Button onClick={() => onTitrate(1)} className='flex-1' variant="secondary">Add 1ml</Button>
                         <Button onClick={() => onTitrate(5)} className='flex-1' variant="default">Add 5ml</Button>
                    </div>
                </div>
              )}
            </div>

        </CardContent>
      </Card>
    </div>
  );
}
