import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Join SLYDE – You're Invited",
  "You've been referred to join SLYDE as a Slyder. Claim your spot today.",
  "/r",
);

export default async function ReferralLandingPage({
  params,
}: {
  params: Promise<{ referralCode: string }>;
}) {
  const { referralCode } = await params;
  const code = referralCode?.toUpperCase();

  // Validate the code exists
  let valid = false;
  let referrerName: string | null = null;

  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/public/slyder-referrals/${encodeURIComponent(code)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      valid = !!data.referralCode;
      referrerName = data.referrerName ?? null;
    }
  } catch {
    // invalid or network error — show fallback
  }

  if (!valid) {
    // Redirect to the generic refer page if code not found
    redirect("/refer-a-slyder");
  }

  const applyUrl = `/become-a-slyder/apply?ref=${encodeURIComponent(code)}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sky-950 via-sky-900 to-slate-900 px-4 py-16 text-white">
      <div className="mx-auto w-full max-w-lg text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>

        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">You were invited</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
          {referrerName
            ? <>{referrerName} wants you<br />to join SLYDE</>
            : <>You&apos;ve been invited<br />to join SLYDE</>}
        </h1>

        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-sky-100">
          SLYDE Slyders keep 100% of what they earn from every delivery. No commissions. Just a small weekly network rent — so your income is always yours.
        </p>

        <div className="mt-4 rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
          Referral code: <span className="font-mono font-bold text-white">{code}</span>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href={applyUrl}
            className="w-full max-w-xs rounded-full bg-sky-500 py-4 text-center text-sm font-bold text-white hover:bg-sky-400"
          >
            Reserve My Spot →
          </a>
          <p className="text-xs text-sky-400">Free to apply. No commitment until you activate.</p>
        </div>

        {/* Store referral code in localStorage */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try { localStorage.setItem('slyde-referral-code', ${JSON.stringify(code)}); } catch(e) {}`,
          }}
        />
      </div>
    </main>
  );
}
