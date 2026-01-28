import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { TrustSection } from './components/TrustSection';
import { FeaturesSection } from './components/FeaturesSection';
import { DashboardPreview } from './components/DashboardPreview';
import { PricingSection } from './components/PricingSection';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <HeroSection />
      <TrustSection />
      <FeaturesSection />
      <DashboardPreview />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
