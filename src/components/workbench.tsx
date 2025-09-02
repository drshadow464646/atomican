
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Beaker, Pipette, FlaskConical, TestTube, X, ZoomIn } from 'lucide-react';
import type { Equipment, ExperimentState } from '@/lib/experiment';
import { Slider } from './ui/slider';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const BeakerIcon = ({ color, fillPercentage, size }: { color: string; fillPercentage: number; size: number }) => {
  const liquidHeight = 95 * (fillPercentage / 100);
  const liquidY = 115 - liquidHeight;

  return (
    <div className="relative" style={{ height: `${10 * size}rem`, width: `${7 * size}rem`}}>
      <svg viewBox="0 0 100 120" className="h-full w-full">
        <defs>
           <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.7" />
              <stop offset="50%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Liquid */}
        {fillPercentage > 0 && (
          <g>
            <path
              d={`M20,${liquidY} L 80,${liquidY} L 80,115 A 5,5 0 0 1 75,120 H 25 A 5,5 0 0 1 20,115 Z`}
              fill={color === 'transparent' ? 'hsl(var(--background))' : `url(#liquidGradient)`}
              className="transition-all duration-500"
            />
          </g>
        )}

        {/* Beaker Glass */}
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
      <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-muted-foreground">
        {Math.round(fillPercentage)}% Full
      </div>
    </div>
  );
};


const EquipmentDisplay = ({ 
  item, 
  state,
  onRemove,
  onResize,
}: { 
  item: Equipment, 
  state: ExperimentState,
  onRemove: (id: string) => void,
  onResize: (id: string, size: number) => void,
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
                return (
                    <>
                        <BeakerIcon color={state.color} fillPercentage={fillPercentage} size={size} />
                        <CardDescription className="text-foreground/80 mt-2">{beakerSolution ? beakerSolution.chemical.name : 'Empty'}</CardDescription>
                        {state.ph !== null && <p className="text-xl font-bold text-foreground">pH: {state.ph.toFixed(2)}</p>}
                    </>
                );
            case 'burette':
                return (
                    <>
                        <Pipette className={iconClass} style={iconStyle} />
                        <CardDescription className="text-foreground/80 mt-2">{buretteSolution ? buretteSolution.chemical.name : 'Empty'}</CardDescription>
                         {buretteSolution && (
                            <p className="text-sm text-muted-foreground">
                                <span className='font-bold text-foreground'>{(buretteSolution.volume - state.volumeAdded).toFixed(1)}ml</span> left
                            </p>
                        )}
                    </>
                );
            case 'erlenmeyer-flask':
                 return (
                    <>
                        <FlaskConical className={iconClass} style={iconStyle} />
                        <CardDescription className="text-foreground/80 mt-2">{item.name}</CardDescription>
                    </>
                );
            default:
                return (
                    <>
                        <TestTube className={iconClass} style={iconStyle} />
                        <CardDescription className="text-foreground/80 mt-2">{item.name}</CardDescription>
                    </>
                );
        }
    };

    return (
        <Card className="relative flex flex-col items-center justify-between p-4 bg-transparent border-0 shadow-none min-h-[220px] transition-all" style={{ gridColumn: `span ${Math.round(size)}`}}>
            <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-6 w-6" onClick={() => onRemove(item.id)}>
                <X className="h-4 w-4" />
            </Button>
            <CardTitle className="text-base font-medium text-foreground/80">{item.name}</CardTitle>
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
                {renderContent()}
            </div>
            <div className="w-full max-w-xs pt-4">
                <div className="flex items-center gap-2">
                    <ZoomIn className="h-4 w-4 text-muted-foreground" />
                    <Slider
                        value={[size]}
                        onValueChange={(value) => onResize(item.id, value[0])}
                        min={0.5}
                        max={1.5}
                        step={0.1}
                    />
                </div>
            </div>
        </Card>
    );
};

export function Workbench({ 
    state, 
    onTitrate,
    onRemoveEquipment,
    onResizeEquipment
}: { 
    state: ExperimentState, 
    onTitrate: (volume: number) => void;
    onRemoveEquipment: (id: string) => void;
    onResizeEquipment: (id: string, size: number) => void;
}) {
  const [titrationAmount, setTitrationAmount] = useState(1);
  const hasBeaker = state.equipment.some((e) => e.type === 'beaker');
  const hasBurette = state.equipment.some((e) => e.type === 'burette');
  
  return (
    <div className="h-full flex flex-col">
      <Card 
        className="h-full rounded-none flex flex-col text-card-foreground bg-card/50"
        style={{
          backgroundImage: 'url(/tile.svg)',
          backgroundSize: '300px',
          backgroundRepeat: 'repeat',
        }}
      >
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-foreground'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-test-tube-diagonal"><path d="M14.5 2.5 16 4l-1.5 1.5"/><path d="M17.5 5.5 19 7l-1.5 1.5"/><path d="m3 21 7-7"/><path d="M13.5 6.5 16 9l4-4"/><path d="m3 21 7-7"/><path d="M14.5 6.5 17 9l4-4"/><path d="M10.586 11.414a2 2 0 1 1 2.828-2.828"/></svg>
            Workbench
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-2 md:p-6 text-foreground">
            <div className="relative w-full flex-1 flex items-center justify-center p-4 md:p-8">
                <div
                    className="relative w-full h-full rounded-2xl border border-white/10 bg-black/20 p-4 shadow-2xl backdrop-blur-md"
                    style={{
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
                    }}
                >
                    {state.equipment.length > 0 ? (
                        <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end justify-items-center p-4">
                            {state.equipment.map(item => (
                                <EquipmentDisplay 
                                    key={item.id} 
                                    item={item} 
                                    state={state} 
                                    onRemove={onRemoveEquipment}
                                    onResize={onResizeEquipment}
                                />
                            ))}
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                            {/* This is now empty for a clean slate */}
                        </div>
                    )}
                </div>
            </div>

          {hasBeaker && hasBurette && (
            <div className="flex flex-col items-center gap-4 w-full max-w-lg p-4 mt-4 rounded-lg border border-border bg-background/80 backdrop-blur-sm shadow-lg">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    