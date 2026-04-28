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
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export function NavLinks() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const lang = user?.language || 'English';

  const links = [
    { href: '/dashboard', label: lang === 'Amharic' ? 'ዳሽቦርድ' : 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/housing', label: lang === 'Amharic' ? 'የቤት መረጃ' : 'Housing', icon: Home },
    { href: '/dashboard/map', label: lang === 'Amharic' ? 'የካርታ እይታ' : 'Map View', icon: Map },
    { href: '/dashboard/audit-log', label: lang === 'Amharic' ? 'የኦዲት መዝገብ' : 'Audit Log', icon: FileClock },
    { href: '/dashboard/settings', label: lang === 'Amharic' ? 'ቅንብሮች' : 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

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
            <SidebarMenuButton onClick={handleLogout} tooltip={{children: lang === 'Amharic' ? 'ውጣ' : 'Logout'}}>
                <LogOut />
                <span>{lang === 'Amharic' ? 'ውጣ' : 'Logout'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
