import { Suspense } from "react";
import { VerifyEmailContent } from "./components/VerifyEmailContent";
import { AuthFooter } from "../login/components/AuthFooter";
import { AuthLogo } from "../login/components/AuthLogo";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  const token = params.token;
  const email = params.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-primary/5 flex flex-col relative">
      <AuthLogo />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <Suspense fallback={<div>Cargando...</div>}>
          <VerifyEmailContent token={token} email={email} />
        </Suspense>
      </div>
      <AuthFooter />
    </div>
  );
}
