"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types/auth";

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
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Facturas (Ingresos)",
    href: "/dashboard/invoices",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Gastos (Egresos)",
    href: "/dashboard/expenses",
    icon: <Receipt className="h-5 w-5" />,
  },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Obtener el nombre completo o usar email como fallback
  const displayName = user.nombre
    ? user.apellido
      ? `${user.nombre} ${user.apellido}`
      : user.nombre
    : user.email.split("@")[0];

  // Obtener iniciales para el avatar
  const initials = user.nombre
    ? `${user.nombre[0]}${user.apellido?.[0] || ""}`.toUpperCase()
    : user.email[0].toUpperCase();

  const handleLogout = async () => {
    try {
      // Llamar al endpoint de logout usando proxy de Next.js
      await fetch("/backend/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      // Redirigir al login
      router.push("/auth/login");
    }
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-card border-r border-border">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center gap-2 h-16 px-6 border-b border-border">
          <div className="flex gap-1">
            <div className="h-4 w-1 bg-primary rounded-full"></div>
            <div className="h-6 w-1 bg-primary rounded-full"></div>
            <div className="h-8 w-1 bg-primary rounded-full"></div>
          </div>
          <span className="text-xl font-semibold">Conta Flow</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            // Lógica mejorada para evitar múltiples elementos activos
            // Para Dashboard, solo activo si es exactamente /dashboard (sin subrutas)
            // Para otros items, activo si coincide exactamente o es una subruta
            let isActive = false;
            
            if (item.href === "/dashboard") {
              // Dashboard solo activo en la ruta exacta
              isActive = pathname === "/dashboard";
            } else {
              // Otros items: activo si coincide exactamente o es subruta
              isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 p-4 border-t border-border">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
                pathname?.includes("/dashboard/setup") && "text-primary"
              )}
            >
              <Settings className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/setup" className="flex items-center gap-2 cursor-pointer">
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

