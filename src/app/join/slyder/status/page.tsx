import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bell, CheckCircle2, Clock3, Info, Lock, Mail, MessageCircle } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";
import { SlyderLeadPushOptIn } from "@/components/site/join/slyder-lead-push-opt-in";
import { SlyderLeadUpdatesFeed } from "@/components/site/join/slyder-lead-updates-feed";
import { findLeadById } from "@/modules/leads/repositories/slyder-lead.repository";
import { listPublishedSlyderLeadPosts } from "@/modules/leads/services/slyder-lead-post.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata(
  "Slyder Status",
  "Check your SLYDE Slyder lead status, next steps, and whether any action is needed.",
  "/join/slyder/status",
);

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const statusCopy: Record<string, { title: string; body: string; nextAction: string; action?: string }> = {
  NEW: {
    title: "Your Slyder spot is reserved",
    body: "You are in the Slyder leads pipeline. SLYDE has your basic details and will use this page, email, and WhatsApp to guide you when there is something new to do.",
    nextAction: "No action is needed right now. Keep this status page handy and watch for official SLYDE updates.",
  },
  QUALIFIED: {
    title: "Your lead is ready for the next stage",
    body: "Your details currently match the early Slyder lead criteria. SLYDE may invite you to continue when your area, vehicle type, and readiness profile line up with launch needs.",
    nextAction: "If SLYDE has asked you to continue, use the action below. Otherwise, wait for the next email or WhatsApp update.",
    action: "Continue only if invited",
  },
  NURTURING: {
    title: "Your details are saved",
    body: "You are still in the Slyder leads dashboard. SLYDE will keep your details on file as your parish, transport type, and readiness profile are reviewed.",
    nextAction: "No action is needed right now. SLYDE will post or send the next action when one is available.",
  },
  STARTED_APPLICATION: {
    title: "Your application is in progress",
    body: "Your Slyder lead has moved into the application stage. The lead dashboard now points you back to the full application only because you already started that path.",
    nextAction: "Continue the application when you are ready, then return here later for lead and review updates.",
    action: "Continue application",
  },
  ABANDONED: {
    title: "Your application is paused",
    body: "Your lead details remain saved, but the application path is paused. This does not remove you from SLYDE's lead records.",
    nextAction: "Restart only when you are ready. SLYDE may also contact you if a better next step becomes available.",
    action: "Restart application",
  },
  SUBMITTED: {
    title: "Your application was submitted",
    body: "Your lead moved beyond reservation and the full application was submitted. SLYDE will review it through the application pipeline.",
    nextAction: "No action is needed unless SLYDE requests more information by email, WhatsApp, or this status dashboard.",
  },
  UNDER_REVIEW: {
    title: "Your application is under review",
    body: "SLYDE is reviewing your Slyder path. Your next action will be shown here or sent through an official email/WhatsApp update.",
    nextAction: "No action is needed right now. Avoid resubmitting unless SLYDE asks you to update something.",
  },
  APPROVED: {
    title: "You have been approved for onboarding",
    body: "Your Slyder path has been approved for onboarding. SLYDE will guide activation and setup through the onboarding flow.",
    nextAction: "Watch for activation instructions. If SLYDE has already sent them, follow the newest email or WhatsApp message.",
  },
  ACTIVATED: {
    title: "Your Slyder account is activated",
    body: "Your lead has progressed into an activated Slyder account. Future operational steps now live in the Slyder portal.",
    nextAction: "Use your Slyder portal for onboarding, readiness, and launch updates.",
  },
  LIVE: {
    title: "You are live on SLYDE",
    body: "Your Slyder status is live. This lead dashboard is now historical; live delivery access belongs in the Slyder portal.",
    nextAction: "Use your Slyder portal for live delivery access and active operational updates.",
  },
  REJECTED: {
    title: "SLYDE reviewed your details",
    body: "SLYDE is unable to move this Slyder path forward right now. Your lead record remains a reference for support and future review.",
    nextAction: "No action is needed. If a future opportunity fits, SLYDE may contact you again.",
  },
};

