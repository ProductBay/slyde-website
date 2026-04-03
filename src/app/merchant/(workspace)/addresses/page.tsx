import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { MerchantAddressBook } from "@/components/merchant/addresses/merchant-address-book";
import { MerchantPageHeader } from "@/components/merchant/layout/merchant-page-header";
import { listMerchantAddresses } from "@/modules/merchant-ops/services/merchant-address.service";
import { getMerchantSessionOrRedirect } from "@/server/merchant/context";

export default async function MerchantAddressesPage() {
  const session = await getMerchantSessionOrRedirect();
  const addresses = await listMerchantAddresses(session.merchantMembership.merchantId);

  return (
    <div className="space-y-6">
      <MerchantPageHeader
        eyebrow="Addresses"
        title="Saved pickup and customer locations"
        description="Maintain clean reusable address records so your dispatch team spends less time typing and more time moving orders."
        actions={
          <Link href="/merchant/dispatch/new" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
            <PackagePlus className="h-4 w-4" />
            Use in dispatch
          </Link>
        }
      />
      <MerchantAddressBook addresses={addresses} />
    </div>
  );
}
