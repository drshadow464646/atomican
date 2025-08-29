'use client';

import { Glasses, Beaker } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type LabHeaderProps = {
  safetyGogglesOn: boolean;
  onGoggleToggle: (toggled: boolean) => void;
};

export function LabHeader({ safetyGogglesOn, onGoggleToggle }: LabHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <Beaker className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          LabSphere
        </h1>
      </div>
      <div className="flex items-center space-x-2">
        <Glasses className="h-5 w-5 text-muted-foreground" />
        <Label htmlFor="goggle-switch" className="text-sm font-medium">
          Safety Goggles
        </Label>
        <Switch
          id="goggle-switch"
          checked={safetyGogglesOn}
          onCheckedChange={onGoggleToggle}
          aria-label="Toggle safety goggles"
        />
      </div>
    </header>
  );
}
