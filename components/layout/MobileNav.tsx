'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { startClientLogout } from '@/lib/auth/client-logout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types/auth';
import { navigationItems } from '@/lib/navigation';

interface MobileNavProps {
  user: User;
}

export function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Cerrar el Sheet al navegar (deferido para evitar setState síncrono en effect)
  useEffect(() => {
    const id = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(id);
  }, [pathname]);

  const displayName = user.nombre
    ? user.apellido
      ? `${user.nombre} ${user.apellido}`
      : user.nombre
    : user.email.split('@')[0];

  const initials = user.nombre
    ? `${user.nombre[0]}${user.apellido?.[0] || ''}`.toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <header className="border-border bg-card fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b px-4 lg:hidden print:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Abrir menú">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex w-72 flex-col p-0 sm:max-w-70"
          showCloseButton={false}
        >
          <SheetHeader className="border-border flex flex-row items-center gap-2.5 border-b px-6 py-4">
            <Image
              src="/logotipo-contafy.svg"
              alt="Contafy"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
          </SheetHeader>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
            {navigationItems.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.href || pathname?.startsWith(item.href + '/');

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="border-border flex items-center gap-3 border-t p-4">
            <Avatar className="h-10 w-10">
              {user.logo_url ? (
                <AvatarImage src={user.logo_url} alt={displayName} />
              ) : null}
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
                  onClick={startClientLogout}
                  variant="destructive"
                  className="cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetContent>
      </Sheet>

      <Link href="/dashboard" className="flex items-center gap-2">
        <Image
          src="/logotipo-contafy.svg"
          alt="Contafy"
          width={28}
          height={28}
          className="h-7 w-7"
        />
      </Link>

      {/* Espaciador para centrar el logo */}
      <div className="w-10" />
    </header>
  );
}
