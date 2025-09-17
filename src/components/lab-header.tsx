
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Glasses, RefreshCw, Pen, Menu, Bot } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useIsMobile } from '@/hooks/use-mobile';

type LabHeaderProps = {
  experimentTitle: string;
  onTitleChange: (newTitle: string) => void;
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
    href: '/lab/assistant',
    label: 'AI Assistant',
    icon: Bot,
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

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <nav className="grid gap-6 text-lg font-medium mt-6">
          <Link href="/lab/workbench" className="flex items-center gap-2 text-lg font-semibold">
              <span className="text-2xl">🌌</span>
              <span className="sr-only">LabSphere</span>
          </Link>
          {menuItems.map(item => (
            <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}


export function LabHeader({ 
  experimentTitle,
  onTitleChange,
  safetyGogglesOn, 
  onGoggleToggle, 
  onResetExperiment 
}: LabHeaderProps) {
  const pathname = usePathname();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(experimentTitle);
  const isMobile = useIsMobile();
  
  const debouncedTitleChange = useDebouncedCallback((value: string) => {
    onTitleChange(value);
  }, 500);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
    debouncedTitleChange(e.target.value);
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4 md:gap-6">
        {isMobile && <MobileNav />}
        <Link href="/lab/workbench" className="flex items-center gap-2">
            <span className="text-2xl">🌌</span>
            <h1 className="text-xl font-semibold hidden sm:block">LabSphere</h1>
        </Link>
        <div className="hidden md:flex flex-1 min-w-0">
          {isEditingTitle ? (
            <Input 
              value={localTitle}
              onChange={handleTitleChange}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingTitle(false); }}
              className="text-lg font-semibold"
              autoFocus
              placeholder="Untitled Experiment"
            />
          ) : (
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setIsEditingTitle(true)}
            >
              <h2 className="text-lg font-semibold truncate" title={experimentTitle}>{experimentTitle || "Untitled Experiment"}</h2>
              <Pen className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
        <nav className="hidden md:flex items-center gap-4">
            {menuItems.map(item => {
                const isActive = pathname.startsWith(item.href);
                return (
                    <Link 
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
                            isActive ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        {item.icon && <item.icon className="h-4 w-4" />}
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
