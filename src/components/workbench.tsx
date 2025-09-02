
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Beaker, Pipette, FlaskConical, TestTube } from 'lucide-react';
import type { Equipment, ExperimentState } from '@/lib/experiment';
import { Slider } from './ui/slider';
import { useState } from 'react';

const BeakerIcon = ({ color, fillPercentage }: { color: string; fillPercentage: number }) => {
  const liquidHeight = 95 * (fillPercentage / 100);
  const liquidY = 115 - liquidHeight;

  return (
    <div className="relative h-40 w-28">
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


const EquipmentDisplay = ({ item, state }: { item: Equipment, state: ExperimentState }) => {
    const beakerSolution = state.beaker?.solutions[0];
    const buretteSolution = state.burette;
    const fillPercentage = beakerSolution ? ((beakerSolution.volume + state.volumeAdded) / 250) * 100 : 0;
    
    const iconClass = "h-32 w-32 text-muted-foreground/50";

    const renderContent = () => {
        switch (item.type) {
            case 'beaker':
                return (
                    <>
                        <BeakerIcon color={state.color} fillPercentage={fillPercentage} />
                        <CardDescription className="text-foreground/80">{beakerSolution ? beakerSolution.chemical.name : 'Empty'}</CardDescription>
                        {state.ph !== null && <p className="text-xl font-bold text-foreground">pH: {state.ph.toFixed(2)}</p>}
                    </>
                );
            case 'burette':
                return (
                    <>
                        <Pipette className={iconClass} />
                        <CardDescription className="text-foreground/80">{buretteSolution ? buretteSolution.chemical.name : 'Empty'}</CardDescription>
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
                        <FlaskConical className={iconClass} />
                        <CardDescription className="text-foreground/80">{item.name}</CardDescription>
                    </>
                );
            default:
                return (
                    <>
                        <TestTube className={iconClass} />
                        <CardDescription className="text-foreground/80">{item.name}</CardDescription>
                    </>
                );
        }
    };

    return (
        <Card className="flex flex-col items-center justify-between p-4 bg-transparent border-0 shadow-none min-h-[220px]">
            <CardTitle className="text-base font-medium text-foreground/80">{item.name}</CardTitle>
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
                {renderContent()}
            </div>
        </Card>
    );
};

export function Workbench({ state, onTitrate }: { state: ExperimentState, onTitrate: (volume: number) => void; }) {
  const [titrationAmount, setTitrationAmount] = useState(1);
  const hasBeaker = state.equipment.some((e) => e.type === 'beaker');
  const hasBurette = state.equipment.some((e) => e.type === 'burette');
  
  return (
    <div className="h-full flex flex-col">
      <Card 
        className="h-full rounded-none flex flex-col text-card-foreground bg-card/50"
        style={{
          backgroundImage: `url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png')`,
          backgroundSize: '300px 300px',
          backgroundColor: 'hsl(var(--muted))'
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
                  className="relative w-full h-full bg-white rounded-lg shadow-[0_10px_20px_rgba(0,0,0,0.1),_0_6px_6px_rgba(0,0,0,0.15)]"
                  style={{
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1), 0 6px 6px rgba(0,0,0,0.15), inset 0 -2px 5px rgba(0,0,0,0.1)'
                  }}
                >
                    {state.equipment.length > 0 ? (
                        <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end justify-items-center p-4">
                            {state.equipment.map(item => (
                                <EquipmentDisplay key={item.id} item={item} state={state} />
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