function readSingle(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function labelize(value: string) {
  return value.replace(/_/g, " ").toLowerCase();
}

function formatUpdatedAt(value: Date | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-JM", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function isStartedOrBeyond(status: string) {
  return ["STARTED_APPLICATION", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "ACTIVATED", "LIVE"].includes(status);
}

function shouldUseCanonicalApplicationHref(input: {
  status: string;
  applicationInviteUnlocked: boolean;
  ctaLabel: string | null | undefined;
  ctaHref: string | null | undefined;
  actionTitle: string | null | undefined;
}) {
  if (!input.applicationInviteUnlocked || isStartedOrBeyond(input.status)) return false;

  const label = input.ctaLabel?.toLowerCase() || "";
  const title = input.actionTitle?.toLowerCase() || "";
  const href = input.ctaHref?.toLowerCase() || "";

  return (
    !href ||
    href === "/join/slyder" ||
    href.startsWith("/join/slyder?") ||
    href === "/become-a-slyder" ||
    href === "/become-a-slyder/apply" ||
    href.includes("/become-a-slyder/apply") ||
    label.includes("application") ||
    title.includes("application step")
  );
}

function ProgressStep({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${complete ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
        {complete ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
      </span>
      {label}
    </div>
  );
}

export default async function SlyderLeadStatusPage({ searchParams }: { searchParams?: SearchParams }) {
  const params = (await searchParams) ?? {};
  const leadId = readSingle(params.leadId);
  const [lead, posts] = await Promise.all([
    leadId ? findLeadById(leadId).catch(() => null) : null,
    listPublishedSlyderLeadPosts(6).catch(() => []),
  ]);

  if (!lead) {
    return (
      <section className="section-shell py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Link href="/join/slyder" className="text-sm font-semibold text-sky-700 hover:underline">
            Back to Slyder join
          </Link>

          <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <Info className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Slyder Leads Dashboard</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">We could not find this lead yet</h1>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  This status link may be from an older test message, a copied link, or a lead record that has not reached the live dashboard yet.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-sky-100 bg-sky-50 p-5">
              <div className="flex items-start gap-3">
                <Bell className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">What to do next</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    If you recently reserved a Slyder spot, check the newest SLYDE email or WhatsApp message. If the problem continues, contact support with your name, email, and WhatsApp number.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/join/slyder"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-glow transition duration-200 hover:-translate-y-0.5"
              >
                Reserve or update your Slyder lead
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition duration-200 hover:-translate-y-0.5"
              >
                Contact support
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const copy = statusCopy[lead.status] ?? {
    title: "Your Slyder status is saved",
    body: "No action is needed right now. SLYDE will contact you if there is a next step.",
    nextAction: "Watch this page, email, and WhatsApp for official SLYDE updates.",
  };
  const applicationHref = `/become-a-slyder/apply?leadId=${encodeURIComponent(lead.id)}`;
  const actionCenterTitle = lead.actionCenterTitle || "Next action center";
  const actionCenterBody = lead.actionCenterBody || copy.nextAction;
  const actionCenterCtaLabel = lead.actionCenterCtaLabel || copy.action;
  const savedActionCenterCtaHref = lead.actionCenterCtaHref || (copy.action ? applicationHref : null);
  const actionCenterCtaHref = shouldUseCanonicalApplicationHref({
    status: lead.status,
    applicationInviteUnlocked: lead.applicationInviteUnlocked,
    ctaLabel: actionCenterCtaLabel,
    ctaHref: savedActionCenterCtaHref,
    actionTitle: actionCenterTitle,
  })
    ? applicationHref
    : savedActionCenterCtaHref;
  const actionCenterUpdatedAt = formatUpdatedAt(lead.actionCenterUpdatedAt);
  const actionCtaIsApplication =
    Boolean(actionCenterCtaHref) &&
    (actionCenterCtaHref?.startsWith("/become-a-slyder/apply") || actionCenterCtaHref?.includes("/become-a-slyder/apply"));
  const actionCtaEnabled = Boolean(actionCenterCtaLabel && actionCenterCtaHref) && (!actionCtaIsApplication || lead.applicationInviteUnlocked);
  const progressSteps = [
    { label: "Spot reserved", complete: true },
    { label: "Qualification reviewed", complete: ["QUALIFIED", "STARTED_APPLICATION", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "ACTIVATED", "LIVE"].includes(lead.status) },
    { label: "Admin next step sent", complete: lead.applicationInviteUnlocked },
    { label: "Application started", complete: isStartedOrBeyond(lead.status) },
  ];
  const progressPercent = Math.round((progressSteps.filter((step) => step.complete).length / progressSteps.length) * 100);
  const initialLatestPostAt =
    posts
      .map((post) => post.publishedAt || post.createdAt)
      .filter((value): value is Date => Boolean(value))
      .sort((a, b) => b.getTime() - a.getTime())[0]
      ?.toISOString() ?? null;

  return (
    <section className="section-shell py-12 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <Link href="/join/slyder" className="text-sm font-semibold text-sky-700 hover:underline">
          Back to Slyder join
        </Link>

        <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <Info className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Slyder Leads Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{copy.title}</h1>
              <p className="mt-3 text-base leading-7 text-slate-600">{copy.body}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Current status</p>
              <p className="mt-2 text-lg font-semibold capitalize text-slate-950">{labelize(lead.status)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Referral code</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{lead.referralCode ?? "Pending"}</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Slyder onboarding progress</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {lead.applicationInviteUnlocked ? "Your next step is open" : "Your next step is waiting for SLYDE confirmation"}
                </p>
              </div>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${lead.applicationInviteUnlocked ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                {lead.applicationInviteUnlocked ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                {lead.applicationInviteUnlocked ? "Next step unlocked" : "Next step locked"}
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-sky-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {progressSteps.map((step) => (
                <ProgressStep key={step.label} label={step.label} complete={step.complete} />
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-sky-100 bg-sky-50 p-5">
            <div className="flex items-start gap-3">
              <Bell className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-950">{actionCenterTitle}</p>
                  {actionCenterUpdatedAt ? (
                    <span className="rounded-full bg-white px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-sky-700">
                      Updated {actionCenterUpdatedAt}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">{actionCenterBody}</p>
                {actionCenterCtaLabel && actionCenterCtaHref ? (
                  actionCtaEnabled ? (
                  <Link
                    href={actionCenterCtaHref}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition duration-200 hover:-translate-y-0.5"
                  >
                    {actionCenterCtaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  ) : (
                    <div className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-400">
                      <Lock className="h-4 w-4" />
                      {actionCenterCtaLabel}
                    </div>
                  )
                ) : null}
                {!lead.applicationInviteUnlocked && actionCtaIsApplication ? (
                  <p className="mt-3 text-xs font-semibold text-amber-700">
                    SLYDE must unlock this application step before the button becomes active.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <SlyderLeadPushOptIn leadId={lead.id} initialLatestPostAt={initialLatestPostAt} />

        <SlyderLeadUpdatesFeed leadId={lead.id} posts={posts} />

        <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">Lead dashboard</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Your newest visible next step will appear on this status page.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-sky-700" />
                <p className="text-sm font-semibold text-slate-950">Email updates</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                SLYDE will send important status updates, next-step instructions, and action reminders to the email connected to this Slyder lead.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-700" />
                <p className="text-sm font-semibold text-slate-950">WhatsApp updates</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">SLYDE may send reminders and next actions to {lead.whatsapp}.</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <p className="text-sm leading-6 text-slate-600">
                This is separate from the full “apply as a Slyder” form. Your Slyder lead can stay here until SLYDE asks for the next action.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-5 w-5 text-sky-600" />
              <p className="text-sm leading-6 text-slate-600">
                If no action is shown here, wait for a SLYDE WhatsApp or email update before taking another step.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
