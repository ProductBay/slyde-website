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
  searchParams: Promise<{ tab?: string; next?: string }>;
}) {
  const session = await getSessionContext();
  if (session?.user.isEnabled) {
    if (hasRole(session.user, ["platform_admin", "operations_admin"])) {
      redirect("/admin");
    }
    redirect("/account");
  }

  const { tab, next } = await searchParams;
  const isDispatchComingSoon = next === "/dispatch-from-home/start";

  return (
    <section className="section-shell relative py-12 sm:py-16">
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

      {isDispatchComingSoon ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white p-7 text-center shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-700">Dispatch From Home</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Coming soon</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              This flow is not live yet. We are finalizing launch-readiness and will open it shortly.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href="/dispatch-from-home"
                className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Back to overview
              </a>
              <a
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Explore site
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
