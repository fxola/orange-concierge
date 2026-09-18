import { Building2, History, type LucideIcon } from 'lucide-react';
import type { ActorRole } from '@orange-concierge/core';

export type NavItem = Readonly<{
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: readonly ActorRole[];
}>;

const AUDIT_ROLES: readonly ActorRole[] = ['admin', 'reviewer'];

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { href: '/clients', label: 'Clients', icon: Building2 },
  { href: '/audit', label: 'Audit trail', icon: History, roles: AUDIT_ROLES },
];

export function isNavItemVisible(item: NavItem, userRole?: string): boolean {
  if (!item.roles) {
    return true;
  }
  if (!userRole) {
    return false;
  }
  return (item.roles as readonly string[]).includes(userRole);
}

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.href === '/') {
    return pathname === '/';
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
