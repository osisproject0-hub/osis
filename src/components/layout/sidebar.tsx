'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileCheck, Users, Settings, BookText, DollarSign, Briefcase, FileSignature, Shield, Vote, Newspaper } from 'lucide-react';
import Image from 'next/image';

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
  { href: '/dashboard/surat', icon: FileSignature, label: 'AI Surat', requiredAccess: 8 },
  { href: '/dashboard/finance', icon: DollarSign, label: 'Finance', requiredAccess: 8 },
  { href: '/dashboard/berita', icon: Newspaper, label: 'Manajemen Berita', requiredAccess: 5 },
  { href: '/dashboard/divisions', icon: Briefcase, label: 'Divisions', requiredAccess: 7 },
  { href: '/dashboard/members', icon: Users, label: 'Members', requiredAccess: 9 },
  { href: '/dashboard/admin', icon: Shield, label: 'Admin Panel', requiredAccess: 10 },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', requiredAccess: 1 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const accessLevel = user?.accessLevel ?? 0;
  
  const isNewsPublisher = user?.divisionName === 'Divisi Teknologi & Komunikasi' || accessLevel >= 10;

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <Image src="https://ik.imagekit.io/zco6tu2vm/images%20(1).jpeg?updatedAt=1761836341193" alt="OSIS Logo" width={32} height={32} />
            <span className="font-headline text-lg text-sidebar-foreground">OSIS SMAKDA</span>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            if (item.href === '/dashboard/berita') {
                if (!isNewsPublisher) return null;
            } else if (accessLevel < item.requiredAccess) {
                return null;
            }
            
            return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* Can add footer content here if needed */}
      </SidebarFooter>
    </Sidebar>
  );
}
