"use client";

import { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard, Settings } from "lucide-react";

interface SetupTabsProps {
  profilesContent: ReactNode;
  accountContent: ReactNode;
  subscriptionContent: ReactNode;
}

export function SetupTabs({
  profilesContent,
  accountContent,
  subscriptionContent,
}: SetupTabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determinar el tab activo basado en la ruta o query params
  const getActiveTabValue = () => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "account") return "account";
    if (tabParam === "subscription") return "subscription";
    if (pathname?.includes("/profiles")) return "profiles";
    if (pathname?.includes("/account")) return "account";
    if (pathname?.includes("/subscription")) return "subscription";
    return "profiles"; // default
  };

  const activeTab = getActiveTabValue();

  const handleTabChange = (value: string) => {
    // Actualizar la URL sin recargar la página
    const newPath =
      value === "profiles"
        ? "/dashboard/setup"
        : value === "account"
          ? "/dashboard/setup?tab=account"
          : "/dashboard/setup?tab=subscription";
    router.push(newPath, { scroll: false });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profiles" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Perfiles
        </TabsTrigger>
        <TabsTrigger value="account" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Cuenta
        </TabsTrigger>
        <TabsTrigger value="subscription" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Suscripción
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profiles" className="mt-6">
        {profilesContent}
      </TabsContent>

      <TabsContent value="account" className="mt-6">
        {accountContent}
      </TabsContent>

      <TabsContent value="subscription" className="mt-6">
        {subscriptionContent}
      </TabsContent>
    </Tabs>
  );
}

