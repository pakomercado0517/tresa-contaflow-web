import type { Metadata } from 'next';
import { LegalPageHeader } from '@/components/layout/LegalPageHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { PrivacyPageContent } from './components/PrivacyPageContent';

export const metadata: Metadata = {
  title: 'Aviso de privacidad y cookies · Contafy',
  description:
    'Información sobre el tratamiento de datos personales y el uso de cookies y tecnologías similares en Contafy.',
};

export default function PrivacidadPage() {
  return (
    <div className="bg-background min-h-screen">
      <LegalPageHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16 lg:px-8">
        <PrivacyPageContent />
      </main>
      <SiteFooter />
    </div>
  );
}
