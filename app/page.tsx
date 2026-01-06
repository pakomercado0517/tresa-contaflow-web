import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { TrustSection } from "./components/TrustSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { DashboardPreview } from "./components/DashboardPreview";
import { FinalCTA } from "./components/FinalCTA";
import { Footer } from "./components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <TrustSection />
      <FeaturesSection />
      <DashboardPreview />
      <FinalCTA />
      <Footer />
    </div>
  );
}
