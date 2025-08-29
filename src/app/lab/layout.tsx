
import { LabSidebar } from '@/components/lab-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <LabSidebar />
      <main className="flex-1">{children}</main>
    </SidebarProvider>
  );
}
