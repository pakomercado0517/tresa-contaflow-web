"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type SetupTab = "profiles" | "account" | "subscription" | "sat-download";

export function resolveSetupTab(
  tabParam: string | null | undefined,
  pathname: string | null
): SetupTab {
  if (tabParam === "account") return "account";
  if (tabParam === "subscription") return "subscription";
  if (tabParam === "sat-download") return "sat-download";
  if (pathname?.includes("/profiles")) return "profiles";
  if (pathname?.includes("/account")) return "account";
  if (pathname?.includes("/subscription")) return "subscription";
  return "profiles";
}

export function setupTabToPath(tab: SetupTab): string {
  const paths: Record<SetupTab, string> = {
    profiles: "/dashboard/setup",
    account: "/dashboard/setup?tab=account",
    subscription: "/dashboard/setup?tab=subscription",
    "sat-download": "/dashboard/setup?tab=sat-download",
  };
  return paths[tab];
}

export function isSetupTab(value: string): value is SetupTab {
  return (
    value === "profiles" ||
    value === "account" ||
    value === "subscription" ||
    value === "sat-download"
  );
}

export function useSetupTab(): {
  activeTab: SetupTab;
  setSetupTab: (tab: SetupTab) => void;
} {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams?.get("tab") ?? null;

  const activeTab = resolveSetupTab(tabParam, pathname);

  const setSetupTab = useCallback(
    (tab: SetupTab) => {
      router.replace(setupTabToPath(tab), { scroll: false });
    },
    [router]
  );

  return { activeTab, setSetupTab };
}
