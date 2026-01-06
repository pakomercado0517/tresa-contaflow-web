import Link from "next/link";
import { LogOut } from "lucide-react";
import { logoutAction } from "../actions";

export function SetupFooter() {
  return (
    <div className="px-4 md:px-6 lg:px-8 pb-6 flex items-center justify-between">
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </form>
      <Link
        href="/terms"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Términos y Privacidad
      </Link>
    </div>
  );
}

