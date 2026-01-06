import Link from "next/link";

export function SetupHeader() {
  return (
    <div className="px-4 md:px-6 lg:px-8 pt-6">
      <Link href="/" className="flex items-center gap-2 mb-6">
        <div className="flex gap-1">
          <div className="h-4 w-1 bg-primary rounded-full"></div>
          <div className="h-6 w-1 bg-primary rounded-full"></div>
          <div className="h-8 w-1 bg-primary rounded-full"></div>
        </div>
        <span className="text-xl font-semibold">Conta Flow</span>
      </Link>

      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Configuración inicial</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-primary rounded-full"></div>
          </div>
          <span className="text-sm text-muted-foreground font-medium">1 de 3</span>
        </div>
      </div>
    </div>
  );
}

