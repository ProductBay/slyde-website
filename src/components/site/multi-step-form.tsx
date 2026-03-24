"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { courierTypes, deliveryPreferences, slyderApplicationSchema, type SlyderApplicationDraft } from "@/lib/forms";
import { FileUploadField, type FileMeta } from "@/components/site/file-upload-field";
import { StepIndicator } from "@/components/site/step-indicator";
import { TurnstileWidget } from "@/components/site/turnstile-widget";

const STORAGE_KEY = "slyde-slyder-application-draft";
const serviceZones = ["Kingston", "New Kingston", "Half Way Tree", "Portmore", "Spanish Town", "Montego Bay"];

const stepTitles = [
  "Personal",
  "Courier",
  "Vehicle",
  "Documents",
  "Preferences",
  "Readiness",
  "Agreements",
  "Review",
];

const defaultDraft: SlyderApplicationDraft = {
  personal: {
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    parishTown: "",
    address: "",
    trn: "",
    emergencyContact: "",
  },
  courier: {
    courierType: "motorcycle",
  },
  vehicle: {
    make: "",
    model: "",
    year: "",
    color: "",
    plateNumber: "",
    registrationExpiry: "",
    insuranceExpiry: "",
    fitnessExpiry: "",
  },
  documents: {
    nationalId: [],
    driversLicense: [],
    vehicleRegistration: [],
    insurance: [],
    fitness: [],
    profilePhoto: [],
    supporting: [],
  },
  preferences: {
    zones: [],
    availability: "",
    commitment: "part-time",
    peakHours: "",
    maxTravelComfort: "",
    deliveryTypes: [],
  },
  readiness: {
    smartphoneType: "",
    whatsappNumber: "",
    gpsEnabled: false,
    dataAccess: false,
    safetyGear: false,
    insulatedBag: false,
    helmetReady: false,
    readinessNotes: "",
  },
  agreements: {
    privacyConsent: false,
    onboardingConsent: false,
    documentReviewConsent: false,
    contractorAcknowledgement: false,
    platformTermsAcceptance: false,
  },
  referral: {
    referralCode: "",
    inviteToken: "",
    referralSource: "none",
    capturedAt: "",
    landingPage: "",
  },
};

function requiresVehicle(courierType: SlyderApplicationDraft["courier"]["courierType"]) {
  return courierType === "motorcycle" || courierType === "car" || courierType === "van" || courierType === "other";
}

function requiresDriversLicense(courierType: SlyderApplicationDraft["courier"]["courierType"]) {
  return courierType === "motorcycle" || courierType === "car" || courierType === "van";
}

function sanitizeUploadedFiles(files: FileMeta[]) {
  return files.filter((file) => Boolean(file.fileUrl && file.storageKey));
}

function sanitizeDraftDocuments(draft: SlyderApplicationDraft): SlyderApplicationDraft {
  return {
    ...draft,
    documents: {
      nationalId: sanitizeUploadedFiles(draft.documents.nationalId),
      driversLicense: sanitizeUploadedFiles(draft.documents.driversLicense),
      vehicleRegistration: sanitizeUploadedFiles(draft.documents.vehicleRegistration),
      insurance: sanitizeUploadedFiles(draft.documents.insurance),
      fitness: sanitizeUploadedFiles(draft.documents.fitness),
      profilePhoto: sanitizeUploadedFiles(draft.documents.profilePhoto),
      supporting: sanitizeUploadedFiles(draft.documents.supporting),
    },
  };
}

function validateStep(step: number, draft: SlyderApplicationDraft) {
  switch (step) {
    case 0:
      return slyderApplicationSchema.shape.personal.safeParse(draft.personal);
    case 1:
      return slyderApplicationSchema.shape.courier.safeParse(draft.courier);
    case 2:
      if (!requiresVehicle(draft.courier.courierType)) return { success: true } as const;
      return slyderApplicationSchema.shape.vehicle.safeParse(draft.vehicle);
    case 3: {
      const base = slyderApplicationSchema.shape.documents.safeParse(draft.documents);
      if (!base.success) return base;
      if (requiresDriversLicense(draft.courier.courierType) && draft.documents.driversLicense.length === 0) {
        return { success: false, error: { issues: [{ path: ["driversLicense"], message: "Driver's license is required" }] } };
      }
      if (requiresVehicle(draft.courier.courierType) && draft.documents.vehicleRegistration.length === 0) {
        return { success: false, error: { issues: [{ path: ["vehicleRegistration"], message: "Vehicle registration is required" }] } };
      }
      return { success: true } as const;
    }
    case 4:
      return slyderApplicationSchema.shape.preferences.safeParse(draft.preferences);
    case 5:
      return slyderApplicationSchema.shape.readiness.safeParse(draft.readiness);
    case 6:
      return slyderApplicationSchema.shape.agreements.safeParse(draft.agreements);
    default:
      return slyderApplicationSchema.safeParse(draft);
  }
}

