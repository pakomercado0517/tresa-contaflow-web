import Link from 'next/link';

export function SetupHeader() {
  return (
    <div className="px-4 pt-6 md:px-6 lg:px-8">
      <Link href="/" className="mb-6 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="bg-primary h-4 w-1 rounded-full"></div>
          <div className="bg-primary h-6 w-1 rounded-full"></div>
          <div className="bg-primary h-8 w-1 rounded-full"></div>
        </div>
        <span className="text-xl font-semibold">Contafy</span>
      </Link>

      <div className="mb-8">
        <p className="text-muted-foreground mb-2 text-sm">Configuración inicial</p>
        <div className="flex items-center gap-2">
          <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
            <div className="bg-primary h-full w-1/3 rounded-full"></div>
          </div>
          <span className="text-muted-foreground text-sm font-medium">1 de 3</span>
        </div>
      </div>
    </div>
  );
}
