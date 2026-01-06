import { VerificationSuccessCard } from "./components/VerificationSuccessCard";
import { VerificationHeader } from "./components/VerificationHeader";
import { VerificationFooter } from "./components/VerificationFooter";

export default function VerificationSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-primary/5 flex flex-col">
      <VerificationHeader />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <VerificationSuccessCard />
      </div>
      <VerificationFooter />
    </div>
  );
}



