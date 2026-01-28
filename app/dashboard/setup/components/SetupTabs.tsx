"use client";

import { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className="flex justify-start">
        <TabsList
          className={cn(
            "inline-flex w-fit h-auto bg-[#1a1a1a] rounded-lg p-1 border-none",
            "text-muted-foreground"
          )}
        >
          <TabsTrigger
            value="profiles"
            className="flex items-center gap-2 rounded-md px-4 py-2 transition-all border-none bg-transparent text-white data-[state=active]:bg-[#00ff80]! data-[state=active]:text-gray-900! data-[state=active]:shadow-none dark:data-[state=active]:bg-[#00ff80]! dark:data-[state=active]:text-gray-900! [&_svg]:text-gray-400 [&_svg]:data-[state=active]:text-gray-900!"
          >
            <User className="h-4 w-4" />
            Perfiles
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="flex items-center gap-2 rounded-md px-4 py-2 transition-all border-none bg-transparent text-white data-[state=active]:bg-[#00ff80]! data-[state=active]:text-gray-900! data-[state=active]:shadow-none dark:data-[state=active]:bg-[#00ff80]! dark:data-[state=active]:text-gray-900! [&_svg]:text-gray-400 [&_svg]:data-[state=active]:text-gray-900!"
          >
            <Settings className="h-4 w-4" />
            Cuenta
          </TabsTrigger>
          <TabsTrigger
            value="subscription"
            className="flex items-center gap-2 rounded-md px-4 py-2 transition-all border-none bg-transparent text-white data-[state=active]:bg-[#00ff80]! data-[state=active]:text-gray-900! data-[state=active]:shadow-none dark:data-[state=active]:bg-[#00ff80]! dark:data-[state=active]:text-gray-900! [&_svg]:text-gray-400 [&_svg]:data-[state=active]:text-gray-900!"
          >
            <CreditCard className="h-4 w-4" />
            Suscripción
          </TabsTrigger>
        </TabsList>
      </div>

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

