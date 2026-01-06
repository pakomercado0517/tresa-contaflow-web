import { RegisterForm } from "./components/RegisterForm";
import { AuthFooter } from "../login/components/AuthFooter";
import { AuthLogo } from "../login/components/AuthLogo";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-primary/5 flex flex-col relative">
      <AuthLogo />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <RegisterForm />
      </div>
      <AuthFooter />
    </div>
  );
}



