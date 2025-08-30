
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
  useSidebar,
} from '@/components/ui/sidebar';
import {
  User,
} from 'lucide-react';
import { Separator } from './ui/separator';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    href: '/lab/workbench',
    icon: '🔬',
    label: 'Workbench',
    tooltip: 'Start your experiment here'
  },
  {
    href: '/lab/market',
    icon: '🛒',
    label: 'Market',
    tooltip: 'Buy reagents & apparatus'
  },
  {
    href: '/lab/apparatus',
    icon: '🧪',
    label: 'Apparatus',
    tooltip: 'Explore lab tools'
  },
  {
    href: '/lab/practicals',
    icon: '📋',
    label: 'Past Practicals',
    tooltip: 'Review your experiments'
  },
  {
    href: '/lab/settings',
    icon: '⚙️',
    label: 'Settings',
    tooltip: 'Customize your lab'
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
            <span className="text-2xl">🌌</span>
            {isClient && !isCollapsed && 
              <h1 className="text-xl font-semibold">LabSphere</h1>
            }
        </div>
      </SidebarHeader>
      
      <SidebarMenu className="flex-1">
        {menuItems.map(item => {
          const isActive = pathname.startsWith(item.href);
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={{ children: item.tooltip, side: 'right' }}
                className={cn(
                  "font-medium group transition-all duration-200",
                  isActive ? `bg-primary/10 text-primary` : 'text-foreground/70 hover:text-foreground',
                  'hover:bg-muted'
                )}
              >
                <Link href={item.href}>
                  <span className={cn("text-xl transition-transform duration-200 group-hover:scale-110", isActive && 'scale-105')}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
      
      <SidebarFooter>
         <Separator className="my-1" />
         <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith('/lab/profile')}
              tooltip={{ children: 'Profile', side: 'right' }}
               className="font-medium text-foreground/70 hover:text-foreground hover:bg-muted"
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
