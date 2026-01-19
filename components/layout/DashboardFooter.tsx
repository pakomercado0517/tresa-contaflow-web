import Image from "next/image";

export function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background mt-auto">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Conta Flow</span>
            <span className="text-xs text-muted-foreground">
              © {currentYear} Todos los derechos reservados.
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
