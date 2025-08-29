'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Beaker, Pipette, Flame, Minus, Plus, TestTubeDiagonal } from 'lucide-react';
import type { ExperimentState } from '@/lib/experiment';
import { Slider } from './ui/slider';
import { useState } from 'react';

type WorkbenchProps = {
  state: ExperimentState;
  onTitrate: (volume: number) => void;
};

const BeakerIcon = ({ color, fillPercentage }: { color: string; fillPercentage: number }) => (
  <div className="relative h-64 w-48">
    <svg viewBox="0 0 100 120" className="h-full w-full">
      <defs>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--foreground) / 0.05)" />
          <stop offset="50%" stopColor="hsl(var(--foreground) / 0.2)" />
          <stop offset="100%" stopColor="hsl(var(--foreground) / 0.05)" />
        </linearGradient>
      </defs>
      <path
        d="M10 10 H90 L80 110 H20 L10 10 Z"
        stroke="hsl(var(--foreground) / 0.3)"
        strokeWidth="2"
        fill="url(#glass)"
      />
      <rect
        x="20.5"
        y={110 - (100 * fillPercentage) / 100}
        width="59"
        height={(100 * fillPercentage) / 100}
        fill={color}
        className="transition-all duration-500"
      />
    </svg>
    <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-muted-foreground">
      {Math.round(fillPercentage)}% Full
    </div>
  </div>
);

export function Workbench({ state, onTitrate }: WorkbenchProps) {
  const [titrationAmount, setTitrationAmount] = useState(1);
  const hasBeaker = state.equipment.some((e) => e.type === 'beaker');
  const hasBurette = state.equipment.some((e) => e.type === 'burette');
  const beakerSolution = state.beaker?.solutions[0];
  const buretteSolution = state.burette;
  
  const fillPercentage = beakerSolution ? ((beakerSolution.volume + state.volumeAdded) / 250) * 100 : 0;

  return (
    <Card className="h-full border-0 rounded-none bg-transparent">
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <TestTubeDiagonal />
          Workbench
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-between h-[calc(100%-80px)]">
        <div className="flex w-full justify-around items-end flex-1">
          {hasBurette && buretteSolution ? (
            <div className="flex flex-col items-center gap-2">
              <Pipette className="h-32 w-32 text-muted-foreground/50" />
              <p className="font-semibold text-lg">{buretteSolution.chemical.name}</p>
              <p className="text-sm text-muted-foreground">
                Remaining: <span className='font-bold text-foreground'>{(buretteSolution.volume - state.volumeAdded).toFixed(1)}ml</span>
              </p>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Pipette className="h-32 w-32" />
                <p>No Burette</p>
            </div>
          )}
          {hasBeaker && beakerSolution ? (
            <div className="flex flex-col items-center gap-2">
              <BeakerIcon color={state.color} fillPercentage={fillPercentage} />
              <p className="font-semibold text-lg">
                {beakerSolution.chemical.name}
              </p>
              {state.ph !== null && <p className="text-3xl font-bold">pH: {state.ph.toFixed(2)}</p>}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Beaker className="h-32 w-32" />
                <p>No Beaker</p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4 w-full max-w-lg p-4 mt-4 rounded-lg border bg-card">
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
