import { VerificationSuccessCard } from './components/VerificationSuccessCard';
import { AuthLogo } from '@/app/auth/login/components/AuthLogo';
import { SiteFooter } from '@/components/layout/SiteFooter';

export default function VerificationSuccessPage() {
  return (
    <div className="from-background via-primary/10 to-primary/5 relative flex min-h-screen flex-col bg-linear-to-br">
      <AuthLogo />
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <VerificationSuccessCard />
      </div>
      <SiteFooter variant="muted" />
    </div>
  );
}
