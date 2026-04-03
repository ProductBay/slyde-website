import { MerchantLoginForm } from "@/components/merchant/merchant-login-form";

export default function MerchantLoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.18),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <MerchantLoginForm />
      </div>
    </div>
  );
}
