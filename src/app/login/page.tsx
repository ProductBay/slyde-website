import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserAuthForm } from "@/components/user/user-auth-form";
import { buildMetadata } from "@/lib/metadata";
import { getSessionContext, hasRole } from "@/server/auth/session";

export const metadata: Metadata = buildMetadata(
  "Sign In",
  "Sign in or create a SLYDE account to track parcels, refer friends, and manage your profile.",
  "/login",
);

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSessionContext();
  if (session?.user.isEnabled) {
    if (hasRole(session.user, ["platform_admin", "operations_admin"])) {
      redirect("/admin");
    }
    redirect("/account");
  }

  const { tab } = await searchParams;

  return (
    <section className="section-shell py-12 sm:py-16">
      <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
        {/* Left panel */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600">
              My Account
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">
              Welcome to SLYDE
            </h1>
            <p className="text-sm leading-7 text-slate-600">
              Sign in to track your deliveries, manage your profile, refer friends, and get support — all in one place.
            </p>
          </div>

          <ul className="space-y-3">
            {[
              { icon: "📦", label: "Track parcels in real time" },
              { icon: "🎁", label: "Refer friends and earn rewards" },
              { icon: "💬", label: "Manage support requests" },
              { icon: "👤", label: "Update your profile and preferences" },
            ].map(({ icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-slate-700">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-base">{icon}</span>
                {label}
              </li>
            ))}
          </ul>

          <p className="text-xs text-slate-400">
            Are you a Slyder or business partner?{" "}
            <a href="/become-a-slyder" className="text-slate-600 underline-offset-2 hover:underline">
              Apply here
            </a>{" "}
            or{" "}
            <a href="/for-businesses" className="text-slate-600 underline-offset-2 hover:underline">
              register your business
            </a>
            .
          </p>
        </div>

        {/* Right panel — form */}
        <UserAuthForm defaultTab={tab === "register" ? "register" : "login"} />
      </div>
    </section>
  );
}