function issueMap(result: ReturnType<typeof validateStep>) {
  if (result.success) return {};
  return Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
}

function Field({
  label,
  name,
  value,
  error,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="field-shell">
      <span className="field-label">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-input"
        placeholder={placeholder}
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-3xl border border-border bg-surface-1 px-4 py-4">
      <input type="checkbox" className="field-checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

export function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<SlyderApplicationDraft>(defaultDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      setDraft(sanitizeDraftDocuments({ ...defaultDraft, ...JSON.parse(saved) }));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referralCode = params.get("ref") || params.get("referralCode") || "";
    const inviteToken = params.get("invite") || params.get("inviteToken") || "";
    const landingPage = `${window.location.pathname}${window.location.search}`;

    if (!referralCode && !inviteToken && draft.referral.landingPage) return;

    setDraft((current) => ({
      ...current,
      referral: {
        referralCode: referralCode || current.referral.referralCode || "",
        inviteToken: inviteToken || current.referral.inviteToken || "",
        referralSource: inviteToken ? "invite_link" : referralCode || current.referral.referralCode ? "code" : "none",
        capturedAt: current.referral.capturedAt || (referralCode || inviteToken ? new Date().toISOString() : ""),
        landingPage,
      },
    }));
  }, [draft.referral.landingPage, draft.referral.referralCode, draft.referral.inviteToken, draft.referral.capturedAt]);

  function updateDocument(key: keyof SlyderApplicationDraft["documents"], files: FileMeta[]) {
    setDraft((current) => ({
      ...current,
      documents: {
        ...current.documents,
        [key]: files,
      },
    }));
  }

  function nextStep() {
    const result = validateStep(step, draft);
    if (!result.success) {
      setErrors(issueMap(result));
      return;
    }
    setErrors({});
    setStep((current) => Math.min(current + 1, stepTitles.length - 1));
  }

  function prevStep() {
    setErrors({});
    setStep((current) => Math.max(current - 1, 0));
  }

  async function submitApplication() {
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
      setSubmitError("Complete the bot protection check before submitting.");
      return;
    }

    const result = slyderApplicationSchema.safeParse(draft);
    if (!result.success) {
      setErrors(issueMap(validateStep(step, draft)));
      setSubmitError("Please review the application before submitting.");
      return;
    }

    setPending(true);
    setSubmitError(null);

    startTransition(async () => {
      const payload = {
        ...result.data,
        workflow: {
          stage: "application_submitted",
          nextExpectedStage: "admin_review",
          activationLifecycle: [
            "application_submitted",
            "admin_review",
            "document_verification",
            "approval",
            "slyder_account_created",
            "activation_instructions_sent",
            "app_login",
            "setup_completion",
            "readiness_confirmed",
            "work_eligible",
          ],
        },
      };

      const response = await fetch("/api/public/slyder-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(turnstileToken ? { "x-turnstile-token": turnstileToken } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | { error?: { formErrors?: string[]; fieldErrors?: Record<string, string[]> } | string }
          | null;
        const message =
          typeof errorBody?.error === "string"
            ? errorBody.error
            : errorBody?.error?.formErrors?.[0] ||
              Object.values(errorBody?.error?.fieldErrors ?? {}).flat()[0] ||
              "We could not submit your application right now. Please try again.";
        setPending(false);
        setSubmitError(message);
        return;
      }

      window.localStorage.removeItem(STORAGE_KEY);
      window.location.assign("/success/slyder-application");
    });
  }

  const vehicleRequired = requiresVehicle(draft.courier.courierType);
  const licenseRequired = requiresDriversLicense(draft.courier.courierType);

  return (
    <div className="space-y-8">
      <StepIndicator steps={stepTitles.map((title) => ({ title }))} currentStep={step} />
      <div className="surface-panel overflow-hidden p-6 sm:p-8">
        <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="eyebrow-badge border-sky-100 bg-sky-50 text-sky-700">Application progress</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{stepTitles[step]}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              This intake is structured around the real Slyder lifecycle: application, review, approval, activation, app login, readiness, and work eligibility.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-surface-1 px-4 py-3 text-sm leading-6 text-slate-500">
            Step {step + 1} of {stepTitles.length}
            <br />
            Draft saved on this device
          </div>
        </div>

        {step === 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name" name="fullName" value={draft.personal.fullName} error={errors.fullName} onChange={(value) => setDraft((c) => ({ ...c, personal: { ...c.personal, fullName: value } }))} />
            <Field label="Email" name="email" type="email" value={draft.personal.email} error={errors.email} onChange={(value) => setDraft((c) => ({ ...c, personal: { ...c.personal, email: value } }))} />
            <Field label="Phone number" name="phone" value={draft.personal.phone} error={errors.phone} onChange={(value) => setDraft((c) => ({ ...c, personal: { ...c.personal, phone: value } }))} />
            <Field label="Date of birth" name="dateOfBirth" type="date" value={draft.personal.dateOfBirth} error={errors.dateOfBirth} onChange={(value) => setDraft((c) => ({ ...c, personal: { ...c.personal, dateOfBirth: value } }))} />
            <Field label="Parish / town" name="parishTown" value={draft.personal.parishTown} error={errors.parishTown} onChange={(value) => setDraft((c) => ({ ...c, personal: { ...c.personal, parishTown: value } }))} />
            <Field label="TRN" name="trn" value={draft.personal.trn} error={errors.trn} onChange={(value) => setDraft((c) => ({ ...c, personal: { ...c.personal, trn: value } }))} />
            <label className="field-shell md:col-span-2">
              <span className="field-label">Address</span>
              <textarea value={draft.personal.address} onChange={(event) => setDraft((c) => ({ ...c, personal: { ...c.personal, address: event.target.value } }))} className="field-input min-h-28" />
              {errors.address ? <p className="text-sm text-rose-600">{errors.address}</p> : null}
            </label>
            <Field label="Emergency contact" name="emergencyContact" value={draft.personal.emergencyContact} error={errors.emergencyContact} onChange={(value) => setDraft((c) => ({ ...c, personal: { ...c.personal, emergencyContact: value } }))} />
            <Field
              label="Referral code (optional)"
              name="referralCode"
              value={draft.referral.referralCode ?? ""}
              onChange={(value) =>
                setDraft((c) => ({
                  ...c,
                  referral: {
                    ...c.referral,
                    referralCode: value,
                    referralSource: c.referral.inviteToken ? "invite_link" : value.trim() ? "code" : "none",
                    capturedAt: value.trim() || c.referral.inviteToken ? c.referral.capturedAt || new Date().toISOString() : "",
                  },
                }))
              }
              placeholder="Enter a Slyder referral code if someone invited you"
            />
            {(draft.referral.inviteToken || draft.referral.referralCode) ? (
              <div className="md:col-span-2 rounded-[1.5rem] border border-sky-100 bg-sky-50 px-4 py-4 text-sm leading-7 text-sky-800">
                Referral attribution captured. Your application will be linked to the Slyder who invited you after the SLYDE app validates the code or invite link.
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courierTypes.map((type) => (
              <button
                key={type}
                type="button"
                className={`rounded-3xl border p-5 text-left transition duration-200 ${draft.courier.courierType === type ? "border-slate-950 bg-slate-950 text-white shadow-panel" : "border-border bg-white text-slate-700 hover:-translate-y-1 hover:border-slate-300 hover:shadow-soft"}`}
                onClick={() => setDraft((c) => ({ ...c, courier: { courierType: type } }))}
              >
                <p className="text-lg font-semibold capitalize">{type}</p>
                <p className={`mt-2 text-sm ${draft.courier.courierType === type ? "text-slate-200" : "text-slate-500"}`}>
                  {type === "walker" ? "Foot-based short range delivery support." : `Apply as a ${type} courier within the SLYDE network.`}
                </p>
              </button>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          vehicleRequired ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Make" name="make" value={draft.vehicle.make} error={errors.make} onChange={(value) => setDraft((c) => ({ ...c, vehicle: { ...c.vehicle, make: value } }))} />
              <Field label="Model" name="model" value={draft.vehicle.model} error={errors.model} onChange={(value) => setDraft((c) => ({ ...c, vehicle: { ...c.vehicle, model: value } }))} />
              <Field label="Year" name="year" value={draft.vehicle.year} error={errors.year} onChange={(value) => setDraft((c) => ({ ...c, vehicle: { ...c.vehicle, year: value } }))} />
              <Field label="Color" name="color" value={draft.vehicle.color} error={errors.color} onChange={(value) => setDraft((c) => ({ ...c, vehicle: { ...c.vehicle, color: value } }))} />
              <Field label="Plate number" name="plateNumber" value={draft.vehicle.plateNumber} error={errors.plateNumber} onChange={(value) => setDraft((c) => ({ ...c, vehicle: { ...c.vehicle, plateNumber: value } }))} />
              <Field label="Registration expiry" name="registrationExpiry" type="date" value={draft.vehicle.registrationExpiry} error={errors.registrationExpiry} onChange={(value) => setDraft((c) => ({ ...c, vehicle: { ...c.vehicle, registrationExpiry: value } }))} />
              <Field label="Insurance expiry" name="insuranceExpiry" type="date" value={draft.vehicle.insuranceExpiry} error={errors.insuranceExpiry} onChange={(value) => setDraft((c) => ({ ...c, vehicle: { ...c.vehicle, insuranceExpiry: value } }))} />
              <Field label="Fitness expiry" name="fitnessExpiry" type="date" value={draft.vehicle.fitnessExpiry} error={errors.fitnessExpiry} onChange={(value) => setDraft((c) => ({ ...c, vehicle: { ...c.vehicle, fitnessExpiry: value } }))} />
            </div>
          ) : (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-800">
              No vehicle details are required for the selected courier type.
            </div>
          )
        ) : null}

        {step === 3 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <FileUploadField label="Government-issued ID" required value={draft.documents.nationalId} error={errors.nationalId} onChange={(files) => updateDocument("nationalId", files)} />
            <FileUploadField label="Profile photo" required value={draft.documents.profilePhoto} error={errors.profilePhoto} onChange={(files) => updateDocument("profilePhoto", files)} />
            <FileUploadField label="Driver's license" required={licenseRequired} value={draft.documents.driversLicense} error={errors.driversLicense} onChange={(files) => updateDocument("driversLicense", files)} />
            <FileUploadField label="Vehicle registration" required={vehicleRequired} value={draft.documents.vehicleRegistration} error={errors.vehicleRegistration} onChange={(files) => updateDocument("vehicleRegistration", files)} />
            <FileUploadField label="Insurance" required={vehicleRequired} value={draft.documents.insurance} error={errors.insurance} onChange={(files) => updateDocument("insurance", files)} />
            <FileUploadField label="Fitness" required={vehicleRequired} value={draft.documents.fitness} error={errors.fitness} onChange={(files) => updateDocument("fitness", files)} />
            <div className="md:col-span-2">
              <FileUploadField label="Other supporting documents" value={draft.documents.supporting} error={errors.supporting} onChange={(files) => updateDocument("supporting", files)} />
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-5">
            <div className="grid gap-3 md:grid-cols-3">
              {serviceZones.map((zone) => (
                <label key={zone} className="flex items-center gap-3 rounded-3xl border border-border bg-surface-1 px-4 py-4">
                  <input
                    type="checkbox"
                    className="field-checkbox"
                    checked={draft.preferences.zones.includes(zone)}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        preferences: {
                          ...current.preferences,
                          zones: event.target.checked
                            ? [...current.preferences.zones, zone]
                            : current.preferences.zones.filter((item) => item !== zone),
                        },
                      }))
                    }
                  />
                  <span className="text-sm text-slate-700">{zone}</span>
                </label>
              ))}
            </div>
            {errors.zones ? <p className="text-sm text-rose-600">{errors.zones}</p> : null}
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Availability" name="availability" value={draft.preferences.availability} error={errors.availability} onChange={(value) => setDraft((c) => ({ ...c, preferences: { ...c.preferences, availability: value } }))} placeholder="Weekdays, weekends, evenings..." />
              <label className="field-shell">
                <span className="field-label">Commitment</span>
                <select className="field-input" value={draft.preferences.commitment} onChange={(event) => setDraft((c) => ({ ...c, preferences: { ...c.preferences, commitment: event.target.value as SlyderApplicationDraft["preferences"]["commitment"] } }))}>
                  <option value="part-time">Part-time</option>
                  <option value="full-time">Full-time</option>
                  <option value="flexible">Flexible</option>
                </select>
              </label>
              <Field label="Peak-hour availability" name="peakHours" value={draft.preferences.peakHours} error={errors.peakHours} onChange={(value) => setDraft((c) => ({ ...c, preferences: { ...c.preferences, peakHours: value } }))} />
              <Field label="Max travel comfort" name="maxTravelComfort" value={draft.preferences.maxTravelComfort} error={errors.maxTravelComfort} onChange={(value) => setDraft((c) => ({ ...c, preferences: { ...c.preferences, maxTravelComfort: value } }))} placeholder="Example: 12 km or cross-parish only by van" />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {deliveryPreferences.map((item) => (
                <label key={item} className="flex items-center gap-3 rounded-3xl border border-border bg-surface-1 px-4 py-4">
                  <input
                    type="checkbox"
                    className="field-checkbox"
                    checked={draft.preferences.deliveryTypes.includes(item)}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        preferences: {
                          ...current.preferences,
                          deliveryTypes: event.target.checked
                            ? [...current.preferences.deliveryTypes, item]
                            : current.preferences.deliveryTypes.filter((type) => type !== item),
                        },
                      }))
                    }
                  />
                  <span className="text-sm capitalize text-slate-700">{item}</span>
                </label>
              ))}
            </div>
            {errors.deliveryTypes ? <p className="text-sm text-rose-600">{errors.deliveryTypes}</p> : null}
          </div>
        ) : null}

        {step === 5 ? (
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Smartphone type" name="smartphoneType" value={draft.readiness.smartphoneType} error={errors.smartphoneType} onChange={(value) => setDraft((c) => ({ ...c, readiness: { ...c.readiness, smartphoneType: value } }))} placeholder="Android / iPhone" />
              <Field label="WhatsApp number" name="whatsappNumber" value={draft.readiness.whatsappNumber} error={errors.whatsappNumber} onChange={(value) => setDraft((c) => ({ ...c, readiness: { ...c.readiness, whatsappNumber: value } }))} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Toggle label="GPS and location services can be enabled while working." checked={draft.readiness.gpsEnabled} onChange={(value) => setDraft((c) => ({ ...c, readiness: { ...c.readiness, gpsEnabled: value } }))} />
              <Toggle label="Reliable mobile data or internet access is available." checked={draft.readiness.dataAccess} onChange={(value) => setDraft((c) => ({ ...c, readiness: { ...c.readiness, dataAccess: value } }))} />
              <Toggle label="I have the required safety gear for my courier type." checked={draft.readiness.safetyGear} onChange={(value) => setDraft((c) => ({ ...c, readiness: { ...c.readiness, safetyGear: value } }))} />
              <Toggle label="I have an insulated bag or can obtain one." checked={draft.readiness.insulatedBag} onChange={(value) => setDraft((c) => ({ ...c, readiness: { ...c.readiness, insulatedBag: value } }))} />
              <Toggle label="I have a helmet if my courier type requires one." checked={draft.readiness.helmetReady} onChange={(value) => setDraft((c) => ({ ...c, readiness: { ...c.readiness, helmetReady: value } }))} />
            </div>
            {errors.gpsEnabled ? <p className="text-sm text-rose-600">{errors.gpsEnabled}</p> : null}
            {errors.dataAccess ? <p className="text-sm text-rose-600">{errors.dataAccess}</p> : null}
            <label className="field-shell">
              <span className="field-label">Readiness notes</span>
              <textarea className="field-input min-h-28" value={draft.readiness.readinessNotes} onChange={(event) => setDraft((c) => ({ ...c, readiness: { ...c.readiness, readinessNotes: event.target.value } }))} placeholder="Anything we should know about your operating availability or equipment readiness?" />
            </label>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="grid gap-3">
            <div className="rounded-[1.5rem] border border-slate-200 bg-surface-1 p-5">
              <p className="text-sm font-semibold text-slate-950">Required legal documents</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                The SLYDE application flow uses the current active legal documents for Slyder onboarding. Review them before continuing.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <Link href="/legal/slyder-privacy" target="_blank" className="font-semibold text-sky-700 underline underline-offset-4">
                  Slyder Applicant Privacy Notice
                </Link>
                <Link href="/legal/slyder-onboarding-terms" target="_blank" className="font-semibold text-sky-700 underline underline-offset-4">
                  Slyder Application and Onboarding Terms
                </Link>
              </div>
            </div>
            <Toggle label="I have read the Slyder Applicant Privacy Notice." checked={draft.agreements.privacyConsent} onChange={(value) => setDraft((c) => ({ ...c, agreements: { ...c.agreements, privacyConsent: value } }))} />
            <Toggle label="I have read and agree to the Slyder Application and Onboarding Terms." checked={draft.agreements.onboardingConsent} onChange={(value) => setDraft((c) => ({ ...c, agreements: { ...c.agreements, onboardingConsent: value } }))} />
            <Toggle label="I consent to document review and verification checks." checked={draft.agreements.documentReviewConsent} onChange={(value) => setDraft((c) => ({ ...c, agreements: { ...c.agreements, documentReviewConsent: value } }))} />
            <Toggle label="I acknowledge the independent contractor model may apply based on SLYDE operating terms." checked={draft.agreements.contractorAcknowledgement} onChange={(value) => setDraft((c) => ({ ...c, agreements: { ...c.agreements, contractorAcknowledgement: value } }))} />
            <Toggle label="I accept the SLYDE platform terms." checked={draft.agreements.platformTermsAcceptance} onChange={(value) => setDraft((c) => ({ ...c, agreements: { ...c.agreements, platformTermsAcceptance: value } }))} />
            {Object.values(errors).length ? <p className="text-sm text-rose-600">{Object.values(errors)[0]}</p> : null}
          </div>
        ) : null}

        {step === 7 ? (
          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-slate-200 bg-surface-1 p-5">
              <h3 className="text-lg font-semibold text-slate-950">Application summary</h3>
              <div className="mt-4 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
                <p><strong className="text-slate-950">Applicant:</strong> {draft.personal.fullName || "Not provided"}</p>
                <p><strong className="text-slate-950">Courier type:</strong> {draft.courier.courierType}</p>
                <p><strong className="text-slate-950">Coverage zones:</strong> {draft.preferences.zones.join(", ") || "Not selected"}</p>
                <p><strong className="text-slate-950">Commitment:</strong> {draft.preferences.commitment}</p>
                <p><strong className="text-slate-950">Phone:</strong> {draft.personal.phone || "Not provided"}</p>
                <p><strong className="text-slate-950">WhatsApp:</strong> {draft.readiness.whatsappNumber || "Not provided"}</p>
                <p><strong className="text-slate-950">Referral:</strong> {draft.referral.referralCode || (draft.referral.inviteToken ? "Invite link captured" : "No referral")}</p>
              </div>
            </div>
            <div className="dark-panel p-5">
              <h3 className="text-lg font-semibold">What happens after submission</h3>
              <ol className="mt-4 grid gap-3 text-sm leading-7 text-slate-300">
                <li>1. Your application enters admin review.</li>
                <li>2. Documents and readiness are verified.</li>
                <li>3. Approved applicants are converted into real Slyder accounts.</li>
                <li>4. Activation and login instructions are issued for the Slyder app.</li>
                <li>5. Setup completion and readiness checks determine work eligibility.</li>
              </ol>
            </div>
            <TurnstileWidget onToken={setTurnstileToken} />
            {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="ghost" onClick={prevStep} disabled={step === 0 || pending} leadingIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
          {step < stepTitles.length - 1 ? (
            <Button type="button" onClick={nextStep} trailingIcon={<ArrowRight className="h-4 w-4" />} disabled={pending}>
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={() => void submitApplication()} disabled={pending}>
              {pending ? "Submitting..." : "Submit application"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
