import { Suspense } from "react";
import { RegisterForm } from "./components/RegisterForm";
import { SiteFooter } from '@/components/layout/SiteFooter';
import { AuthLogo } from "../login/components/AuthLogo";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-primary/5 flex flex-col relative">
      <AuthLogo />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <Suspense fallback={<LoadingSpinner />}>
          <RegisterForm />
        </Suspense>
      </div>
      <SiteFooter variant="muted" />
    </div>
  );
}



