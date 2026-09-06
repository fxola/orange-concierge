import {
  Building2,
  ClipboardCheck,
  LayoutDashboard,
  MessagesSquare,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = Readonly<{
  href: string;
  label: string;
  icon: LucideIcon;
}>;

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Building2 },
  { href: '/interactions', label: 'Interactions', icon: MessagesSquare },
  { href: '/reviews', label: 'Reviews', icon: ClipboardCheck },
];
