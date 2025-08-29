
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Beaker,
  FlaskConical,
  ShoppingCart,
  SlidersHorizontal,
  FileText,
  User,
  TestTubeDiagonal,
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { useEffect, useState } from 'react';

const menuItems = [
  {
    href: '/lab/workbench',
    icon: TestTubeDiagonal,
    label: 'Workbench',
  },
  {
    href: '/lab/market',
    icon: ShoppingCart,
    label: 'Market',
  },
  {
    href: '/lab/apparatus',
    icon: FlaskConical,
    label: 'Apparatus',
  },
  {
    href: '/lab/practicals',
    icon: FileText,
    label: 'Past Practicals',
  },
  {
    href: '/lab/settings',
    icon: SlidersHorizontal,
    label: 'Settings',
  },
];

export function LabSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Beaker className="h-6 w-6 text-primary" />
            {isClient && !isCollapsed && <h1 className="text-xl font-bold">LabSphere</h1>}
        </div>
      </SidebarHeader>
      
      <SidebarMenu className="flex-1">
        {menuItems.map(item => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(item.href)}
              tooltip={{ children: item.label, side: 'right' }}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      
      <SidebarFooter>
         <Separator className="my-1" />
         <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith('/lab/profile')}
              tooltip={{ children: 'Profile', side: 'right' }}
            >
              <Link href="/lab/profile">
                <User />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
         </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
