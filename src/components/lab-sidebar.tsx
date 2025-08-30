
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
    activeColor: 'text-[#00bfff]',
    hoverColor: 'hover:text-[#00eaff]',
    tooltip: 'Start your experiment here'
  },
  {
    href: '/lab/market',
    icon: '🛒',
    label: 'Market',
    activeColor: 'text-[#f59e0b]',
    hoverColor: 'hover:text-[#fbbf24]',
    tooltip: 'Buy reagents & apparatus'
  },
  {
    href: '/lab/apparatus',
    icon: '🧪',
    label: 'Apparatus',
    activeColor: 'text-[#ec4899]',
    hoverColor: 'hover:text-[#f472b6]',
    tooltip: 'Explore lab tools'
  },
  {
    href: '/lab/practicals',
    icon: '📋',
    label: 'Past Practicals',
    activeColor: 'text-[#10b981]',
    hoverColor: 'hover:text-[#34d399]',
    tooltip: 'Review your experiments'
  },
  {
    href: '/lab/settings',
    icon: '⚙️',
    label: 'Settings',
    activeColor: 'text-[#8b5cf6]',
    hoverColor: 'hover:text-[#a855f7]',
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
              <h1 className="text-2xl font-display font-bold text-glow">NEXUS</h1>
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
                  "font-display font-bold group transition-all duration-300",
                  isActive ? `${item.activeColor} bg-primary/10` : 'text-slate-300',
                  item.hoverColor,
                  'hover:bg-primary/20 hover:scale-105'
                )}
              >
                <Link href={item.href}>
                  <span className={cn("text-2xl transition-transform duration-300 group-hover:scale-110", isActive && 'scale-110')}>{item.icon}</span>
                  <span className='group-hover:text-glow'>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
      
      <SidebarFooter>
         <Separator className="my-1 border-slate-700" />
         <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith('/lab/profile')}
              tooltip={{ children: 'Profile', side: 'right' }}
               className="font-display font-bold text-slate-300 hover:text-white hover:bg-primary/20 hover:scale-105"
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
