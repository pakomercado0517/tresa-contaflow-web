import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="from-background via-primary/10 to-primary/5 flex min-h-screen flex-col items-center justify-center bg-linear-to-br px-4 py-12">
      {/* Logo */}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2">
        <Image
          src="/logotipo-contafy.svg"
          alt="Contafy"
          width={32}
          height={32}
          className="h-8 w-8"
        />
        <span className="text-xl font-semibold">Contafy</span>
      </Link>

      {/* Error Content */}
      <Card className="bg-card border-border w-full max-w-md p-8 shadow-lg">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Icon */}
          <div className="bg-primary/10 flex h-20 w-20 items-center justify-center rounded-full">
            <FileQuestion className="text-primary h-10 w-10" />
          </div>

          {/* Error Code */}
          <div className="space-y-2">
            <h1 className="text-primary text-6xl font-bold">404</h1>
            <h2 className="text-2xl font-semibold">Página no encontrada</h2>
            <p className="text-muted-foreground text-sm">
              Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>
          </div>

          {/* Actions */}
          <div className="flex w-full flex-col gap-3">
            <Button asChild className="bg-primary hover:bg-primary/90 w-full" size="lg">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al dashboard
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <div className="border-border w-full border-t pt-4">
            <p className="text-muted-foreground text-xs">
              Si crees que esto es un error, por favor{' '}
              <Link href="/dashboard/setup?tab=account" className="text-primary hover:underline">
                contacta con soporte
              </Link>
              .
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
