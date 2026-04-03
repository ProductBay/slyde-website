import { MerchantActivationForm } from "@/components/merchant/merchant-activation-form";
import { activateMerchant } from "@/modules/merchant-ops/services/merchant-auth.service";

export default async function MerchantActivateTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  try {
    const result = await activateMerchant(token);

    return (
      <section className="section-shell py-10 sm:py-12">
        <div className="surface-panel mx-auto max-w-3xl p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Merchant activation</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Complete your merchant activation</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Your merchant workspace has been prepared. Create your password first, then sign in and continue into the merchant dashboard.
          </p>
          <div className="mt-8">
            <MerchantActivationForm token={token} passwordSet={result.passwordSet} />
          </div>
        </div>
      </section>
    );
  } catch (error) {
    return (
      <section className="section-shell py-10 sm:py-12">
        <div className="surface-panel mx-auto max-w-3xl p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Merchant activation</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Activation unavailable</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {error instanceof Error ? error.message : "This activation link is invalid or expired."}
          </p>
        </div>
      </section>
    );
  }
}
