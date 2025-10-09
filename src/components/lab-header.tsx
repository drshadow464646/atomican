
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Glasses, RefreshCw, Menu, LayoutGrid, Store, Library, Settings as SettingsIcon, Notebook } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
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
import { useInventory } from '@/hooks/use-inventory';
import React, { useState } from 'react';

type LabHeaderProps = {
  startTransition: React.TransitionStartFunction;
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
    label: 'Chemicals',
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

function MobileNav({ startTransition }: { startTransition: React.TransitionStartFunction }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (href: string) => {
    startTransition(() => {
      router.push(href);
      setIsOpen(false);
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
                    <span className="text-2xl">⚛️</span>
                    <span>Atomican</span>
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
                <button
                    key={item.href} 
                    onClick={() => handleNavigate(item.href)}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-left",
                        isActive && "bg-muted text-primary"
                    )}
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </button>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}


export function LabHeader({ startTransition }: LabHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { safetyGogglesOn, setSafetyGogglesOn, handleResetExperiment } = useInventory();
  
  const handleNavigate = (e: React.MouseEvent<HTMLButtonElement>, href: string) => {
    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <header className="z-10 flex h-16 items-center justify-between border-t bg-card px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-4">
        {isMobile && <MobileNav startTransition={startTransition} />}
        <Link href="/lab/workbench" className="hidden sm:flex items-center gap-2">
            <span className="text-2xl">⚛️</span>
            <h1 className="text-xl font-semibold sm:block">Atomican</h1>
        </Link>
        <nav className="hidden md:flex items-center gap-2">
           <TooltipProvider>
            {menuItems.map(item => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Button
                          variant={isActive ? "secondary" : "ghost"}
                          size="icon"
                          className="rounded-lg"
                          onClick={(e) => handleNavigate(e, item.href)}
                      >
                          <item.icon className="h-5 w-5" />
                          <span className="sr-only">{item.label}</span>
                      </Button>
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
        <Button variant="outline" size="sm" onClick={handleResetExperiment} suppressHydrationWarning>
          <RefreshCw className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Reset</span>
        </Button>
        <div className="flex items-center space-x-2">
          <Label htmlFor="goggle-switch" className="text-sm font-medium">
            Goggles
          </Label>
          <Switch
            id="goggle-switch"
            checked={safetyGogglesOn}
            onCheckedChange={setSafetyGogglesOn}
            aria-label="Toggle safety goggles"
            suppressHydrationWarning
          />
        </div>
      </div>
    </header>
  );
}
