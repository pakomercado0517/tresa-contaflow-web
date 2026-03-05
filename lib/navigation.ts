import { LayoutDashboard, FileText, Receipt, Search, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Facturas (Ingresos)',
    href: '/dashboard/invoices',
    icon: FileText,
  },
  {
    title: 'Gastos (Egresos)',
    href: '/dashboard/expenses',
    icon: Receipt,
  },
  {
    title: 'Buscador SAT',
    href: '/dashboard/sat-search',
    icon: Search,
  },
  {
    title: 'Obtener CSF',
    href: '/dashboard/certification',
    icon: ShieldCheck,
  },
];
