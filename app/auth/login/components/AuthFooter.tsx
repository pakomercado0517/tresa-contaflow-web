import Link from "next/link";

export function AuthFooter() {
  return (
    <footer className="w-full py-6">
      <div className="mx-auto w-full max-w-7xl px-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <Link
          href="#privacidad"
          className="hover:text-foreground transition-colors"
        >
          Privacidad
        </Link>
        <Link
          href="#terminos"
          className="hover:text-foreground transition-colors"
        >
          Términos
        </Link>
        <Link
          href="#ayuda"
          className="hover:text-foreground transition-colors"
        >
          Ayuda
        </Link>
      </div>
    </footer>
  );
}



