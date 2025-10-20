
'use client';

import { LabHeader } from '@/components/lab-header';
import { SettingsForm } from '@/components/settings-form';
import { InventoryProvider } from '@/hooks/use-inventory';
import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsClient } from '@/hooks/use-is-client';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();
  const isMobile = useIsMobile();
  const isClient = useIsClient();

  if (!isClient) {
    return (
        <div className="h-screen flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className={cn("h-screen flex flex-col pb-[env(safe-area-inset-bottom)]", isMobile ? 'is-mobile' : 'is-desktop')}>
      <main className={cn(
        "flex-1 overflow-y-auto relative transition-all duration-300",
        isPending && "opacity-50 blur-sm"
      )}>
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}
        {children}
      </main>
      <LabHeader startTransition={startTransition} />
      <div className="hidden">
        <SettingsForm />
      </div>
    </div>
  );
}

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InventoryProvider>
      <LayoutContent>{children}</LayoutContent>
    </InventoryProvider>
  );
}
