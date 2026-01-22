import { Suspense } from "react";
import { SATSearchContent } from "./components/SATSearchContent";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function SATSearchPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <LoadingSpinner message="Cargando buscador SAT..." />
          </div>
        }
      >
        <SATSearchContent />
      </Suspense>
    </div>
  );
}
