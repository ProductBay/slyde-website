"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Package, Settings2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/site/step-indicator";
import { TurnstileWidget } from "@/components/site/turnstile-widget";
import {
  jamaicaParishes,
  parcelCategories,
  urgencyOptions,
  paymentPreferenceOptions,
  residentialLeadSchema,
  residentialPickupSchema,
  residentialDeliverySchema,
  residentialPreferencesSchema,
  type ResidentialLeadInput,
  type ResidentialPickupInput,
  type ResidentialDeliveryInput,
  type ResidentialPreferencesInput,
} from "@/modules/residential-intake/schemas/residential-intake.schemas";

const steps = [
  { title: "Your details" },
  { title: "Pickup address" },
  { title: "Delivery details" },
  { title: "Preferences" },
];

const parcelCategoryLabels: Record<(typeof parcelCategories)[number], string> = {
  documents: "Documents / paperwork",
  small_package: "Small package (fits in a bag)",
  medium_package: "Medium package (shoe-box size)",
  large_package: "Large package (requires two hands)",
  fragile: "Fragile / handle with care",
  food: "Food / perishables",
  other: "Other",
};

const urgencyLabels: Record<(typeof urgencyOptions)[number], string> = {
  asap: "As soon as possible",
  today: "Later today",
  scheduled: "Schedule for another time",
};

const paymentLabels: Record<(typeof paymentPreferenceOptions)[number], string> = {
  wallet: "SLYDE wallet (top-up and pay)",
  card: "Debit / credit card",
  slyde_gift_card: "SLYDE Gift Card",
  adash_scan_to_pay: "A'Dash Wallet scan-to-pay",
};

type FormState = ResidentialLeadInput & ResidentialPickupInput & ResidentialDeliveryInput & ResidentialPreferencesInput;

type AccountIdentity = {
  fullName: string;
  phone: string;
  email?: string;
};

const defaultForm: Partial<FormState> = {
  fullName: "",
  phone: "",
  email: "",
  parish: undefined,
  area: "",
  pickupAddress: "",
  liveLocationPing: undefined,
  dropoffParish: undefined,
  dropoffArea: "",
  dropoffAddress: "",
  parcelCategory: undefined,
  parcelNotes: "",
  urgency: undefined,
  preferredWindow: "",
  paymentPreference: undefined,
  privacyAccepted: undefined,
  termsAccepted: undefined,
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950/10 disabled:opacity-50"
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950/10 disabled:opacity-50"
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950/10 disabled:opacity-50"
    />
  );
}

function RadioCard({
  label,
  value,
  name,
  checked,
  onChange,
}: {
  label: string;
  value: string;
  name: string;
  checked: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
        checked
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      {label}
    </label>
  );
}

