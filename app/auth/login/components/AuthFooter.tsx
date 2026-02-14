import Image from 'next/image';
import Link from 'next/link';

export function AuthFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border bg-background/50 w-full border-t backdrop-blur-sm">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
            <span className="text-sm font-semibold">Contafy</span>
            <span className="text-muted-foreground text-xs">
              © {currentYear} Todos los derechos reservados.
            </span>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <div className="text-muted-foreground flex items-center justify-center gap-4 text-sm">
              <Link href="#privacidad" className="hover:text-foreground transition-colors">
                Privacidad
              </Link>
              <Link href="#terminos" className="hover:text-foreground transition-colors">
                Términos
              </Link>
              <Link href="#ayuda" className="hover:text-foreground transition-colors">
                Ayuda
              </Link>
            </div>

            <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
              <span>Elaborado por</span>
              <Image
                src="/logotipo-tresa-design.svg"
                alt="Tresa Design"
                width={120}
                height={24}
                className="h-14 w-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
