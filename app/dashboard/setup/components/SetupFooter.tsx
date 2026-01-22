'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { logoutAction } from '../actions';

export function SetupFooter() {
  const handleLogoutSubmit = async () => {
    // Limpiar localStorage antes de hacer logout
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tour:onboarding');
    }
  };

  return (
    <div className="flex items-center justify-between px-4 pb-6 md:px-6 lg:px-8">
      <form action={logoutAction} onSubmit={handleLogoutSubmit}>
        <button
          type="submit"
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </form>
      <Link
        href="/terms"
        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        Términos y Privacidad
      </Link>
    </div>
  );
}
