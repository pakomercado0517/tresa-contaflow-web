import { UserProfileCard } from "../account/components/UserProfileCard";
import { PersonalInformationCard } from "../account/components/PersonalInformationCard";
import { SubscriptionCard } from "../account/components/SubscriptionCard";
import { PreferencesCard } from "../account/components/PreferencesCard";
import { AddNewCompanyCard } from "../account/components/AddNewCompanyCard";
import type { Subscription } from "@/lib/types/subscription";
import type { User } from "@/lib/types/auth";

interface AccountContentProps {
  subscription: Subscription | null;
  user: User;
}

export function AccountContent({ subscription, user }: AccountContentProps) {
  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <UserProfileCard user={user} />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <PersonalInformationCard user={user} />
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

