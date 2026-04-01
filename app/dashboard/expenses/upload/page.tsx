import { getProfiles } from "@/lib/api/profiles";
import { getSubscription } from "@/lib/api/subscription";
import { getExpenses } from "@/lib/api/expenses";
import { UploadExpensesContent } from "./components/UploadExpensesContent";
import { getCurrentMonthYearInAppTimezone } from "@/lib/utils/app-calendar";

export default async function UploadExpensesPage() {
  const { mes: currentMonth, año: currentYear } = getCurrentMonthYearInAppTimezone();

  const [profiles, subscription, expensesRes] = await Promise.all([
    getProfiles(),
    getSubscription().catch(() => null),
    getExpenses({ mes: currentMonth, año: currentYear, limit: 1 }),
  ]);

  const expensesUsed = expensesRes.pagination?.total ?? 0;

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <UploadExpensesContent
        profiles={profiles.data}
        subscription={subscription}
        expensesUsed={expensesUsed}
      />
    </main>
  );
}

