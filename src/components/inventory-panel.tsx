'use client';

import { Beaker, FlaskConical, Pipette, Droplets, Plus, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Chemical, Equipment } from '@/lib/experiment';

type InventoryPanelProps = {
  equipment: Equipment[];
  chemicals: Chemical[];
  onAddEquipment: (equipment: Equipment) => void;
  onAddChemical: (chemical: Chemical, target: 'beaker' | 'burette') => void;
  onAddIndicator: (chemical: Chemical) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
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
  onToggleCollapse
}: InventoryPanelProps) {
    if (isCollapsed) {
    return (
      <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="h-full w-12 border rounded-lg">
        <PanelRightClose />
      </Button>
    );
  }
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inventory</CardTitle>
        <Button variant="ghost" size="icon" onClick={onToggleCollapse}>
          <PanelLeftClose />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div>
          <h3 className="mb-3 text-lg font-semibold">Equipment</h3>
          <div className="grid grid-cols-1 gap-2">
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
        </div>
        <Separator />
        <div>
          <h3 className="mb-3 text-lg font-semibold">Chemicals</h3>
          <div className="grid grid-cols-1 gap-2">
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
                     <Button size="sm" onClick={() => onAddIndicator(chem)} title="Add to Beaker">
                        <Plus className="h-4 w-4" />
                     </Button>
                  ) : (
                    <div className="flex gap-1">
                      <Button size="sm" variant="secondary" onClick={() => onAddChemical(chem, 'beaker')} title="Add to Beaker">
                        Beaker
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => onAddChemical(chem, 'burette')} title="Add to Burette">
                        Burette
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
