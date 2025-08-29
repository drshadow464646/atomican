
'use client';

import { Beaker, FlaskConical, Pipette, Droplets, Plus, PanelLeftClose, PanelRightClose, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Chemical, Equipment } from '@/lib/experiment';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type InventoryPanelProps = {
  equipment: Equipment[];
  chemicals: Chemical[];
  onAddEquipment: (equipment: Equipment) => void;
  onAddChemical: (chemical: Chemical, target: 'beaker' | 'burette') => void;
  onAddIndicator: (chemical: Chemical) => void;
  isCollapsed: boolean;
};

const equipmentIcons = {
  beaker: <Beaker className="mr-2 h-5 w-5" />,
  burette: <Pipette className="mr-2 h-5 w-5" />,
  pipette: <Pipette className="mr-2 h-5 w-5" />,
};

export function InventoryPanel({
  equipment,
  chemicals,
  onAddEquipment,
  onAddChemical,
  onAddIndicator,
  isCollapsed,
}: InventoryPanelProps) {
    if (isCollapsed) {
    return (
      <div className="h-full flex items-center justify-center">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }
  return (
    <Card className="h-full flex flex-col border-0 rounded-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5" />
          Inventory
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto pt-0">
        <Accordion type="multiple" defaultValue={['equipment', 'chemicals']} className="w-full">
          <AccordionItem value="equipment">
            <AccordionTrigger className="text-base font-medium">Equipment</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-2 pt-2">
                {equipment.map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    className="justify-start"
                    onClick={() => onAddEquipment(item)}
                  >
                    {equipmentIcons[item.type]}
                    {item.name}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="chemicals">
            <AccordionTrigger className="text-base font-medium">Chemicals</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-2 pt-2">
                {chemicals.map((chem) => (
                  <div key={chem.id} className="rounded-md border p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Droplets className="mr-2 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">{chem.name}</p>
                          <p className="text-xs text-muted-foreground">{chem.formula}</p>
                        </div>
                      </div>
                      {chem.type === 'indicator' ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onAddIndicator(chem)}>
                                  <Plus className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Add to Beaker</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <div className="flex gap-1">
                           <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="secondary" onClick={() => onAddChemical(chem, 'beaker')}>
                                  Beaker
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Add to Beaker</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="secondary" onClick={() => onAddChemical(chem, 'burette')}>
                                  Burette
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Add to Burette</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
