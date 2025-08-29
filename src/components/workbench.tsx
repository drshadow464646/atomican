'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Beaker, Pipette, Flame, Minus, Plus } from 'lucide-react';
import type { ExperimentState } from '@/lib/experiment';

type WorkbenchProps = {
  state: ExperimentState;
  onTitrate: (volume: number) => void;
};

const BeakerIcon = ({ color, fillPercentage }: { color: string; fillPercentage: number }) => (
  <div className="relative h-64 w-48">
    <svg viewBox="0 0 100 120" className="h-full w-full">
      <path
        d="M10 10 H90 L80 110 H20 L10 10 Z"
        stroke="hsl(var(--foreground) / 0.7)"
        strokeWidth="2"
        fill="transparent"
      />
      <rect
        x="20"
        y={110 - (100 * fillPercentage) / 100}
        width="60"
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
  const hasBeaker = state.equipment.some((e) => e.type === 'beaker');
  const hasBurette = state.equipment.some((e) => e.type === 'burette');
  const beakerSolution = state.beaker?.solutions[0];
  const buretteSolution = state.burette;
  
  const fillPercentage = beakerSolution ? ((beakerSolution.volume + state.volumeAdded) / 250) * 100 : 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Workbench</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-between h-[calc(100%-80px)]">
        <div className="flex w-full justify-around items-end">
          {hasBurette && buretteSolution && (
            <div className="flex flex-col items-center gap-2">
              <Pipette className="h-32 w-32 text-muted-foreground/50" />
              <p className="text-sm font-medium">{buretteSolution.chemical.name}</p>
              <p className="text-xs text-muted-foreground">
                Remaining: {(buretteSolution.volume - state.volumeAdded).toFixed(1)}ml
              </p>
            </div>
          )}
          {hasBeaker && beakerSolution && (
            <div className="flex flex-col items-center gap-2">
              <BeakerIcon color={state.color} fillPercentage={fillPercentage} />
              <p className="text-sm font-medium">
                {beakerSolution.chemical.name}
              </p>
              {state.ph !== null && <p className="text-xl font-bold">pH: {state.ph.toFixed(2)}</p>}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4 w-full max-w-md p-4 border-t">
            <p className="text-sm font-medium text-muted-foreground">Titration Control</p>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => onTitrate(1)} disabled={!hasBurette || !hasBeaker}>
                    <Plus className="h-4 w-4" />
                </Button>
                <div className="flex flex-col gap-2">
                    <Button onClick={() => onTitrate(0.1)} size="sm" disabled={!hasBurette || !hasBeaker}>Add 0.1ml</Button>
                    <Button onClick={() => onTitrate(1)} size="sm" disabled={!hasBurette || !hasBeaker}>Add 1ml</Button>
                    <Button onClick={() => onTitrate(10)} size="sm" disabled={!hasBurette || !hasBeaker}>Add 10ml</Button>
                </div>
                 <Button variant="outline" size="icon" onClick={() => onTitrate(-1)} disabled={!hasBurette || !hasBeaker}>
                    <Minus className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
