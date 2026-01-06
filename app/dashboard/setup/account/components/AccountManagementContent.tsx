import Link from "next/link";
import { Home } from "lucide-react";
import { UserProfileCard } from "./UserProfileCard";
import { PersonalInformationCard } from "./PersonalInformationCard";
import { SubscriptionCard } from "./SubscriptionCard";
import { PreferencesCard } from "./PreferencesCard";
import { AddNewCompanyCard } from "./AddNewCompanyCard";
import type { Subscription } from "@/lib/types/subscription";

interface AccountManagementContentProps {
  subscription: Subscription | null;
}

export function AccountManagementContent({
  subscription,
}: AccountManagementContentProps) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
      <UserProfileCard />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <PersonalInformationCard />
        </div>

        {/* Right Column - Subscription and Preferences */}
        <div className="space-y-6">
          <SubscriptionCard subscription={subscription} />
          <PreferencesCard />
          <AddNewCompanyCard />
        </div>
      </div>
    </div>
  );
}

