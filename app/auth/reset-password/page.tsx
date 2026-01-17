import { Suspense } from "react";
import { AuthFooter } from "../login/components/AuthFooter";
import { AuthLogo } from "../login/components/AuthLogo";
import { ResetPasswordForm } from "./components/ResetPasswordForm";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-primary/5 flex flex-col relative">
      <AuthLogo />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <Suspense fallback={<div>Cargando...</div>}>
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="w-full max-w-md p-8 bg-card border-border shadow-lg rounded-lg">
              <div className="flex flex-col items-center gap-6">
                <div className="text-center space-y-4">
                  <h1 className="text-2xl font-bold text-destructive">
                    Token inválido
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    El enlace de recuperación no es válido o ha expirado.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Suspense>
      </div>
      <AuthFooter />
    </div>
  );
}
