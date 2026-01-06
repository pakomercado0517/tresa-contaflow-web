import { LoginForm } from "./components/LoginForm";
import { AuthFooter } from "./components/AuthFooter";
import { AuthLogo } from "./components/AuthLogo";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-primary/5 flex flex-col relative">
      <AuthLogo />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <LoginForm />
      </div>
      <AuthFooter />
    </div>
  );
}

