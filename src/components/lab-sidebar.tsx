
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
  
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Beaker className="h-6 w-6 text-primary" />
            {!isCollapsed && <h1 className="text-xl font-bold">LabSphere</h1>}
        </div>
      </SidebarHeader>
      
      <SidebarMenu className="flex-1">
        {menuItems.map(item => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={{ children: item.label, side: 'right' }}
              >
                <a>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      
      <SidebarFooter>
         <Separator className="my-1" />
         <SidebarMenuItem>
             <Link href="/lab/profile" passHref>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/lab/profile')}
                tooltip={{ children: 'Profile', side: 'right' }}
              >
                <a>
                  <User />
                  <span>Profile</span>
                </a>
              </SidebarMenuButton>
            </Link>
         </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
