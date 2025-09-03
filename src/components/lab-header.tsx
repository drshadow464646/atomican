
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Glasses, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type LabHeaderProps = {
  safetyGogglesOn: boolean;
  onGoggleToggle: (toggled: boolean) => void;
  onResetExperiment: () => void;
};

const menuItems = [
  {
    href: '/lab/workbench',
    label: 'Workbench',
  },
  {
    href: '/lab/market',
    label: 'Chemical Market',
  },
  {
    href: '/lab/apparatus',
    label: 'Apparatus',
  },
  {
    href: '/lab/settings',
    label: 'Settings',
  },
];

export function LabHeader({ safetyGogglesOn, onGoggleToggle, onResetExperiment }: LabHeaderProps) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-6">
        <Link href="/lab/workbench" className="flex items-center gap-2">
            <span className="text-2xl">🌌</span>
            {isClient && 
              <h1 className="text-xl font-semibold">LabSphere</h1>
            }
        </Link>
        <nav className="hidden md:flex items-center gap-4">
            {menuItems.map(item => {
                const isActive = pathname.startsWith(item.href);
                return (
                    <Link 
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            isActive ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        {item.label}
                    </Link>
                )
            })}
        </nav>
      </div>
      <div className='flex items-center gap-2 md:gap-4'>
        <Button variant="outline" size="sm" onClick={onResetExperiment}>
          <RefreshCw className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Reset</span>
        </Button>
        <div className="flex items-center space-x-2">
          <Glasses className="h-5 w-5 text-muted-foreground" />
          <Label htmlFor="goggle-switch" className="text-sm font-medium hidden sm:block">
            Cool Shades
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
