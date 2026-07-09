"use client";

import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard, Settings, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { isSetupTab, useSetupTab } from "./use-setup-tab";

interface SetupTabsProps {
  profilesContent: ReactNode;
  accountContent: ReactNode;
  subscriptionContent: ReactNode;
  satDownloadContent: ReactNode;
}

export function SetupTabs({
  profilesContent,
  accountContent,
  subscriptionContent,
  satDownloadContent,
}: SetupTabsProps) {
  const { activeTab, setSetupTab } = useSetupTab();

  const handleTabChange = (value: string) => {
    if (isSetupTab(value)) {
      setSetupTab(value);
    }
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
          <TabsTrigger
            value="sat-download"
            className="flex items-center gap-2 rounded-md px-4 py-2 transition-all border-none bg-transparent text-white data-[state=active]:bg-[#00ff80]! data-[state=active]:text-gray-900! data-[state=active]:shadow-none dark:data-[state=active]:bg-[#00ff80]! dark:data-[state=active]:text-gray-900! [&_svg]:text-gray-400 [&_svg]:data-[state=active]:text-gray-900!"
          >
            <Download className="h-4 w-4" />
            SAT Descarga
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

      <TabsContent value="sat-download" className="mt-6">
        {satDownloadContent}
      </TabsContent>
    </Tabs>
  );
}
