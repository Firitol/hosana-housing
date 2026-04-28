'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Home,
  Map,
  FileClock,
  Settings,
  LogOut,
} from 'lucide-react';
import { HosanaNexusLogo } from '../icons';
import { Button } from '../ui/button';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/housing', label: 'Housing', icon: Home },
  { href: '/dashboard/map', label: 'Map View', icon: Map },
  { href: '/dashboard/audit-log', label: 'Audit Log', icon: FileClock },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <HosanaNexusLogo className="h-8 w-8 text-sidebar-foreground" />
          <span className="text-xl font-semibold text-sidebar-foreground">
            Hosana Nexus
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === link.href}
                tooltip={{
                  children: link.label,
                }}
              >
                <Link href={link.href}>
                  <link.icon />
                  <span>{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{children: 'Logout'}}>
              <Link href="/login">
                <LogOut />
                <span>Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
