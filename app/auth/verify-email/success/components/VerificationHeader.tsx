import Link from "next/link";
import { User, HelpCircle } from "lucide-react";

export function VerificationHeader() {
  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-7xl flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="h-4 w-1 bg-primary rounded-full"></div>
            <div className="h-6 w-1 bg-primary rounded-full"></div>
            <div className="h-8 w-1 bg-primary rounded-full"></div>
          </div>
          <span className="text-xl font-semibold">Conta Flow</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="#ayuda"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-2"
          >
            <HelpCircle className="h-5 w-5" />
            Ayuda
          </Link>
          <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
            <User className="h-5 w-5 text-orange-400" />
          </div>
        </div>
      </div>
    </header>
  );
}



