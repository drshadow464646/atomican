
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Beaker, Pipette, Flame, Minus, Plus, TestTubeDiagonal, FlaskConical } from 'lucide-react';
import type { Equipment, ExperimentState } from '@/lib/experiment';
import { Slider } from './ui/slider';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type WorkbenchProps = {
  state: ExperimentState;
  onTitrate: (volume: number) => void;
};

const BeakerIcon = ({ color, fillPercentage }: { color: string; fillPercentage: number }) => {
  const liquidHeight = 95 * (fillPercentage / 100);
  const liquidY = 115 - liquidHeight;

  return (
    <div className="relative h-40 w-28">
      <svg viewBox="0 0 100 120" className="h-full w-full">
        <defs>
          <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: 'hsl(var(--foreground) / 0.05)' }} />
            <stop offset="20%" style={{ stopColor: 'hsl(var(--foreground) / 0.15)' }} />
            <stop offset="50%" style={{ stopColor: 'hsl(var(--foreground) / 0.05)' }} />
            <stop offset="80%" style={{ stopColor: 'hsl(var(--foreground) / 0.15)' }} />
            <stop offset="100%" style={{ stopColor: 'hsl(var(--foreground) / 0.05)' }} />
          </linearGradient>
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
              d={`M20,${liquidY} C 40,${liquidY-5}, 60,${liquidY-5}, 80,${liquidY} L 80,115 A 5,5 0 0 1 75,120 H 25 A 5,5 0 0 1 20,115 Z`}
              fill={color === 'transparent' ? 'hsl(var(--background))' : `url(#liquidGradient)`}
              className="transition-all duration-500"
            />
             <ellipse 
              cx="50" 
              cy={liquidY} 
              rx="30" 
              ry="3" 
              fill={color === 'transparent' ? 'hsl(var(--foreground) / 0.1)' : color}
              className="transition-all duration-500"
            />
          </g>
        )}

        {/* Beaker Glass */}
        <path
          d="M10,10 L20,115 A 5,5 0 0 0 25,120 H 75 A 5,5 0 0 0 80,115 L 90,10"
          stroke="hsl(var(--foreground) / 0.3)"
          strokeWidth="2"
          fill="url(#glassGradient)"
          fillOpacity="0.7"
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

    const renderContent = () => {
        switch (item.type) {
            case 'beaker':
                return (
                    <>
                        <BeakerIcon color={state.color} fillPercentage={fillPercentage} />
                        <CardDescription>{beakerSolution ? beakerSolution.chemical.name : 'Empty'}</CardDescription>
                        {state.ph !== null && <p className="text-xl font-bold">pH: {state.ph.toFixed(2)}</p>}
                    </>
                );
            case 'burette':
                return (
                    <>
                        <Pipette className="h-32 w-32 text-muted-foreground/50" />
                        <CardDescription>{buretteSolution ? buretteSolution.chemical.name : 'Empty'}</CardDescription>
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
                        <FlaskConical className="h-32 w-32 text-muted-foreground/50" />
                        <CardDescription>{item.name}</CardDescription>
                    </>
                );
            default:
                return (
                    <>
                        <Beaker className="h-32 w-32 text-muted-foreground/50" />
                        <CardDescription>{item.name}</CardDescription>
                    </>
                );
        }
    };

    return (
        <Card className="flex flex-col items-center justify-between p-4 bg-transparent border-0 shadow-none min-h-[220px]">
            <CardTitle className="text-base font-medium">{item.name}</CardTitle>
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
                {renderContent()}
            </div>
        </Card>
    );
};

export function Workbench({ state, onTitrate }: WorkbenchProps) {
  const [titrationAmount, setTitrationAmount] = useState(1);
  const hasBeaker = state.equipment.some((e) => e.type === 'beaker');
  const hasBurette = state.equipment.some((e) => e.type === 'burette');
  
  return (
    <Card className="h-full border-0 rounded-none bg-transparent flex flex-col">
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <TestTubeDiagonal />
          Workbench
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-between p-2 md:p-6">
        {state.equipment.length > 0 ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end flex-1">
            {state.equipment.map(item => (
                <EquipmentDisplay key={item.id} item={item} state={state} />
            ))}
          </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
                <TestTubeDiagonal className="h-24 w-24" />
                <p className="text-center">Your workbench is empty.<br />Add equipment from your inventory to begin.</p>
            </div>
        )}

        <div className="flex flex-col items-center gap-4 w-full max-w-lg p-4 mt-auto rounded-lg border bg-card/50">
            <p className="text-sm font-medium">Titration Control</p>
            <div className="flex items-center gap-4 w-full">
                <Slider 
                  value={[titrationAmount]}
                  onValueChange={(value) => setTitrationAmount(value[0])}
                  min={0.1}
                  max={10}
                  step={0.1}
                  disabled={!hasBurette || !hasBeaker}
                />
                <Button onClick={() => onTitrate(titrationAmount)} disabled={!hasBurette || !hasBeaker} className='w-48'>
                    Add {titrationAmount.toFixed(1)}ml
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
