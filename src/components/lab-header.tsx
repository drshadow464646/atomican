

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Glasses, RefreshCw, Pen, Menu, Bot, LayoutGrid, Store, Library, Settings as SettingsIcon, Notebook, TestTube } from 'lucide-react';
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { TooltipContent } from '@radix-ui/react-tooltip';

type LabHeaderProps = {
  safetyGogglesOn: boolean;
  onGoggleToggle: (toggled: boolean) => void;
  onResetExperiment: () => void;
};

const menuItems = [
  {
    href: '/lab/workbench',
    label: 'Workbench',
    icon: LayoutGrid,
  },
  {
    href: '/lab/assistant',
    label: 'Procedure',
    icon: Notebook,
  },
  {
    href: '/lab/market',
    label: 'Chemical Market',
    icon: Store,
  },
  {
    href: '/lab/apparatus',
    label: 'Apparatus',
    icon: Library,
  },
  {
    href: '/lab/settings',
    label: 'Settings',
    icon: SettingsIcon,
  },
];

function MobileNav() {
  const pathname = usePathname();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
            <SheetTitle>
                 <Link href="/lab/workbench" className="flex items-center gap-2 text-lg font-semibold">
                    <span className="text-2xl">🌌</span>
                    <span>LabSphere</span>
                </Link>
            </SheetTitle>
            <SheetDescription>
                Navigate between the different sections of the virtual lab.
            </SheetDescription>
        </SheetHeader>
        <nav className="grid gap-4 text-lg font-medium mt-6">
          {menuItems.map(item => {
            const isActive = pathname.startsWith(item.href);
            return (
                <Link 
                    key={item.href} 
                    href={item.href} 
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        isActive && "bg-muted text-primary"
                    )}
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}


export function LabHeader({ 
  safetyGogglesOn, 
  onGoggleToggle, 
  onResetExperiment 
}: LabHeaderProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  return (
    <header className="z-10 flex h-16 items-center justify-between border-t bg-card px-4 md:px-6">
      <div className="flex items-center gap-4 md:gap-6">
        {isMobile && <MobileNav />}
        <Link href="/lab/workbench" className="flex items-center gap-2">
            <span className="text-2xl">🌌</span>
            <h1 className="text-xl font-semibold sm:block">LabSphere</h1>
        </Link>
        <div className="hidden md:flex flex-1 min-w-0">
        </div>
        <nav className="hidden md:flex items-center gap-2">
           <TooltipProvider>
            {menuItems.map(item => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link 
                          href={item.href}
                      >
                         <Button
                            variant={isActive ? "secondary" : "ghost"}
                            size="icon"
                            className="rounded-lg"
                         >
                            <item.icon className="h-5 w-5" />
                            <span className="sr-only">{item.label}</span>
                         </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5}>
                        <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                )
            })}
           </TooltipProvider>
        </nav>
      </div>
      <div className='flex items-center gap-2 md:gap-4'>
        <Button variant="outline" size="sm" onClick={onResetExperiment} suppressHydrationWarning>
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
            suppressHydrationWarning
          />
        </div>
      </div>
    </header>
  );
}
