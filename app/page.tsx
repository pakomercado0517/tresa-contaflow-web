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
  try {
    const initialData: PublicPlansResponse = await getPublicPlans('monthly');
    return <PricingSection initialPlans={initialData.plans} />;
  } catch (error) {
    // Si falla, mostrar PricingSection sin datos iniciales
    // El componente fallará gracefully con el mensaje de error
    console.error('Error fetching public plans:', error);
    return <PricingSection initialPlans={[]} />;
  }
}

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <HeroSection />
      <TrustSection />
      <FeaturesSection />
      <DashboardPreview />
      <Suspense fallback={<div className="mx-auto w-full max-w-7xl px-4 py-16 md:py-24 lg:px-8"><div className="h-96 bg-muted animate-pulse rounded" /></div>}>
        <PricingSectionWrapper />
      </Suspense>
      <FinalCTA />
      <Footer />
    </div>
  );
}
