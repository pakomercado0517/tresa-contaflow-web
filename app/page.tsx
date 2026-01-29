import { Suspense } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { TrustSection } from './components/TrustSection';
import { FeaturesSection } from './components/FeaturesSection';
import { DashboardPreview } from './components/DashboardPreview';
import { PricingSection } from './components/PricingSection';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { getPublicPlans } from '@/lib/api/subscription';
import type { PublicPlansResponse } from '@/lib/types/subscription';

async function PricingSectionWrapper() {
  // Obtener datos, si falla devuelve array vacío
  let initialData: PublicPlansResponse | null = null;
  
  try {
    initialData = await getPublicPlans('monthly');
  } catch (error) {
    console.error('Error fetching public plans:', error);
  }

  const plans = initialData?.plans || [];
  return <PricingSection initialPlans={plans} />;
}

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <HeroSection />
      <TrustSection />
      <FeaturesSection />
      <DashboardPreview />
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-7xl px-4 py-16 md:py-24 lg:px-8">
            <div className="bg-muted h-96 animate-pulse rounded" />
          </div>
        }
      >
        <PricingSectionWrapper />
      </Suspense>
      <FinalCTA />
      <Footer />
    </div>
  );
}