export function ResidentialDispatchIntakeForm({ identity }: { identity: AccountIdentity }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Partial<FormState>>({
    ...defaultForm,
    fullName: identity.fullName,
    phone: identity.phone,
    email: identity.email ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  function getAccuracyBadge(accuracyMeters?: number) {
    if (accuracyMeters == null) return null;
    if (accuracyMeters <= 20) {
      return { label: "Excellent", className: "bg-emerald-100 text-emerald-800" };
    }
    if (accuracyMeters <= 60) {
      return { label: "Good", className: "bg-sky-100 text-sky-800" };
    }
    return { label: "Low", className: "bg-amber-100 text-amber-800" };
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K] | string | boolean | undefined) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validateStep(index: number): boolean {
    let result;
    if (index === 0) result = residentialLeadSchema.safeParse(form);
    else if (index === 1) result = residentialPickupSchema.safeParse(form);
    else if (index === 2) result = residentialDeliverySchema.safeParse(form);
    else result = residentialPreferencesSchema.safeParse(form);

    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      const errs: Record<string, string> = {};
      for (const [k, msgs] of Object.entries(flat)) {
        if (msgs && msgs[0]) errs[k] = msgs[0];
      }
      setErrors(errs);
      return false;
    }
    setErrors({});
    return true;
  }

  function handleNext() {
    if (!validateStep(step)) return;
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setStep((s) => s - 1);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function captureLiveLocation() {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationMessage("Live location is not supported on this device/browser.");
      return;
    }

    setLocating(true);
    setLocationMessage("Getting your most accurate live location...");

    const resolvePlainAddress = async (latitude: number, longitude: number) => {
      try {
        const reverseResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=20&addressdetails=1&namedetails=1`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        );
        if (!reverseResponse.ok) return "";
        const reverseData = (await reverseResponse.json()) as { display_name?: string };
        return reverseData.display_name?.trim() ?? "";
      } catch {
        return "";
      }
    };

    const applyCapturedLocation = async (position: GeolocationPosition) => {
      const latitude = Number(position.coords.latitude.toFixed(7));
      const longitude = Number(position.coords.longitude.toFixed(7));
      const accuracyMeters = Math.round(position.coords.accuracy);

      update("liveLocationPing", {
        latitude,
        longitude,
        accuracyMeters,
        capturedAt: new Date().toISOString(),
      });

      const resolvedAddress = await resolvePlainAddress(latitude, longitude);
      if (resolvedAddress) {
        update("pickupAddress", resolvedAddress);
      } else {
        update("pickupAddress", `Pinned location: ${latitude}, ${longitude}`);
      }

      if (accuracyMeters <= 20) {
        setLocationMessage("Precise live location captured and pickup address auto-filled.");
      } else {
        setLocationMessage(`Location captured (about ${accuracyMeters}m accuracy). For best precision, move near open sky and tap Ping Live Location again.`);
      }
    };

    const captureBestPreciseFix = () =>
      new Promise<GeolocationPosition>((resolve, reject) => {
        let best: GeolocationPosition | null = null;
        const startedAt = Date.now();

        const timeoutId = window.setTimeout(() => {
          navigator.geolocation.clearWatch(watchId);
          if (best) resolve(best);
          else reject(new Error("Timed out waiting for location"));
        }, 12000);

        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            if (!best || position.coords.accuracy < best.coords.accuracy) {
              best = position;
            }
            const strongEnough = position.coords.accuracy <= 12;
            const timedOut = Date.now() - startedAt >= 9000;
            if (strongEnough || timedOut) {
              window.clearTimeout(timeoutId);
              navigator.geolocation.clearWatch(watchId);
              if (best) resolve(best);
              else reject(new Error("No high-accuracy fix"));
            }
          },
          () => {
            window.clearTimeout(timeoutId);
            navigator.geolocation.clearWatch(watchId);
            if (best) resolve(best);
            else reject(new Error("Location access denied or unavailable"));
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          },
        );
      });

    captureBestPreciseFix()
      .then(async (precisePosition) => {
        await applyCapturedLocation(precisePosition);
        setLocating(false);
      })
      .catch(() => {
        setLocationMessage("Could not capture your live location. Please allow location access and try again.");
        setLocating(false);
      });
  }

  const accuracyBadge = getAccuracyBadge(form.liveLocationPing?.accuracyMeters);

  async function handleSubmit() {
    if (!validateStep(3)) return;
    if (!turnstileToken) {
      setErrors({ _form: "Please complete the security check before submitting." });
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/public/residential-intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Turnstile-Token": turnstileToken,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data?.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(`/dispatch-from-home/success?ref=${data.referenceCode}`);
    } catch {
      setServerError("A network error occurred. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <StepIndicator steps={steps} currentStep={step} />

      <div className="rounded-[1.75rem] border border-white/50 bg-white/95 shadow-panel">
        {/* Step header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
          {step === 0 && <User className="h-5 w-5 text-sky-600" />}
          {step === 1 && <MapPin className="h-5 w-5 text-sky-600" />}
          {step === 2 && <Package className="h-5 w-5 text-sky-600" />}
          {step === 3 && <Settings2 className="h-5 w-5 text-sky-600" />}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">Step {step + 1} of 4</p>
            <h2 className="text-lg font-semibold text-slate-950">{steps[step].title}</h2>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          {/* ─── Step 1: Your details ─────────────────────── */}
          {step === 0 && (
            <>
              <div>
                <Label required>Full name</Label>
                <Input
                  placeholder="Account full name"
                  value={form.fullName ?? ""}
                  disabled
                />
                <FieldError message={errors.fullName} />
              </div>
              <div>
                <Label required>Phone number</Label>
                <Input
                  type="tel"
                  placeholder="Account phone"
                  value={form.phone ?? ""}
                  disabled
                />
                <FieldError message={errors.phone} />
              </div>
              <div>
                <Label>Email address (optional)</Label>
                <Input
                  type="email"
                  placeholder="Account email"
                  value={form.email ?? ""}
                  disabled
                />
                <FieldError message={errors.email} />
                <p className="mt-1 text-xs text-slate-500">
                  Identity details come from your secured account. Update them from My Account settings.
                </p>
              </div>
              <div>
                <Label required>Your parish</Label>
                <Select
                  value={form.parish ?? ""}
                  onChange={(e) => update("parish", e.target.value as (typeof jamaicaParishes)[number])}
                >
                  <option value="">Select parish...</option>
                  {jamaicaParishes.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Select>
                <FieldError message={errors.parish} />
              </div>
              <div>
                <Label required>Your area or community</Label>
                <Input
                  placeholder="e.g. Liguanea, Papine, Bull Bay"
                  value={form.area ?? ""}
                  onChange={(e) => update("area", e.target.value)}
                />
                <FieldError message={errors.area} />
              </div>
            </>
          )}

          {/* ─── Step 2: Pickup address ───────────────────── */}
          {step === 1 && (
            <div>
              <Label required>Pickup address</Label>
              <p className="mt-0.5 text-sm text-slate-500">
                Where should the Slyder collect the package? Include street name, number, and any nearby landmark.
              </p>
              <Textarea
                placeholder="e.g. 14 Mona Road, Kingston 7, near UWI main gate"
                value={form.pickupAddress ?? ""}
                onChange={(e) => update("pickupAddress", e.target.value)}
              />
              <FieldError message={errors.pickupAddress} />
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="secondary" onClick={captureLiveLocation} disabled={locating}>
                    {locating ? "Capturing location..." : "Ping Live Location"}
                  </Button>
                  {form.liveLocationPing ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
                  {form.liveLocationPing ? (
                    <>
                      <span className="text-xs text-slate-600">
                        {form.liveLocationPing.latitude}, {form.liveLocationPing.longitude}
                      </span>
                      {accuracyBadge ? (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${accuracyBadge.className}`}>
                          {accuracyBadge.label}
                        </span>
                      ) : null}
                    </>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  This improves pickup precision so the assigned Slyder can navigate directly to your exact location.
                </p>
                {locationMessage ? <p className="mt-2 text-xs text-slate-700">{locationMessage}</p> : null}
              </div>
            </div>
          )}

          {/* ─── Step 3: Delivery details ─────────────────── */}
          {step === 2 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label required>Dropoff parish</Label>
                  <Select
                    value={form.dropoffParish ?? ""}
                    onChange={(e) => update("dropoffParish", e.target.value as (typeof jamaicaParishes)[number])}
                  >
                    <option value="">Select parish...</option>
                    {jamaicaParishes.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </Select>
                  <FieldError message={errors.dropoffParish} />
                </div>
                <div>
                  <Label required>Dropoff area</Label>
                  <Input
                    placeholder="e.g. Constant Spring"
                    value={form.dropoffArea ?? ""}
                    onChange={(e) => update("dropoffArea", e.target.value)}
                  />
                  <FieldError message={errors.dropoffArea} />
                </div>
              </div>
              <div>
                <Label required>Dropoff address</Label>
                <Textarea
                  placeholder="Full address including street name and any landmark"
                  value={form.dropoffAddress ?? ""}
                  onChange={(e) => update("dropoffAddress", e.target.value)}
                />
                <FieldError message={errors.dropoffAddress} />
              </div>
              <div>
                <Label required>What are you sending?</Label>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {parcelCategories.map((cat) => (
                    <RadioCard
                      key={cat}
                      name="parcelCategory"
                      value={cat}
                      label={parcelCategoryLabels[cat]}
                      checked={form.parcelCategory === cat}
                      onChange={(v) => update("parcelCategory", v as (typeof parcelCategories)[number])}
                    />
                  ))}
                </div>
                <FieldError message={errors.parcelCategory} />
              </div>
              <div>
                <Label>Any special notes about the parcel?</Label>
                <Textarea
                  placeholder="e.g. Keep upright, fragile glass inside, call recipient before arriving"
                  value={form.parcelNotes ?? ""}
                  onChange={(e) => update("parcelNotes", e.target.value)}
                />
              </div>
              <div>
                <Label required>How urgently do you need this delivered?</Label>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {urgencyOptions.map((u) => (
                    <RadioCard
                      key={u}
                      name="urgency"
                      value={u}
                      label={urgencyLabels[u]}
                      checked={form.urgency === u}
                      onChange={(v) => update("urgency", v as (typeof urgencyOptions)[number])}
                    />
                  ))}
                </div>
                <FieldError message={errors.urgency} />
              </div>
              {form.urgency === "scheduled" && (
                <div>
                  <Label>Preferred time window</Label>
                  <Input
                    placeholder="e.g. Wednesday between 10am – 12pm"
                    value={form.preferredWindow ?? ""}
                    onChange={(e) => update("preferredWindow", e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          {/* ─── Step 4: Preferences & consent ───────────── */}
          {step === 3 && (
            <>
              <div>
                <Label required>How would you prefer to pay?</Label>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {paymentPreferenceOptions.map((p) => (
                    <RadioCard
                      key={p}
                      name="paymentPreference"
                      value={p}
                      label={paymentLabels[p]}
                      checked={form.paymentPreference === p}
                      onChange={(v) => update("paymentPreference", v as (typeof paymentPreferenceOptions)[number])}
                    />
                  ))}
                </div>
                <FieldError message={errors.paymentPreference} />
                <p className="mt-2 text-xs text-slate-500">
                  Cash on delivery is not supported for residential dispatching. For safety and accountability, only
                  wallet, card, gift card, and in-person scan-to-pay are accepted.
                </p>
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Consent & agreements</p>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950/10"
                    checked={form.privacyAccepted === true}
                    onChange={(e) => update("privacyAccepted", e.target.checked ? true : undefined)}
                  />
                  <span className="text-sm text-slate-700">
                    I have read and accept the{" "}
                    <a href="/privacy" target="_blank" className="underline hover:text-slate-950">
                      SLYDE Privacy Notice
                    </a>
                    . I understand my information will be used to process this delivery request.
                  </span>
                </label>
                <FieldError message={errors.privacyAccepted} />

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950/10"
                    checked={form.termsAccepted === true}
                    onChange={(e) => update("termsAccepted", e.target.checked ? true : undefined)}
                  />
                  <span className="text-sm text-slate-700">
                    I agree to the{" "}
                    <a href="/terms" target="_blank" className="underline hover:text-slate-950">
                      SLYDE Terms of Use
                    </a>{" "}
                    and understand that this is a dispatch request, not a confirmed booking.
                  </span>
                </label>
                <FieldError message={errors.termsAccepted} />
              </div>

              <hr className="border-slate-100" />
              <TurnstileWidget onToken={setTurnstileToken} />
              {errors._form && <FieldError message={errors._form} />}
            </>
          )}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          {step > 0 ? (
            <Button variant="secondary" onClick={handleBack} disabled={submitting} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button onClick={handleNext} className="gap-2">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Submit request
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {serverError}
        </div>
      )}
    </div>
  );
}
