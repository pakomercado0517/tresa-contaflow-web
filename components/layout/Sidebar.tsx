"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  BarChart3,
  FileSearch,
  Download,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Facturas (Ingresos)",
    href: "/invoices",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Gastos (Egresos)",
    href: "/expenses",
    icon: <Receipt className="h-5 w-5" />,
  },
  {
    title: "Clientes y Proveedores",
    href: "/clients",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Análisis Fiscal",
    href: "/reports",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Descarga masiva XML",
    href: "/bulk-download",
    icon: <Download className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();

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
            const isActive = pathname === item.href;
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
              JD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Juan Doe
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Contador Jr.
            </p>
          </div>
          <Link
            href="/settings"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

