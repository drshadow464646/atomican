
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Beaker, Pipette, FlaskConical, TestTube, X, Hand, Scaling, Flame, Wind, Loader2, Microscope, Scale, Minus } from 'lucide-react';
import type { Chemical, Equipment, ExperimentState } from '@/lib/experiment';
import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Slider } from './ui/slider';

const ReactionEffects = ({ item }: { item: Equipment }) => {
    if (!item.reactionEffects) return null;
    
    const { gas, precipitate, isExplosive, key } = item.reactionEffects;

    return (
        <div key={key} className="absolute inset-0 pointer-events-none overflow-hidden rounded-b-lg">
            {gas && Array.from({ length: 10 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute w-1 h-1 bg-foreground/30 rounded-full animate-bubble"
                    style={{
                        left: `${15 + Math.random() * 70}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 2}s`,
                    }}
                />
            ))}
            {precipitate && (
                 <div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 animate-precipitate"
                    style={{ background: precipitate, height: '25%' }}
                 />
            )}
            {isExplosive && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Flame className="w-1/2 h-1/2 text-orange-500 animate-pulse" />
                </div>
            )}
        </div>
    );
};

// Common Liquid Rendering Logic
const Liquid = ({ d, color, isReacting }: { d: string, color: string, isReacting?: boolean}) => (
    <g>
        <defs>
            <linearGradient id={`liquidGradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color} stopOpacity="0.6" />
                <stop offset="50%" stopColor={color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={color} stopOpacity="0.6" />
            </linearGradient>
        </defs>
        <path
            d={d}
            fill={color === 'transparent' ? 'hsl(var(--background))' : `url(#liquidGradient-${color})`}
            className={cn("transition-all duration-500", isReacting && "animate-analyzing")}
        />
    </g>
);


const BeakerIcon = ({ item, fillPercentage, size }: { item: Equipment, fillPercentage: number; size: number }) => {
  const { color, isReacting } = item;
  const liquidHeight = 95 * (fillPercentage / 100);
  const liquidY = 115 - liquidHeight;
  
  const width = 7 * size;
  const height = 10 * size;

  return (
    <div className="relative" style={{ height: `${height}rem`, width: `${width}rem`}}>
      <ReactionEffects item={item} />
      <svg viewBox="0 0 100 120" className="h-full w-full">
        {fillPercentage > 0 && color && (
          <Liquid d={`M20,${liquidY} L 80,${liquidY} L 80,115 A 5,5 0 0 1 75,120 H 25 A 5,5 0 0 1 20,115 Z`} color={color} isReacting={isReacting}/>
        )}
        <path d="M10,10 L20,115 A 5,5 0 0 0 25,120 H 75 A 5,5 0 0 0 80,115 L 90,10" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="2" fill="transparent" />
        <path d="M10,10 H 90" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="3" fill="none" />
      </svg>
      {isReacting && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <Loader2 className="w-1/2 h-1/2 text-primary animate-spin" />
        </div>
      )}
    </div>
  );
};

const ErlenmeyerFlaskIcon = ({ item, fillPercentage, size }: { item: Equipment, fillPercentage: number; size: number }) => {
    const { color, isReacting } = item;
    const liquidHeight = 70 * (fillPercentage / 100);
    const liquidY = 115 - liquidHeight;

    const width = 7 * size;
    const height = 10 * size;

    return (
        <div className="relative" style={{ height: `${height}rem`, width: `${width}rem`}}>
            <ReactionEffects item={item} />
            <svg viewBox="0 0 100 120" className="w-full h-full">
                {fillPercentage > 0 && color && (
                    <Liquid d={`M10,${liquidY} L 90,${liquidY} L 90,115 A 5,5 0 0 1 85,120 H 15 A 5,5 0 0 1 10,115 Z`} color={color} isReacting={isReacting}/>
                )}
                <path d="M35,10 H 65 M30,20 H 70 M30,20 L10,115 A 5,5 0 0 0 15,120 H 85 A 5,5 0 0 0 90,115 L 70,20" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="2" fill="transparent" />
            </svg>
            {isReacting && <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm"><Loader2 className="w-1/2 h-1/2 text-primary animate-spin" /></div>}
        </div>
    );
};

const GraduatedCylinderIcon = ({ item, fillPercentage, size }: { item: Equipment, fillPercentage: number; size: number }) => {
    const { color, isReacting } = item;
    const liquidHeight = 100 * (fillPercentage / 100);
    const liquidY = 115 - liquidHeight;
    const width = 4 * size;
    const height = 10 * size;

    return (
        <div className="relative" style={{ height: `${height}rem`, width: `${width}rem`}}>
            <ReactionEffects item={item} />
            <svg viewBox="0 0 60 120" className="w-full h-full">
                {fillPercentage > 0 && color && (
                    <Liquid d={`M10,${liquidY} L 50,${liquidY} L 50,115 A 5,5 0 0 1 45,120 H 15 A 5,5 0 0 1 10,115 Z`} color={color} isReacting={isReacting}/>
                )}
                <path d="M5,10 H 55 L 50,115 A 5,5 0 0 1 45,120 H 15 A 5,5 0 0 1 10,115 L 5,10 Z" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="2" fill="transparent" />
                {[...Array(4)].map((_, i) => (
                    <line key={i} x1="10" y1={30 + i * 20} x2="20" y2={30 + i * 20} stroke="hsl(var(--foreground) / 0.2)" strokeWidth="1.5" />
                ))}
            </svg>
            {isReacting && <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm"><Loader2 className="w-1/2 h-1/2 text-primary animate-spin" /></div>}
        </div>
    );
};

const VolumetricFlaskIcon = ({ item, fillPercentage, size }: { item: Equipment, fillPercentage: number; size: number }) => {
    const { color, isReacting } = item;
    // Fill calculation is complex; simplified for visualization
    const neckFill = Math.min(100, fillPercentage * 2);
    const bulbFill = Math.max(0, fillPercentage * 2 - 100);
    const width = 7 * size;
    const height = 10 * size;

    return (
        <div className="relative" style={{ height: `${height}rem`, width: `${width}rem`}}>
            <ReactionEffects item={item} />
            <svg viewBox="0 0 100 120" className="w-full h-full">
                {bulbFill > 0 && color && <Liquid d="M50,120 C 10,120 10,60 50,60 C 90,60 90,120 50,120 Z" color={color} isReacting={isReacting}/>}
                {neckFill > 0 && color && <Liquid d={`M42,60 L 58,60 L 58,${60-neckFill*0.5} L 42,${60-neckFill*0.5} Z`} color={color} isReacting={isReacting} />}
                
                <path d="M50,120 C 10,120 10,60 50,60 C 90,60 90,120 50,120 Z" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="2" fill="transparent" />
                <path d="M42,60 L 42,10 H 58 L 58,60" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="2" fill="transparent" />
                <line x1="35" y1="40" x2="65" y2="40" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="1.5" />
            </svg>
            {isReacting && <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm"><Loader2 className="w-1/2 h-1/2 text-primary animate-spin" /></div>}
        </div>
    );
};

const TestTubeIcon = ({ item, fillPercentage, size }: { item: Equipment, fillPercentage: number; size: number }) => {
    const { color, isReacting } = item;
    const liquidHeight = 100 * (fillPercentage / 100);
    const liquidY = 110 - liquidHeight;
    const width = 3 * size;
    const height = 10 * size;

    return (
        <div className="relative" style={{ height: `${height}rem`, width: `${width}rem`}}>
            <ReactionEffects item={item} />
            <svg viewBox="0 0 40 120" className="w-full h-full">
                {fillPercentage > 0 && color && (
                    <Liquid d={`M5,${liquidY} L 35,${liquidY} V 110 A 15 15 0 0 1 20 110 A 15 15 0 0 1 5 110 Z`} color={color} isReacting={isReacting}/>
                )}
                <path d="M5,10 L 5,100 A 15,15 0 1 0 35,100 L 35,10" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="2" fill="transparent" />
            </svg>
             {isReacting && <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm"><Loader2 className="w-1/2 h-1/2 text-primary animate-spin" /></div>}
        </div>
    );
};

const EquipmentDisplay = ({ 
  item, 
  onMouseDown,
  onClick,
  onMouseUp,
  onRemove,
  onResize,
  onDetachFunnel,
  isHoverTarget,
  isHeld,
}: { 
  item: Equipment, 
  onMouseDown: (id: string, e: React.MouseEvent) => void,
  onClick: (id: string, e: React.MouseEvent) => void,
  onMouseUp: (id: string) => void,
  onRemove: (id: string) => void,
  onResize: (id: string, size: number) => void,
  onDetachFunnel?: (id: string) => void,
  isHoverTarget: boolean,
  isHeld: boolean,
}) => {
    const totalVolume = item.solutions?.reduce((sum, s) => sum + s.volume, 0) || 0;
    const fillPercentage = item.volume ? (totalVolume / item.volume) * 100 : 0;
    
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
        const id = item.id.split('-')[0]; // Use base id for matching
        
        // Liquid containers
        if (item.type === 'beaker') return <BeakerIcon item={item} fillPercentage={fillPercentage} size={size} />;
        if (item.type === 'erlenmeyer-flask') return <ErlenmeyerFlaskIcon item={item} fillPercentage={fillPercentage} size={size} />;
        if (item.type === 'graduated-cylinder') return <GraduatedCylinderIcon item={item} fillPercentage={fillPercentage} size={size} />;
        if (item.type === 'volumetric-flask') return <VolumetricFlaskIcon item={item} fillPercentage={fillPercentage} size={size} />;
        if (item.type === 'test-tube') return <TestTubeIcon item={item} fillPercentage={fillPercentage} size={size} />;

        // Other equipment
        if (id.includes('burette')) return <Pipette className={iconClass} style={iconStyle} />;
        if (id.includes('pipette')) return <Pipette className={iconClass} style={iconStyle} />;
        if (id.includes('funnel')) return <Wind className={iconClass} style={{ height: `${4 * size}rem`, width: `${4 * size}rem` }} />;
        if (id.includes('ph-meter') || id.includes('thermometer')) return <Pipette className={iconClass} style={iconStyle} />; // Placeholder
        if (id.includes('balance')) return <Scale className={iconClass} style={iconStyle} />;
        if (id.includes('microscope')) return <Microscope className={iconClass} style={iconStyle} />;
        
        // Default fallback
        return <BeakerIcon item={item} fillPercentage={fillPercentage} size={size} />;
    };

    return (
        <div 
            id={item.id}
            data-equipment-id={item.id}
            className={cn(
                "absolute flex flex-col items-center justify-center p-2 bg-transparent transition-all duration-200 rounded-lg group",
                item.isSelected && !isHeld && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-2xl z-10",
                isHoverTarget && "ring-2 ring-accent ring-offset-2 ring-offset-background shadow-2xl",
                isHeld ? "cursor-grabbing opacity-75 z-20" : "cursor-grab",
                item.isReacting && "pointer-events-none"
            )}
            style={{ 
                left: `${item.position.x}px`, 
                top: `${item.position.y}px`,
                transform: `translate(-50%, ${item.attachedFunnels && item.attachedFunnels.length > 0 ? '-60%' : '-50%'})`, // Adjust position when funnel is attached
                touchAction: 'none',
            }}
            onMouseDown={(e) => onMouseDown(item.id, e)}
            onClick={(e) => onClick(item.id, e)}
            onMouseUp={() => onMouseUp(item.id)}
        >
            {item.attachedFunnels?.map(funnel => (
                 <div key={funnel.id} className="absolute top-0 transform -translate-y-full flex flex-col items-center">
                    <EquipmentDisplay 
                        item={funnel}
                        onMouseDown={()=>{}}
                        onClick={()=>{}}
                        onMouseUp={()=>{}}
                        onRemove={()=>{}}
                        onResize={()=>{}}
                        isHoverTarget={false}
                        isHeld={false}
                    />
                    {onDetachFunnel && (
                         <Button size="icon" variant="ghost" className="h-6 w-6 -mt-4" onClick={() => onDetachFunnel(funnel.id)}>
                            <Minus className="h-4 w-4" />
                         </Button>
                    )}
                 </div>
            ))}

            {item.isSelected && !isHeld && !item.isReacting && (
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
    onSelectEquipment,
    onDropOnApparatus,
    onPour,
    onCancelPour,
    heldItem,
    heldEquipment,
    onRemoveSelectedEquipment,
    pouringState,
    onDragStart,
    onWorkbenchClick,
    onEquipmentClick,
    onMouseUpOnEquipment,
    onDetachFunnel,
}: { 
    state: ExperimentState, 
    onTitrate: (volume: number, sourceId?: string, targetId?: string) => void;
    onResizeEquipment: (id: string, size: number) => void;
    onSelectEquipment: (id: string | null) => void;
    onDropOnApparatus: (equipmentId: string) => void;
    onPour: (volume: number) => void;
    onCancelPour: () => void;
    heldItem: Chemical | null;
    heldEquipment: Equipment | null;
    onRemoveSelectedEquipment: (id: string) => void;
    pouringState: { sourceId: string; targetId: string; } | null;
    onDragStart: (id: string, e: React.MouseEvent) => void;
    onWorkbenchClick: (e: React.MouseEvent) => void;
    onEquipmentClick: (id: string, e: React.MouseEvent) => void;
    onMouseUpOnEquipment: (id: string) => void;
    onDetachFunnel: (funnelId: string) => void;
}) {
  const workbenchRef = useRef<HTMLDivElement>(null);
  const [hoveredEquipmentId, setHoveredEquipmentId] = useState<string | null>(null);
  const [pourVolume, setPourVolume] = useState(10);
  
  const hasBurette = state.equipment.some((e) => e.type === 'burette');
  const hasTitrationTarget = state.equipment.some((e) => e.type === 'beaker' || e.type === 'erlenmeyer-flask');
  
  const selectedEquipment = state.equipment.find(e => e.isSelected);
  const isHoldingSomething = !!heldItem || !!heldEquipment;

  const pouringSourceItem = pouringState ? (pouringState.sourceId === 'inventory' ? heldItem : state.equipment.find(e => e.id === pouringState.sourceId)) : null;
  const pouringTargetItem = pouringState ? state.equipment.find(e => e.id === pouringState.targetId) : null;
  
  let maxPourVolume = 0;
  if (pouringState && pouringSourceItem && pouringTargetItem) {
      const targetVolume = pouringTargetItem.volume || 0;
      const currentTargetVolume = pouringTargetItem.solutions.reduce((acc, s) => acc + s.volume, 0);
      const targetCapacity = Math.max(0, targetVolume - currentTargetVolume);
      
      if (pouringState.sourceId === 'inventory') {
          maxPourVolume = targetCapacity;
      } else {
          const source = pouringSourceItem as Equipment;
          const sourceVolume = source.solutions.reduce((t, s) => t + s.volume, 0);
          maxPourVolume = Math.min(sourceVolume, targetCapacity);
      }
  }

  useEffect(() => {
    if (pouringState) {
        setPourVolume(Math.min(10, maxPourVolume));
    }
  }, [pouringState, maxPourVolume]);

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    let targetId: string | null = null;
    
    if (isHoldingSomething && workbenchRef.current) {
        const elements = Array.from(workbenchRef.current.children);
        // Find the element under the cursor
        for (const elem of elements) {
            const equipmentId = elem.getAttribute('data-equipment-id');
            if (!equipmentId) continue;
            
            // Can't drop on itself or on an attached funnel
            const isSelf = equipmentId === heldEquipment?.id;
            const isAttachedFunnel = state.equipment.some(eq => eq.attachedFunnels?.some(f => f.id === equipmentId));
            
            if (!isSelf && !isAttachedFunnel) {
                 const rect = elem.getBoundingClientRect();
                 if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                     targetId = equipmentId;
                     break;
                 }
            }
        }
    }
    setHoveredEquipmentId(targetId);
  }, [isHoldingSomething, heldEquipment, state.equipment]);
  
  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [handleGlobalMouseMove]);

  return (
    <div className="flex flex-col h-full">
      <Card 
        className="h-full rounded-none flex flex-col text-card-foreground bg-card/50 border-0"
      >
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-foreground'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-test-tube-diagonal"><path d="M14.5 2.5 16 4l-1.5 1.5"/><path d="M17.5 5.5 19 7l-1.5 1.5"/><path d="m3 21 7-7"/><path d="M13.5 6.5 16 9l4-4"/><path d="m3 21 7-7"/><path d="M14.5 6.5 17 9l4-4"/><path d="M10.586 11.414a2 2 0 1 1 2.828-2.828"/></svg>
            Workbench
          </CardTitle>
           {heldItem && !pouringState && (
            <CardDescription className="flex items-center gap-2 text-accent-foreground p-2 bg-accent rounded-md">
              <Hand className="h-4 w-4"/>
              Holding: {heldItem.name}. Click on an apparatus to add it. (Press Esc to cancel)
            </CardDescription>
          )}
          {heldEquipment && !pouringState && (
            <CardDescription className="flex items-center gap-2 text-accent-foreground p-2 bg-accent rounded-md">
              <Hand className="h-4 w-4"/>
              Holding: {heldEquipment.name}. Drag over another apparatus and release to pour. (Press Esc to cancel)
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-2 md:p-6 text-foreground bg-muted">
            <div 
              ref={workbenchRef}
              className={cn(
                "relative w-full flex-1",
                (heldItem || heldEquipment) && "cursor-grabbing"
              )}
              onMouseDown={onWorkbenchClick}
              onMouseUp={() => {
                if (heldItem && hoveredEquipmentId) {
                  onDropOnApparatus(hoveredEquipmentId);
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
              {state.equipment.filter(e => !e.isAttached).length > 0 ? (
                  <>
                      {state.equipment.filter(e => !e.isAttached).map(item => (
                          <EquipmentDisplay 
                              key={item.id}
                              item={item} 
                              onMouseDown={onDragStart}
                              onClick={onEquipmentClick}
                              onMouseUp={onMouseUpOnEquipment}
                              onRemove={onRemoveSelectedEquipment}
                              onResize={onResizeEquipment}
                              onDetachFunnel={onDetachFunnel}
                              isHoverTarget={isHoldingSomething && hoveredEquipmentId === item.id}
                              isHeld={heldEquipment?.id === item.id}
                          />
                      ))}
                  </>
              ) : (
                   null
              )}
            </div>
          
            <div className="w-full max-w-md mt-4">
              {pouringState && pouringSourceItem && pouringTargetItem && (
                <div className="flex flex-col items-center gap-4 w-full p-4 rounded-lg border border-border bg-background/80 backdrop-blur-sm shadow-lg">
                    <p className="text-sm font-medium text-foreground">
                      {pouringState.sourceId === 'inventory' ? `Add ${pouringSourceItem.name} to ${pouringTargetItem.name}` : `Pour from ${(pouringSourceItem as Equipment).name} into ${pouringTargetItem.name}`}
                    </p>
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
                        <Button onClick={() => onPour(pourVolume)} className='flex-1' variant="default">
                            {pouringState.sourceId === 'inventory' ? 'Add' : 'Pour'}
                        </Button>
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
