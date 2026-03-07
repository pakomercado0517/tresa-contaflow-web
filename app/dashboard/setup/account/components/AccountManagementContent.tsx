import Link from 'next/link';
import { Home } from 'lucide-react';
import { UserProfileCard } from './UserProfileCard';
import { PersonalInformationCard } from './PersonalInformationCard';
import { SubscriptionCard } from './SubscriptionCard';
import { AddNewCompanyCard } from './AddNewCompanyCard';
import { TourResetButton } from '@/components/tour/TourResetButton';
import type { Subscription } from '@/lib/types/subscription';
import type { User } from '@/lib/types/auth';

interface AccountManagementContentProps {
  subscription: Subscription | null;
  user: User;
}

export function AccountManagementContent({ subscription, user }: AccountManagementContentProps) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          <Home className="h-4 w-4" />
        </Link>
        <span>/</span>
        <span className="text-foreground">Mi Cuenta</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gestión de Cuenta</h1>
        <p className="text-muted-foreground mt-2">
          Administra tu información personal, suscripción y preferencias.
        </p>
      </div>

      {/* User Profile Card */}
      <UserProfileCard user={user} />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Personal Information */}
        <div className="space-y-6 lg:col-span-2">
          <PersonalInformationCard />
        </div>

        {/* Right Column - Subscription, Add Company, Tour */}
        <div className="flex flex-col gap-6">
          <SubscriptionCard subscription={subscription} />
          <AddNewCompanyCard />
          <TourResetButton />
        </div>
      </div>
    </div>
  );
}
