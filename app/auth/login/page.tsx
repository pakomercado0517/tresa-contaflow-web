import { Suspense } from "react";
import { LoginForm } from "./components/LoginForm";
import { AuthFooter } from "./components/AuthFooter";
import { AuthLogo } from "./components/AuthLogo";

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md p-8 bg-card border-border shadow-lg rounded-lg animate-pulse">
      <div className="h-16 w-16 mx-auto mb-6 bg-muted rounded-full" />
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-3/4 mx-auto" />
        <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-primary/5 flex flex-col relative">
      <AuthLogo />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
      <AuthFooter />
    </div>
  );
}

