
'use client';

import { Glasses, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from './ui/button';
import { SidebarTrigger } from './ui/sidebar';

type LabHeaderProps = {
  safetyGogglesOn: boolean;
  onGoggleToggle: (toggled: boolean) => void;
  onResetExperiment: () => void;
};

export function LabHeader({ safetyGogglesOn, onGoggleToggle, onResetExperiment }: LabHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Workbench
        </h1>
      </div>
      <div className='flex items-center gap-4'>
        <Button variant="outline" size="sm" onClick={onResetExperiment}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
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
      </div>
    </header>
  );
}
