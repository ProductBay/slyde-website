"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiAccessSchema, businessInquirySchema, contactSchema } from "@/lib/forms";
import { TurnstileWidget } from "@/components/site/turnstile-widget";

type Mode = "business" | "api" | "contact";

type FormProps = {
  mode: Mode;
  title: string;
  description: string;
  submitLabel: string;
  successHref: string;
};

export function InquiryForm({ mode, title, description, submitLabel, successHref }: FormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);

    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Complete the bot protection check before submitting.");
      return;
    }

    const payload =
      mode === "business"
        ? businessInquirySchema.safeParse({
            companyName: formData.get("companyName"),
            contactName: formData.get("contactName"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            businessType: formData.get("businessType"),
            deliveryVolume: formData.get("deliveryVolume"),
            coverageNeeds: formData.get("coverageNeeds"),
            goals: formData.get("goals"),
            legal: {
              accuracyConfirmed: formData.get("accuracyConfirmed") === "true",
              contactConsent: formData.get("contactConsent") === "true",
              noGuaranteeAcknowledgement: formData.get("noGuaranteeAcknowledgement") === "true",
              acceptedDocumentTypes: [
                formData.get("acceptMerchantInterestTerms"),
                formData.get("acceptMerchantPrivacyNotice"),
              ].filter(Boolean),
            },
          })
        : mode === "api"
          ? apiAccessSchema.safeParse({
              companyName: formData.get("companyName"),
              contactName: formData.get("contactName"),
              email: formData.get("email"),
              platformType: formData.get("platformType"),
              monthlyVolume: formData.get("monthlyVolume"),
              integrationNeeds: formData.get("integrationNeeds"),
              webhookNeeds: formData.get("webhookNeeds") === "on",
            })
          : contactSchema.safeParse({
              name: formData.get("name"),
              email: formData.get("email"),
              topic: formData.get("topic"),
              message: formData.get("message"),
            });

    if (!payload.success) {
      setError(payload.error.issues[0]?.message ?? "Please review the form.");
      return;
    }

    setPending(true);

    startTransition(async () => {
      const endpoint =
        mode === "business"
          ? "/api/public/business-inquiries"
          : mode === "api"
            ? "/api/public/api-access-requests"
            : "/api/public/contact";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(turnstileToken ? { "x-turnstile-token": turnstileToken } : {}),
        },
        body: JSON.stringify(payload.data),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setPending(false);
        setError(body?.error || "We could not submit your request right now. Please try again.");
        return;
      }

      window.location.assign(successHref);
    });
  }

  return (
    <section className="surface-panel overflow-hidden p-6 sm:p-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="eyebrow-badge border-sky-100 bg-sky-50 text-sky-700">
            {mode === "business" ? "Partnership Intake" : mode === "api" ? "Integration Request" : "Support Contact"}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-surface-1 px-4 py-3 text-xs leading-6 text-slate-500">
          Secure public intake flow
          <br />
          Ready for backend routing
        </div>
      </div>
      <form
        className="grid gap-4"
        action={(formData) => {
          void handleSubmit(formData);
        }}
      >
        {mode !== "contact" ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="field-shell">
                <span className="field-label">Company name</span>
                <input name="companyName" className="field-input" placeholder="Your company" />
              </label>
              <label className="field-shell">
                <span className="field-label">Contact name</span>
                <input name="contactName" className="field-input" placeholder="Your name" />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="field-shell">
                <span className="field-label">Email</span>
                <input type="email" name="email" className="field-input" placeholder="name@company.com" />
              </label>
              {mode === "business" ? (
                <label className="field-shell">
                  <span className="field-label">Phone</span>
                  <input name="phone" className="field-input" placeholder="+1 876..." />
                </label>
              ) : (
                <label className="field-shell">
                  <span className="field-label">Platform type</span>
                  <input name="platformType" className="field-input" placeholder="Commerce platform / marketplace / ERP" />
                </label>
              )}
            </div>
          </>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="field-shell">
              <span className="field-label">Name</span>
              <input name="name" className="field-input" placeholder="Your name" />
            </label>
            <label className="field-shell">
              <span className="field-label">Email</span>
              <input type="email" name="email" className="field-input" placeholder="you@example.com" />
            </label>
          </div>
        )}

        {mode === "business" ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="field-shell">
                <span className="field-label">Business type</span>
                <select name="businessType" className="field-input" defaultValue="merchant">
                  <option value="merchant">Merchant</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="retailer">Retailer</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="field-shell">
                <span className="field-label">Expected delivery volume</span>
                <input name="deliveryVolume" className="field-input" placeholder="Example: 200 deliveries per week" />
              </label>
            </div>
            <label className="field-shell">
              <span className="field-label">Coverage needs</span>
              <input name="coverageNeeds" className="field-input" placeholder="Kingston, Portmore, Montego Bay..." />
            </label>
            <label className="field-shell">
              <span className="field-label">What do you need SLYDE to support?</span>
              <textarea name="goals" className="field-input min-h-32" placeholder="Tell us about your delivery model, customer needs, SLAs, and integration expectations." />
            </label>
            <div className="rounded-[1.75rem] border border-slate-200 bg-surface-1 p-5">
              <p className="text-sm font-semibold text-slate-950">Merchant legal acknowledgments</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                SLYDE is onboarding merchants region by region. These acknowledgments are required so your inquiry can move into review, waitlist handling, and future onboarding safely.
              </p>
              <div className="mt-5 grid gap-4">
                <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4">
                  <input type="checkbox" name="accuracyConfirmed" value="true" className="field-checkbox mt-1" />
                  <span className="text-sm leading-7 text-slate-700">I confirm the information provided is accurate.</span>
                </label>
                <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4">
                  <input type="checkbox" name="contactConsent" value="true" className="field-checkbox mt-1" />
                  <span className="text-sm leading-7 text-slate-700">I agree that SLYDE may contact me regarding my business inquiry, onboarding, launch readiness, and service availability.</span>
                </label>
                <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4">
                  <input type="checkbox" name="noGuaranteeAcknowledgement" value="true" className="field-checkbox mt-1" />
                  <span className="text-sm leading-7 text-slate-700">I understand that submitting this form does not guarantee immediate activation or live service in my area.</span>
                </label>
                <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4">
                  <input type="checkbox" name="acceptMerchantInterestTerms" value="merchant_interest_terms" className="field-checkbox mt-1" />
                  <span className="text-sm leading-7 text-slate-700">
                    I have read and agree to the{" "}
                    <Link href="/legal/merchant-onboarding-terms" target="_blank" className="font-semibold text-sky-700 underline underline-offset-4">
                      Merchant Interest and Onboarding Terms
                    </Link>
                    .
                  </span>
                </label>
                <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4">
                  <input type="checkbox" name="acceptMerchantPrivacyNotice" value="merchant_privacy_notice" className="field-checkbox mt-1" />
                  <span className="text-sm leading-7 text-slate-700">
                    I have read the{" "}
                    <Link href="/legal/merchant-privacy" target="_blank" className="font-semibold text-sky-700 underline underline-offset-4">
                      Merchant Privacy Notice
                    </Link>
                    .
                  </span>
                </label>
              </div>
              <p className="mt-4 text-xs leading-6 text-slate-500">
                After submission, SLYDE may contact your business by email, WhatsApp, or phone regarding waitlist status, onboarding readiness, and launch timing in your area.
              </p>
            </div>
          </>
        ) : null}

        {mode === "api" ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="field-shell">
                <span className="field-label">Monthly volume</span>
                <input name="monthlyVolume" className="field-input" placeholder="Projected jobs per month" />
              </label>
              <label className="flex items-center gap-3 rounded-3xl border border-border bg-surface-1 px-4 py-4">
                <input type="checkbox" name="webhookNeeds" className="field-checkbox" />
                <span className="text-sm text-slate-700">We need webhook or event-driven delivery updates.</span>
              </label>
            </div>
            <label className="field-shell">
              <span className="field-label">Integration needs</span>
              <textarea name="integrationNeeds" className="field-input min-h-32" placeholder="Describe quoting, dispatch, tracking, webhook, and proof-of-delivery requirements." />
            </label>
          </>
        ) : null}

        {mode === "contact" ? (
          <>
            <label className="field-shell">
              <span className="field-label">Topic</span>
              <input name="topic" className="field-input" placeholder="Support, partnership, application, media..." />
            </label>
            <label className="field-shell">
              <span className="field-label">Message</span>
              <textarea name="message" className="field-input min-h-32" placeholder="Tell us how we can help." />
            </label>
          </>
        ) : null}

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <TurnstileWidget onToken={setTurnstileToken} />
        <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-2xl text-xs leading-6 text-slate-500">
            {mode === "business"
              ? "Merchant interest submissions are version-linked to SLYDE legal documents so onboarding, waitlist review, and future activation remain auditable."
              : "These forms are wired to the public intake architecture and can be redirected to production services later without changing the page flow."}
          </p>
          <Button type="submit" disabled={pending}>
            {pending ? "Submitting..." : submitLabel}
          </Button>
        </div>
      </form>
    </section>
  );
}
