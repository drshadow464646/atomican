
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Equipment, Solution } from '@/lib/experiment';
import { Droplets, Beaker, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type EquipmentDetailsPanelProps = {
  equipment: Equipment;
};

export function EquipmentDetailsPanel({ equipment }: EquipmentDetailsPanelProps) {
  const totalVolume = equipment.solutions?.reduce((acc, s) => acc + s.volume, 0) || 0;
  const hasContents = equipment.solutions && equipment.solutions.length > 0;
  const reaction = equipment.reactionEffects;

  return (
    <Card className="shadow-lg backdrop-blur-xl bg-background/70 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Beaker className="h-5 w-5" />
          {equipment.name}
        </CardTitle>
        <CardDescription>
            {equipment.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="flex justify-between items-center mb-3">
          <div className="font-medium">Solution Color</div>
          <div className="flex items-center gap-2">
            <div 
                className="h-5 w-5 rounded-full border" 
                style={{ backgroundColor: equipment.color === 'transparent' ? 'white' : equipment.color }}
            />
            <span>{equipment.color === 'transparent' ? 'Colorless' : 'Colored'}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
            <div className="font-medium">pH Level</div>
            <div className="font-mono text-base font-bold">{equipment.ph?.toFixed(2) ?? 'N/A'}</div>
        </div>

        {reaction?.equation && (
            <>
                <Separator className="my-3"/>
                <h4 className="font-medium mb-2">Last Reaction</h4>
                <div className="p-2 bg-muted rounded-md text-center font-mono text-sm">
                    {reaction.equation}
                </div>
                 <p className="text-xs text-muted-foreground mt-2">{reaction.description}</p>
            </>
        )}

        <Separator className="my-3"/>

        <h4 className="font-medium mb-2">Contents</h4>
        {hasContents ? (
          <div className="space-y-2">
            {equipment.solutions.map((solution, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Droplets className="h-4 w-4 text-primary" />
                    <span>{solution.chemical.name}</span>
                </div>
                <div className="font-mono">{solution.volume.toFixed(1)} mL</div>
              </div>
            ))}
            <Separator className="my-2"/>
            <div className="flex justify-between items-center font-bold">
              <span>Total Volume</span>
              <span className="font-mono">{totalVolume.toFixed(1)} / {equipment.volume} mL</span>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-2">Container is empty.</p>
        )}
      </CardContent>
    </Card>
  );
}
