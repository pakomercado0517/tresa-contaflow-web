import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-7xl flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="h-4 w-1 bg-primary rounded-full"></div>
            <div className="h-6 w-1 bg-primary rounded-full"></div>
            <div className="h-8 w-1 bg-primary rounded-full"></div>
          </div>
          <span className="text-xl font-semibold">Conta Flow</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#beneficios"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Beneficios
          </Link>
          <Link
            href="#contadores"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Para Contadores
          </Link>
          <Link
            href="#precios"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Precios
          </Link>
        </nav>

        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/auth/login">Iniciar Sesión</Link>
        </Button>
      </div>
    </header>
  );
}

