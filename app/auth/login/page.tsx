import { Suspense } from 'react';
import { LoginForm } from './components/LoginForm';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { AuthLogo } from './components/AuthLogo';

function LoginFormFallback() {
  return (
    <div className="bg-card border-border w-full max-w-md animate-pulse rounded-lg p-8 shadow-lg">
      <div className="bg-muted mx-auto mb-6 h-16 w-16 rounded-full" />
      <div className="space-y-4">
        <div className="bg-muted mx-auto h-8 w-3/4 rounded" />
        <div className="bg-muted mx-auto h-4 w-1/2 rounded" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="from-background via-primary/10 to-primary/5 relative flex min-h-screen flex-col bg-linear-to-br">
      <AuthLogo />
      <div className="flex flex-1 flex-col items-center justify-start px-4 py-8 md:justify-center md:py-12">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
      <SiteFooter variant="muted" />
    </div>
  );
}
