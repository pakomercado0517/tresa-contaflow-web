import { getProfiles } from "@/lib/api/profiles";
import { getSubscription } from "@/lib/api/subscription";
import { getInvoices } from "@/lib/api/invoices";
import { UploadInvoicesContent } from "./components/UploadInvoicesContent";

export default async function UploadInvoicesPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [profiles, subscription, invoicesRes] = await Promise.all([
    getProfiles(),
    getSubscription().catch(() => null),
    getInvoices({ mes: currentMonth, año: currentYear, limit: 1 }),
  ]);

  const invoicesUsed = invoicesRes.pagination?.total ?? 0;

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <UploadInvoicesContent
        profiles={profiles.data}
        subscription={subscription}
        invoicesUsed={invoicesUsed}
      />
    </main>
  );
}

