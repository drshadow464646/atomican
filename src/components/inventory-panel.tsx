
'use client';

import { Beaker, FlaskConical, Pipette, Droplets, Package, Hand } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Chemical, Equipment } from '@/lib/experiment';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from 'next/link';
import { useExperiment } from '@/hooks/use-experiment';
import { useInventory } from '@/hooks/use-inventory';

type InventoryPanelProps = {
  isCollapsed: boolean;
};

const equipmentIcons: { [key: string]: React.ReactNode } = {
    'beaker': <Beaker className="mr-2 h-5 w-5" />,
    'burette': <Pipette className="mr-2 h-5 w-5" />,
    'pipette': <Pipette className="mr-2 h-5 w-5" />,
    'erlenmeyer-flask': <FlaskConical className="mr-2 h-5 w-5" />,
    'volumetric-flask': <FlaskConical className="mr-2 h-5 w-5" />,
    'graduated-cylinder': <Beaker className="mr-2 h-5 w-5" />,
};

export function InventoryPanel({
  isCollapsed,
}: InventoryPanelProps) {
    const { handleAddEquipmentToWorkbench, inventory: expInventory } = useExperiment();
    const { inventoryChemicals, inventoryEquipment, heldItem, handlePickUpChemical } = useInventory();
    
    if (isCollapsed) {
    return (
      <div className="h-full flex items-center justify-center">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }
  return (
    <Card className="h-full flex flex-col border-0 rounded-none bg-transparent sm:bg-card sm:border-border">
      <CardHeader className="hidden sm:block">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5" />
          Inventory
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto pt-0 sm:pt-0">
        <Accordion type="multiple" defaultValue={['equipment', 'chemicals']} className="w-full">
          <AccordionItem value="equipment">
            <AccordionTrigger className="text-base font-medium">Equipment ({inventoryEquipment.length})</AccordionTrigger>
            <AccordionContent>
              {inventoryEquipment.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 pt-2">
                  {inventoryEquipment.map((item) => (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="justify-start"
                      onClick={() => handleAddEquipmentToWorkbench(item)}
                    >
                      {equipmentIcons[item.type] || <Beaker className="mr-2 h-5 w-5" />}
                      {item.name}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  <p>No equipment in your inventory.</p>
                  <Button variant="link" asChild><Link href="/lab/apparatus">Add from Catalog</Link></Button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="chemicals">
            <AccordionTrigger className="text-base font-medium">Chemicals ({inventoryChemicals.length})</AccordionTrigger>
            <AccordionContent>
              {inventoryChemicals.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 pt-2">
                  {inventoryChemicals.map((chem) => (
                    <div key={chem.id} className={cn(
                        "rounded-md border p-2 transition-all",
                        heldItem?.id === chem.id && "ring-2 ring-primary bg-primary/10"
                      )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Droplets className="mr-2 h-5 w-5 text-primary" />
                          <div>
                            <p className="font-semibold">{chem.name}</p>
                            <p className="text-xs text-muted-foreground">{chem.formula}</p>
                          </div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handlePickUpChemical(chem)}
                              >
                                  <Hand className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Pick up chemical</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  <p>No chemicals in your inventory.</p>
                  <Button variant="link" asChild><Link href="/lab/market">Add from Market</Link></Button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
