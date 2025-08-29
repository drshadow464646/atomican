
import { LabSidebar } from '@/components/lab-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

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
    </SidebarProvider>
  );
}
