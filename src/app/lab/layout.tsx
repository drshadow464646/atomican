
'use client';

import { LabSidebar } from '@/components/lab-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { SettingsForm } from '@/components/settings-form';

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient ? (
        <SidebarProvider>
          <LabSidebar />
          <SidebarInset>
            {children}
          </SidebarInset>
          <div className="hidden">
            <SettingsForm />
          </div>
        </SidebarProvider>
      ) : null}
    </>
  );
}
