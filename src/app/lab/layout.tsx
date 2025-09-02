
'use client';

import { LabSidebar } from '@/components/lab-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SettingsForm } from '@/components/settings-form';
import { ExperimentProvider } from '@/hooks/use-experiment';

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ExperimentProvider>
      <SidebarProvider>
        <LabSidebar />
        <SidebarInset>
          {children}
        </SidebarInset>
        <div className="hidden">
          <SettingsForm />
        </div>
      </SidebarProvider>
    </ExperimentProvider>
  );
}
