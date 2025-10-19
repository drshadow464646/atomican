
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Equipment, Solution } from '@/lib/experiment';
import { Droplets, Beaker, ChevronsRight, Thermometer, Link, Link2Off, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useExperiment } from '@/hooks/use-experiment';

type EquipmentDetailsPanelProps = {
  equipment: Equipment;
};

export function EquipmentDetailsPanel({ equipment }: EquipmentDetailsPanelProps) {
  const { handleInitiateAttachment, attachmentState, setAttachmentState, handleMixSolutions } = useExperiment();
  const totalVolume = equipment.solutions?.reduce((acc, s) => acc + s.volume, 0) || 0;
  const hasContents = equipment.solutions && equipment.solutions.length > 0;
  const reaction = equipment.reactionEffects;

  const isAttaching = attachmentState?.sourceId === equipment.id;
  const canMix = equipment.solutions && equipment.solutions.length > 1;

  const handleCancelAttachment = () => setAttachmentState(null);

  return (
    <Card className="shadow-lg backdrop-blur-xl bg-background/70 border-border/50">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2 text-base">
                <Beaker className="h-5 w-5" />
                {equipment.name}
                </CardTitle>
                <CardDescription>
                    {equipment.description}
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {canMix && (
                <Button variant="secondary" size="sm" onClick={() => handleMixSolutions(equipment.id)} disabled={equipment.isReacting}>
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Mix
                </Button>
              )}
              <Button
                  variant={isAttaching ? 'destructive' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => isAttaching ? handleCancelAttachment() : handleInitiateAttachment(equipment.id)}
              >
                  {isAttaching ? <Link2Off className="h-4 w-4" /> : <Link className="h-4 w-4" />}
              </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        {isAttaching && (
            <div className="bg-accent text-accent-foreground text-xs p-2 rounded-md mb-3 text-center">
                Click another apparatus to connect.
            </div>
        )}
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

        <div className="flex justify-between items-center mb-3">
            <div className="font-medium">pH Level</div>
            <div className="font-mono text-base font-bold">{equipment.ph?.toFixed(2) ?? 'N/A'}</div>
        </div>
        
        {reaction?.temperatureChange !== undefined && (
            <div className="flex justify-between items-center mb-4">
                <div className="font-medium flex items-center gap-1"><Thermometer className="h-4 w-4"/> Temp. Change</div>
                <div className="font-mono text-base font-bold">
                    {reaction.temperatureChange > 0 ? '+' : ''}{reaction.temperatureChange.toFixed(1)}°C
                </div>
            </div>
        )}

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
