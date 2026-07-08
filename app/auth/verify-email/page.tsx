import { Suspense } from "react";
import { VerifyEmailContent } from "./components/VerifyEmailContent";
import { SiteFooter } from '@/components/layout/SiteFooter';
import { AuthLogo } from "../login/components/AuthLogo";
import { verifyEmailAction } from "./actions";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  const token = params.token;
  const email = params.email;

  let verificationError: string | null = null;
  if (token) {
    const result = await verifyEmailAction(token);
    verificationError = result.error ?? null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-primary/5 flex flex-col relative">
      <AuthLogo />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <Suspense fallback={<div>Cargando...</div>}>
          <VerifyEmailContent email={email} verificationError={verificationError} />
        </Suspense>
      </div>
      <SiteFooter variant="muted" />
    </div>
  );
}
