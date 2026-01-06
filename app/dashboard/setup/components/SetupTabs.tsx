"use client";

import { useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard, Settings } from "lucide-react";
import { SubscriptionSection } from "./SubscriptionSection";

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
  const getActiveTab = () => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "account") return "account";
    if (tabParam === "subscription") return "subscription";
    if (pathname?.includes("/profiles")) return "profiles";
    if (pathname?.includes("/account")) return "account";
    if (pathname?.includes("/subscription")) return "subscription";
    return "profiles"; // default
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Actualizar el tab cuando cambien los query params o la ruta
  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "account") {
      setActiveTab("account");
    } else if (tabParam === "subscription") {
      setActiveTab("subscription");
    } else if (pathname?.includes("/profiles")) {
      setActiveTab("profiles");
    } else if (pathname?.includes("/account")) {
      setActiveTab("account");
    } else if (pathname?.includes("/subscription")) {
      setActiveTab("subscription");
    } else {
      setActiveTab("profiles");
    }
  }, [searchParams, pathname]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
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

