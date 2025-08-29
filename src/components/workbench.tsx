
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

const BeakerIcon = ({ color, fillPercentage }: { color: string; fillPercentage: number }) => {
  const liquidHeight = 95 * (fillPercentage / 100);
  const liquidY = 115 - liquidHeight;

  return (
    <div className="relative h-48 w-32 md:h-64 md:w-48">
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
           <filter id="liquidSurface" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
              <feOffset in="blur" dx="0" dy="-1" result="offsetBlur"/>
              <feSpecularLighting in="offsetBlur" surfaceScale="5" specularConstant=".75" specularExponent="20" lighting-color="#FFF" result="specular">
                  <fePointLight x="-5000" y="-10000" z="20000" />
              </feSpecularLighting>
              <feComposite in="specular" in2="SourceAlpha" operator="in" result="specular" />
              <feComposite in="SourceGraphic" in2="specular" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>
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
              style={{filter: 'url(#liquidSurface)'}}
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
         {/* Highlight */}
        <path 
          d="M 80 15 C 75 40, 75 80, 80 110" 
          stroke="white" 
          strokeWidth="1.5"
          fill="none" 
          strokeOpacity="0.5"
        />

      </svg>
      <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-muted-foreground">
        {Math.round(fillPercentage)}% Full
      </div>
    </div>
  );
};


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
        <div className="flex w-full flex-col md:flex-row justify-around items-center md:items-end flex-1">
          {hasBurette && buretteSolution ? (
            <div className="flex flex-col items-center gap-2">
              <Pipette className="h-24 w-24 md:h-32 md:w-32 text-muted-foreground/50" />
              <p className="font-semibold text-lg">{buretteSolution.chemical.name}</p>
              <p className="text-sm text-muted-foreground">
                Remaining: <span className='font-bold text-foreground'>{(buretteSolution.volume - state.volumeAdded).toFixed(1)}ml</span>
              </p>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Pipette className="h-24 w-24 md:h-32 md:w-32" />
                <p>No Burette</p>
            </div>
          )}
          {hasBeaker && beakerSolution ? (
            <div className="flex flex-col items-center gap-2">
              <BeakerIcon color={state.color} fillPercentage={fillPercentage} />
              <p className="font-semibold text-lg">
                {beakerSolution.chemical.name}
              </p>
              {state.ph !== null && <p className="text-2xl md:text-3xl font-bold">pH: {state.ph.toFixed(2)}</p>}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Beaker className="h-24 w-24 md:h-32 md:w-32" />
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
