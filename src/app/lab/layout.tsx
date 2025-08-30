
'use client';

import { LabSidebar } from '@/components/lab-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <SidebarProvider>
      <LabSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
