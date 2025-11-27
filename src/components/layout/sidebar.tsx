'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, LayoutDashboard, FileCheck, Users, Settings, BookText, DollarSign, Briefcase } from 'lucide-react';

import { useUser } from '@/firebase';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', requiredAccess: 1 },
  { href: '/dashboard/approvals', icon: FileCheck, label: 'Approvals', requiredAccess: 9 },
  { href: '/dashboard/notulen', icon: BookText, label: 'AI Notulen', requiredAccess: 8 },
  { href: '/dashboard/finance', icon: DollarSign, label: 'Finance', requiredAccess: 8 },
  { href: '/dashboard/divisions', icon: Briefcase, label: 'Divisions', requiredAccess: 7 },
  { href: '/dashboard/members', icon: Users, label: 'Members', requiredAccess: 9 },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', requiredAccess: 1 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const accessLevel = user?.accessLevel ?? 0;

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <Bot className="w-8 h-8 text-primary-foreground" />
            <span className="font-headline text-lg text-primary-foreground">Nusantara Hub</span>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) =>
            accessLevel >= item.requiredAccess ? (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                  >
                    <a>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ) : null
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* Can add footer content here if needed */}
      </SidebarFooter>
    </Sidebar>
  );
}
