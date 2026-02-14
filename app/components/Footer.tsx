import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border bg-background border-t">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Contafy</span>
            <span className="text-muted-foreground text-xs">
              © {currentYear} Todos los derechos reservados.
            </span>
          </div>

          <div className="text-muted-foreground flex items-center gap-2 text-sm">
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
    </footer>
  );
}
