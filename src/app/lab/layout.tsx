
'use client';

import { LabSidebar } from '@/components/lab-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SettingsForm } from '@/components/settings-form';

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SidebarProvider>
      <LabSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
      <div className="hidden">
        <SettingsForm />
      </div>
    </SidebarProvider>
  );
}
