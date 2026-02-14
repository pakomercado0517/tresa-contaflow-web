import Link from 'next/link';
import { User, HelpCircle } from 'lucide-react';

export function VerificationHeader() {
  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="bg-primary h-4 w-1 rounded-full"></div>
            <div className="bg-primary h-6 w-1 rounded-full"></div>
            <div className="bg-primary h-8 w-1 rounded-full"></div>
          </div>
          <span className="text-xl font-semibold">Contafy</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="#ayuda"
            className="text-foreground/80 hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            Ayuda
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/20">
            <User className="h-5 w-5 text-orange-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
