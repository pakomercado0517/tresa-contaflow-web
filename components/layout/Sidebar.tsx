'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/dashboard/setup/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Settings,
  LogOut,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types/auth';
import { clearAllStoredProfileSelections } from '@/lib/storage/profile-selection';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  user: User;
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Facturas (Ingresos)',
    href: '/dashboard/invoices',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: 'Gastos (Egresos)',
    href: '/dashboard/expenses',
    icon: <Receipt className="h-5 w-5" />,
  },
  {
    title: 'Buscador SAT',
    href: '/dashboard/sat-search',
    icon: <Search className="h-5 w-5" />,
  },
  {
    title: 'Obtener CSF',
    href: '/dashboard/certification',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  // Obtener el nombre completo o usar email como fallback
  const displayName = user.nombre
    ? user.apellido
      ? `${user.nombre} ${user.apellido}`
      : user.nombre
    : user.email.split('@')[0];

  // Obtener iniciales para el avatar
  const initials = user.nombre
    ? `${user.nombre[0]}${user.apellido?.[0] || ''}`.toUpperCase()
    : user.email[0].toUpperCase();

  const handleLogout = async () => {
    // Limpiar localStorage antes de cerrar sesión
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tour:onboarding');
      clearAllStoredProfileSelections();
    }

    // Llamar a la Server Action que elimina cookies y redirige
    await logoutAction();
  };

  return (
    <aside
      data-tour="sidebar"
      className="bg-card border-border hidden border-r md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col print:hidden"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-border flex h-16 items-center gap-2.5 border-b px-6">
          <Image
            src="/logotipo-contafy.svg"
            alt="Contafy"
            width={140}
            height={32}
            className="h-8 w-auto"
          />
          <span className="text-xl font-semibold">Contafy</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {navigationItems.map((item) => {
            // Lógica mejorada para evitar múltiples elementos activos
            // Para Dashboard, solo activo si es exactamente /dashboard (sin subrutas)
            // Para otros items, activo si coincide exactamente o es una subruta
            let isActive = false;

            if (item.href === '/dashboard') {
              // Dashboard solo activo en la ruta exacta
              isActive = pathname === '/dashboard';
            } else {
              // Otros items: activo si coincide exactamente o es subruta
              isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="border-border flex items-center gap-3 border-t p-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="border border-orange-500/30 bg-orange-500/20 text-orange-400">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-medium">{displayName}</p>
            <p className="text-muted-foreground truncate text-xs">{user.email}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              data-tour="settings-button"
              className={cn(
                'text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-md p-2 transition-colors outline-none focus-visible:ring-2',
                pathname?.includes('/dashboard/setup') && 'text-primary'
              )}
            >
              <Settings className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/setup" className="flex cursor-pointer items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                variant="destructive"
                className="cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
