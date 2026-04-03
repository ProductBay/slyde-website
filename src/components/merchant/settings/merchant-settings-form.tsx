"use client";

import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import type {
  MerchantApplication,
  MerchantDispatchMode,
  MerchantIntegrationProfile,
  MerchantLead,
  MerchantNotificationPreference,
} from "@/types/backend/onboarding";

const dispatchModeOptions: Array<{ value: MerchantDispatchMode; label: string; description: string }> = [
  {
    value: "manual_dashboard",
    label: "Manual dashboard",
    description: "Your team creates and manages delivery requests from the merchant dashboard.",
  },
  {
    value: "whatsapp_assisted",
    label: "WhatsApp assisted",
    description: "You mainly dispatch through WhatsApp and want SLYDE to support that workflow.",
  },
  {
    value: "api_later",
    label: "API later",
    description: "You expect to grow into system integrations later, but still want a working dashboard now.",
  },
];

const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const orderChannelOptions = ["Instagram", "WhatsApp", "Website", "Phone", "Walk-in", "Marketplace"];
const orderVolumeOptions = ["1-10", "11-25", "26-50", "51-100", "100+"];
const deliveryMethodOptions = ["In-house rider", "Owner delivery", "Taxi / ad hoc courier", "No current delivery setup"];
const startTimelineOptions = ["Immediately", "Within 1 week", "Within 2 weeks", "This month", "Planning ahead"];
const packageTypeOptions = [
  "Documents",
  "Small parcels",
  "Food containers",
  "Drink cups",
  "Retail bags",
  "Fragile items",
  "Prescription bags",
  "Bulk packages",
];
const serviceAreaHints = ["Kingston 5", "Half-Way Tree", "Portmore", "Mandeville", "Montego Bay", "May Pen"];
const pickupLocationHints = [
  "Main shop - 12 Hope Road, Kingston 10",
  "Warehouse - 4 Marcus Garvey Drive, Kingston",
  "Branch counter - Portmore Town Centre",
];
const deliveryRadiusOptions = ["Up to 3 km", "Up to 5 km", "Up to 10 km", "10+ km", "Varies by order"];
const categoryOptions = ["Restaurant", "Grocery", "Pharmacy", "Retail", "Fashion", "Electronics", "Services", "Other"];
const timeOptions = [
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const LOGO_MAX_DIMENSION = 512;
const HERO_MAX_WIDTH = 1600;
const HERO_MAX_HEIGHT = 640;
const HERO_POSITION_OPTIONS = [
  { value: "left", label: "Focus left", description: "Keep the left side of the banner more visible." },
  { value: "center", label: "Focus center", description: "Best when the main subject is near the middle." },
  { value: "right", label: "Focus right", description: "Keep the right side of the banner more visible." },
] as const;

type MerchantSettingsInitial = {
  lead: MerchantLead | null;
  application: MerchantApplication;
  integrationProfile: MerchantIntegrationProfile | null;
  preference: MerchantNotificationPreference;
  compliance: {
    businessLicenseStatus: string;
    businessLicenseGraceEndsAt?: string;
    businessLicenseRequiredAfterDeliveries: number;
    completedDeliveries: number;
    deliveriesRemaining: number;
    daysRemaining: number;
    isComplianceRestricted: boolean;
  };
};

function normalizeStringList(value: string | string[] | undefined) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function joinHoursSummary(days: string[], openTime?: string, closeTime?: string) {
  const base = [openTime, closeTime].filter(Boolean).join(" - ");
  return days.length ? `${days.join(", ")}${base ? ` | ${base}` : ""}` : base || undefined;
}

async function readImageFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image preview."));
    image.src = src;
  });
}

function canvasToDataUrl(canvas: HTMLCanvasElement, fileType: string) {
  const normalizedType = /png|webp|jpeg|jpg/i.test(fileType) ? fileType : "image/jpeg";
  const quality = normalizedType === "image/png" ? undefined : 0.86;
  return canvas.toDataURL(normalizedType, quality);
}

async function optimizeImageFile(file: File, target: "logo" | "hero") {
  const source = await readImageFileAsDataUrl(file);
  const image = await loadImageElement(source);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return {
      dataUrl: source,
      dimensions: { width: image.width, height: image.height },
      optimized: false,
    };
  }

  const maxWidth = target === "logo" ? LOGO_MAX_DIMENSION : HERO_MAX_WIDTH;
  const maxHeight = target === "logo" ? LOGO_MAX_DIMENSION : HERO_MAX_HEIGHT;
  const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  return {
    dataUrl: canvasToDataUrl(canvas, file.type),
    dimensions: { width, height },
    optimized: scale < 1,
  };
}

function MediaPreview({
  src,
  alt,
  aspect = "wide",
  position = "center",
}: {
  src?: string;
  alt: string;
  aspect?: "wide" | "square";
  position?: "left" | "center" | "right";
}) {
  const aspectClass = aspect === "square" ? "aspect-square max-w-[11rem]" : "aspect-[3.4/1]";

  return (
    <div className={`overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-100 ${aspectClass}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          style={{
            objectPosition: position === "left" ? "left center" : position === "right" ? "right center" : "center center",
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          Preview
        </div>
      )}
    </div>
  );
}

function WorkspaceBrandPreview({
  businessName,
  contactName,
  logoUrl,
  heroBannerUrl,
  heroBannerPosition,
  hasUnsavedBrandingChanges,
}: {
  businessName: string;
  contactName: string;
  logoUrl?: string;
  heroBannerUrl?: string;
  heroBannerPosition: "left" | "center" | "right";
  hasUnsavedBrandingChanges?: boolean;
}) {
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const isMobile = previewMode === "mobile";

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Live workspace preview</p>
          <p className="mt-1 text-sm text-slate-600">A compact view of how your header branding will feel across the merchant workspace.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasUnsavedBrandingChanges ? (
            <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
              Unsaved branding changes
            </div>
          ) : (
            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Branding saved
            </div>
          )}
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
            {(["desktop", "mobile"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPreviewMode(mode)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                  previewMode === mode ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div
        className="border-b border-slate-200 px-4 py-5"
        style={
          heroBannerUrl
            ? {
                backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.76), rgba(15,23,42,0.44)), url(${heroBannerUrl})`,
                backgroundSize: "cover",
                backgroundPosition:
                  heroBannerPosition === "left"
                    ? "left center"
                    : heroBannerPosition === "right"
                      ? "right center"
                      : "center center",
              }
            : {
                backgroundImage:
                  "radial-gradient(circle at top left, rgba(14,165,233,0.16), transparent 30%), linear-gradient(135deg, #eff6ff 0%, #ffffff 55%, #f8fafc 100%)",
              }
        }
      >
        <div className={`mx-auto transition-all ${isMobile ? "max-w-[24rem]" : "max-w-none"}`}>
          <div className={`flex gap-4 ${isMobile ? "flex-col" : "flex-col md:flex-row md:items-center md:justify-between"}`}>
            <div className="flex items-start gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[1.1rem] border border-white/40 bg-white/85 shadow-lg shadow-slate-900/10">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={`${businessName} logo preview`} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold text-slate-900">{businessName.slice(0, 1).toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${heroBannerUrl ? "text-cyan-100" : "text-slate-500"}`}>Merchant control center</p>
                <h3 className={`mt-2 ${isMobile ? "text-lg" : "text-xl"} font-semibold tracking-tight ${heroBannerUrl ? "text-white" : "text-slate-950"}`}>{businessName}</h3>
                <p className={`mt-1 ${isMobile ? "max-w-[16rem]" : ""} text-sm ${heroBannerUrl ? "text-slate-100" : "text-slate-600"}`}>Delivery operations, dispatch visibility, and support in one workspace.</p>
              </div>
            </div>
            <div className={`rounded-3xl px-4 py-3 text-sm ${heroBannerUrl ? "border border-white/20 bg-white/15 text-white backdrop-blur" : "border border-slate-200 bg-white text-slate-600"} ${isMobile ? "w-full" : ""}`}>
              <p className={`font-semibold ${heroBannerUrl ? "text-white" : "text-slate-900"}`}>{contactName}</p>
              <p className="mt-1">Merchant workspace access</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-3 bg-slate-50 px-4 py-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Header crop</p>
          <p className="mt-2 text-sm font-semibold capitalize text-slate-950">{heroBannerPosition}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Preview mode</p>
          <p className="mt-2 text-sm font-semibold capitalize text-slate-950">{previewMode}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Logo state</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">{logoUrl ? "Custom logo ready" : "Initial fallback in use"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 md:col-span-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Banner state</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">{heroBannerUrl ? "Custom banner ready" : "Default branded header"}</p>
        </div>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  description,
  children,
  badge,
  tone = "default",
}: {
  id?: string;
  title: string;
  description: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
  tone?: "default" | "sky" | "emerald" | "amber" | "slate";
}) {
  const toneClasses =
    tone === "sky"
      ? "border-sky-200 bg-[linear-gradient(180deg,rgba(240,249,255,0.9),rgba(255,255,255,1))]"
      : tone === "emerald"
        ? "border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.9),rgba(255,255,255,1))]"
        : tone === "amber"
          ? "border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.92),rgba(255,255,255,1))]"
          : tone === "slate"
            ? "border-slate-300 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,1))]"
            : "border-slate-200 bg-white";
  return (
    <section id={id} className={`scroll-mt-28 rounded-[1.75rem] border p-6 shadow-soft ${toneClasses}`}>
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {badge}
      </div>
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-slate-700">{children}</p>
      {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function MerchantSettingsForm({ initial }: { initial: MerchantSettingsInitial }) {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: initial.lead?.businessName ?? "",
    contactName: initial.lead?.contactName ?? "",
    email: initial.lead?.email ?? "",
    phone: initial.lead?.phone ?? "",
    parish: initial.lead?.parish ?? "",
    town: initial.lead?.town ?? "",
    category: initial.lead?.category ?? initial.application.category ?? "",
    instagramHandle: initial.lead?.instagramHandle ?? "",
    website: initial.lead?.website ?? "",
    orderChannels: initial.lead?.orderChannels ?? [],
    averageDailyOrders: initial.lead?.averageDailyOrders ?? "",
    currentDeliveryMethod: initial.lead?.currentDeliveryMethod ?? "",
    preferredStartTimeline: initial.lead?.preferredStartTimeline ?? "",
    storeName: initial.application.storeName ?? "",
    logoUrl: initial.application.logoUrl ?? "",
    heroBannerUrl: initial.application.heroBannerUrl ?? "",
    heroBannerPosition: initial.application.heroBannerPosition ?? "center",
    businessDescription: initial.application.businessDescription ?? "",
    pickupAddress: initial.application.pickupAddress ?? "",
    serviceAreas: initial.application.serviceAreas ?? [],
    fulfillmentMode: initial.application.fulfillmentMode ?? "",
    operatingDays: Array.isArray(initial.application.operatingHours?.days) ? (initial.application.operatingHours?.days as string[]) : [],
    openTime:
      typeof initial.application.operatingHours?.openTime === "string" ? initial.application.operatingHours.openTime : "",
    closeTime:
      typeof initial.application.operatingHours?.closeTime === "string" ? initial.application.operatingHours.closeTime : "",
    businessLicenseNumber: initial.application.businessLicenseNumber ?? "",
    dispatchMode: initial.integrationProfile?.dispatchMode ?? "manual_dashboard",
    acceptsCOD: initial.integrationProfile?.acceptsCOD ?? false,
    averageBasketSize: initial.integrationProfile?.averageBasketSize ?? "",
    packageTypes: initial.integrationProfile?.packageTypes ?? [],
    orderSources: initial.integrationProfile?.orderSources ?? [],
    pickupLocations: initial.integrationProfile?.pickupLocations ?? [],
    deliveryRadius: initial.integrationProfile?.deliveryRadius ?? "",
    sameDaySupported: initial.integrationProfile?.sameDaySupported ?? false,
    scheduledSupported: initial.integrationProfile?.scheduledSupported ?? false,
    defaultDeliveryInstruction:
      typeof initial.application.payoutDetails?.defaultDeliveryInstruction === "string"
        ? initial.application.payoutDetails.defaultDeliveryInstruction
        : "",
    emailEnabled: initial.preference.emailEnabled,
    smsEnabled: initial.preference.smsEnabled,
    whatsappEnabled: initial.preference.whatsappEnabled,
    notifyOnAssigned: initial.preference.notifyOnAssigned,
    notifyOnDelivered: initial.preference.notifyOnDelivered,
    notifyOnFailed: initial.preference.notifyOnFailed,
    notifyOnBilling: initial.preference.notifyOnBilling,
  });
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [mediaMessage, setMediaMessage] = useState<string | null>(null);

  const onboardingReadiness = useMemo(() => {
    const checks = [
      Boolean(form.businessName.trim()),
      Boolean(form.contactName.trim()),
      Boolean(form.email.trim()),
      Boolean(form.phone.trim()),
      Boolean(form.pickupAddress.trim()),
      Boolean(form.operatingDays.length && form.openTime && form.closeTime),
      Boolean(form.serviceAreas.length),
      Boolean(form.category.trim()),
      Boolean(form.packageTypes.length || initial.application.onboardingTrack !== "slyde_delivery"),
      Boolean(form.pickupLocations.length || initial.application.onboardingTrack !== "slyde_delivery"),
    ];
    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }, [form, initial.application.onboardingTrack]);

  const hasUnsavedBrandingChanges = useMemo(() => {
    const initialBusinessName = initial.lead?.businessName ?? "";
    const initialStoreName = initial.application.storeName ?? "";
    const initialLogoUrl = initial.application.logoUrl ?? "";
    const initialHeroBannerUrl = initial.application.heroBannerUrl ?? "";
    const initialHeroBannerPosition = initial.application.heroBannerPosition ?? "center";

    return (
      form.businessName !== initialBusinessName ||
      form.storeName !== initialStoreName ||
      form.logoUrl !== initialLogoUrl ||
      form.heroBannerUrl !== initialHeroBannerUrl ||
      form.heroBannerPosition !== initialHeroBannerPosition
    );
  }, [
    form.businessName,
    form.storeName,
    form.logoUrl,
    form.heroBannerUrl,
    form.heroBannerPosition,
    initial.lead?.businessName,
    initial.application.storeName,
    initial.application.logoUrl,
    initial.application.heroBannerUrl,
    initial.application.heroBannerPosition,
  ]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleImageUpload(key: "logoUrl" | "heroBannerUrl", event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setMediaMessage(null);
    if (!file.type.startsWith("image/")) {
      setMediaMessage("Please choose an image file for branding.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setMediaMessage("Please choose an image under 5 MB so the workspace stays fast and reliable.");
      event.target.value = "";
      return;
    }

    try {
      const optimized = await optimizeImageFile(file, key === "logoUrl" ? "logo" : "hero");
      update(key, optimized.dataUrl);
      setMediaMessage(
        `${key === "logoUrl" ? "Logo" : "Hero banner"} ready to save at ${optimized.dimensions.width}x${optimized.dimensions.height}${optimized.optimized ? " after lightweight optimization." : "."}`,
      );
    } catch {
      setMediaMessage("Unable to load that image file right now.");
    } finally {
      event.target.value = "";
    }
  }

  function submit() {
    setPending(true);
    setMessage(null);
    startTransition(async () => {
      const payload = {
        businessName: form.businessName.trim(),
        contactName: form.contactName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        parish: form.parish.trim(),
        town: form.town.trim(),
        category: form.category.trim(),
        instagramHandle: form.instagramHandle.trim(),
        website: form.website.trim(),
        orderChannels: form.orderChannels,
        averageDailyOrders: form.averageDailyOrders.trim(),
        currentDeliveryMethod: form.currentDeliveryMethod.trim(),
        preferredStartTimeline: form.preferredStartTimeline.trim(),
        storeName: form.storeName.trim(),
        logoUrl: form.logoUrl.trim(),
        heroBannerUrl: form.heroBannerUrl.trim(),
        heroBannerPosition: form.heroBannerPosition,
        businessDescription: form.businessDescription.trim(),
        pickupAddress: form.pickupAddress.trim(),
        serviceAreas: form.serviceAreas,
        fulfillmentMode: form.fulfillmentMode.trim(),
        operatingHours: {
          days: form.operatingDays,
          openTime: form.openTime,
          closeTime: form.closeTime,
          summary: joinHoursSummary(form.operatingDays, form.openTime, form.closeTime),
        },
        businessLicenseNumber: form.businessLicenseNumber.trim(),
        dispatchMode: form.dispatchMode,
        acceptsCOD: form.acceptsCOD,
        averageBasketSize: form.averageBasketSize.trim(),
        packageTypes: form.packageTypes,
        orderSources: form.orderSources,
        pickupLocations: form.pickupLocations,
        deliveryRadius: form.deliveryRadius.trim(),
        sameDaySupported: form.sameDaySupported,
        scheduledSupported: form.scheduledSupported,
        defaultDeliveryInstruction: form.defaultDeliveryInstruction.trim(),
        emailEnabled: form.emailEnabled,
        smsEnabled: form.smsEnabled,
        whatsappEnabled: form.whatsappEnabled,
        notifyOnAssigned: form.notifyOnAssigned,
        notifyOnDelivered: form.notifyOnDelivered,
        notifyOnFailed: form.notifyOnFailed,
        notifyOnBilling: form.notifyOnBilling,
      };

      const response = await fetch("/api/merchant/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);

      setPending(false);
      if (response.ok) {
        setMessage(typeof result?.message === "string" ? result.message : "Workspace settings updated successfully.");
        router.refresh();
      } else {
        setMessage(typeof result?.error === "string" ? result.error : "Unable to update settings right now.");
      }
    });
  }

  const reviewChips = [
    { label: "Track", value: initial.application.onboardingTrack.replaceAll("_", " ") },
    { label: "Approval", value: initial.application.approvalStatus.replaceAll("_", " ") },
    { label: "Activation", value: initial.application.activationStatus.replaceAll("_", " ") },
    { label: "Documents", value: initial.application.documentStatus.replaceAll("_", " ") },
    { label: "Legal", value: initial.application.legalStatus.replaceAll("_", " ") },
    { label: "Business license", value: initial.compliance.businessLicenseStatus.replaceAll("_", " ") },
  ];

  const sectionNav = [
    {
      id: "settings-overview",
      label: "Overview",
      tone: "slate",
      summary: "Access map and readiness snapshot",
    },
    {
      id: "business-profile",
      label: "Business",
      tone: "sky",
      summary: "Identity, contact, and registration details",
    },
    {
      id: "ops-setup",
      label: "Operations",
      tone: "emerald",
      summary: "Pickup flow, hours, service footprint",
    },
    {
      id: "compliance-review",
      label: "Compliance",
      tone: "amber",
      summary: "Admin-locked review and license posture",
    },
    {
      id: "notify-defaults",
      label: "Notifications",
      tone: "slate",
      summary: "Alerts and recurring delivery instructions",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <section
        id="settings-overview"
        className="surface-panel overflow-hidden border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] p-6"
      >
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">Merchant settings workspace</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Manage your operating profile with clarity</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                Use this workspace to keep business, dispatch, and compliance details aligned with how your team actually runs. Sensitive approval and verification controls stay protected with SLYDE.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Onboarding readiness</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-950">{onboardingReadiness}%</p>
                <p className="mt-1 text-xs leading-5 text-emerald-800">General profile and ops setup completion</p>
              </div>
              <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Workspace track</p>
                <p className="mt-2 text-lg font-semibold capitalize text-sky-950">{initial.application.onboardingTrack.replaceAll("_", " ")}</p>
                <p className="mt-1 text-xs leading-5 text-sky-800">Current merchant onboarding path</p>
              </div>
              <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Compliance status</p>
                <p className="mt-2 text-lg font-semibold capitalize text-amber-950">{initial.compliance.businessLicenseStatus.replaceAll("_", " ")}</p>
                <p className="mt-1 text-xs leading-5 text-amber-800">Business license and admin review posture</p>
              </div>
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Quick navigation</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">Jump to the right section fast</h3>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                Enterprise view
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {sectionNav.map((item) => {
                const toneCard =
                  item.tone === "sky"
                    ? "border-sky-200 bg-sky-50"
                    : item.tone === "emerald"
                      ? "border-emerald-200 bg-emerald-50"
                      : item.tone === "amber"
                        ? "border-amber-200 bg-amber-50"
                        : "border-slate-200 bg-slate-50";
                return (
                  <a key={item.id} href={`#${item.id}`} className={`rounded-[1.35rem] border px-4 py-4 transition hover:-translate-y-0.5 ${toneCard}`}>
                    <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{item.summary}</p>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Section
        id="merchant-workspace"
        title="Merchant onboarding workspace"
        description="Complete the operational details SLYDE needs to support your account well. You can update general business and delivery settings here, while validation and approval fields remain controlled by SLYDE admins."
        badge={
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            Onboarding readiness {onboardingReadiness}%
          </div>
        }
        tone="slate"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">What you can update here</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Business profile details, operating hours, pickup and service setup, and delivery preferences can be updated here to help your team finish onboarding and keep dispatch accurate.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Admin-controlled items</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Approval, activation, legal review, document review, and business-license verification are locked so SLYDE can validate them before the account goes fully live.
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="business-profile"
        title="Business profile"
        description="Keep your core business details current so support, activation, and account review all point to the right merchant information."
        tone="sky"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="field-shell">
            <FieldLabel hint="Use the registered or storefront-facing business name merchants and customers know.">Business name</FieldLabel>
            <input className="field-input" value={form.businessName} onChange={(event) => update("businessName", event.target.value)} />
          </div>
          <div className="field-shell">
            <FieldLabel hint="This should be the primary contact SLYDE should call about onboarding or operations.">Primary contact</FieldLabel>
            <input className="field-input" value={form.contactName} onChange={(event) => update("contactName", event.target.value)} />
          </div>
          <div className="field-shell">
            <FieldLabel>Email</FieldLabel>
            <input className="field-input" value={form.email} onChange={(event) => update("email", event.target.value)} />
          </div>
          <div className="field-shell">
            <FieldLabel>Phone</FieldLabel>
            <input className="field-input" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
          </div>
          <div className="field-shell">
            <FieldLabel>Parish</FieldLabel>
            <input className="field-input" value={form.parish} onChange={(event) => update("parish", event.target.value)} />
          </div>
          <div className="field-shell">
            <FieldLabel>Town</FieldLabel>
            <input className="field-input" value={form.town} onChange={(event) => update("town", event.target.value)} />
          </div>
          <div className="field-shell">
            <FieldLabel>Business category</FieldLabel>
            <select className="field-input" value={form.category} onChange={(event) => update("category", event.target.value)}>
              <option value="">Select a category</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="field-shell">
            <FieldLabel hint="Optional, but helpful for onboarding validation and future marketplace setup.">Website</FieldLabel>
            <input className="field-input" value={form.website} onChange={(event) => update("website", event.target.value)} placeholder="https://yourbusiness.com" />
          </div>
          <div className="field-shell md:col-span-2">
            <FieldLabel hint="Optional. Include the handle customers usually use to order or discover the business.">Instagram handle</FieldLabel>
            <input className="field-input" value={form.instagramHandle} onChange={(event) => update("instagramHandle", event.target.value)} placeholder="@yourbusiness" />
          </div>
        </div>
      </Section>

      <Section
        id="registration-details"
        title="Initial registration details"
        description="These are the merchant details originally collected during onboarding. You can still update the general business information here if your setup has changed."
        tone="sky"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="field-shell">
            <FieldLabel>Order channels</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {orderChannelOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => update("orderChannels", toggleValue(form.orderChannels, option))}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    form.orderChannels.includes(option)
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="field-shell">
            <FieldLabel>Average daily orders</FieldLabel>
            <select className="field-input" value={form.averageDailyOrders} onChange={(event) => update("averageDailyOrders", event.target.value)}>
              <option value="">Select order volume</option>
              {orderVolumeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="field-shell">
            <FieldLabel>Current delivery method</FieldLabel>
            <select className="field-input" value={form.currentDeliveryMethod} onChange={(event) => update("currentDeliveryMethod", event.target.value)}>
              <option value="">Select current delivery setup</option>
              {deliveryMethodOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="field-shell">
            <FieldLabel>Preferred start timeline</FieldLabel>
            <select className="field-input" value={form.preferredStartTimeline} onChange={(event) => update("preferredStartTimeline", event.target.value)}>
              <option value="">Select preferred timeline</option>
              {startTimelineOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section
        id="ops-setup"
        title="Operations and dispatch setup"
        description="These settings shape how the merchant workspace behaves day to day and help the ops team route dispatch support correctly."
        tone="emerald"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="field-shell">
            <FieldLabel hint="Store name can match your storefront or branch-facing brand if it differs from the legal business name.">Storefront name</FieldLabel>
            <input className="field-input" value={form.storeName} onChange={(event) => update("storeName", event.target.value)} />
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 md:col-span-2">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Merchant branding</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Add a logo and a compact workspace hero banner so your merchant dashboard feels polished and recognizable for your team.
                </p>
              </div>
              <div className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                Enterprise branding
              </div>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4 rounded-[1.35rem] border border-slate-200 bg-white p-4">
                <FieldLabel hint="Upload your storefront or business logo. This shows in the merchant workspace shell and brand area.">
                  Logo image
                </FieldLabel>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-600">
                  Best results: square logo, at least 512x512, under 5 MB. Large files are gently resized for faster workspace loading.
                </div>
                <MediaPreview src={form.logoUrl} alt="Merchant logo preview" aspect="square" />
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
                    Upload logo
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleImageUpload("logoUrl", event)} />
                  </label>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
                    onClick={() => update("logoUrl", "")}
                  >
                    Clear logo
                  </button>
                </div>
                <div className="field-shell">
                  <FieldLabel hint="You can also paste a direct image URL if your logo is already hosted online.">Logo image source</FieldLabel>
                  <input className="field-input" value={form.logoUrl} onChange={(event) => update("logoUrl", event.target.value)} placeholder="https://... or uploaded image preview" />
                </div>
              </div>
              <div className="space-y-4 rounded-[1.35rem] border border-slate-200 bg-white p-4">
                <FieldLabel hint="Upload a wide banner image for the top section of all merchant workspace pages. Keep it clean and brand-led.">
                  Workspace hero banner
                </FieldLabel>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-600">
                  Best results: wide banner around 1600x640, under 5 MB, with important text or logos kept near the center so the crop stays clean across screens.
                </div>
                <MediaPreview src={form.heroBannerUrl} alt="Merchant hero banner preview" position={form.heroBannerPosition} />
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Banner focal area</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {HERO_POSITION_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => update("heroBannerPosition", option.value)}
                        className={`rounded-2xl border px-3 py-3 text-left transition ${
                          form.heroBannerPosition === option.value
                            ? "border-sky-600 bg-sky-600 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <p className="text-sm font-semibold">{option.label}</p>
                        <p className={`mt-1 text-xs leading-5 ${form.heroBannerPosition === option.value ? "text-sky-100" : "text-slate-500"}`}>
                          {option.description}
                        </p>
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-6 text-slate-500">
                    Choose where the banner should stay anchored when the workspace crops it across desktop and mobile screens.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
                    Upload banner
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleImageUpload("heroBannerUrl", event)} />
                  </label>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
                    onClick={() => update("heroBannerUrl", "")}
                  >
                    Clear banner
                  </button>
                </div>
                <div className="field-shell">
                  <FieldLabel hint="You can also paste a direct hosted image URL if your hero image already lives on your website or CDN.">Banner image source</FieldLabel>
                  <input className="field-input" value={form.heroBannerUrl} onChange={(event) => update("heroBannerUrl", event.target.value)} placeholder="https://... or uploaded image preview" />
                </div>
              </div>
            </div>
            {mediaMessage ? (
              <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">{mediaMessage}</div>
            ) : null}
            <div className="mt-5">
              <WorkspaceBrandPreview
                businessName={form.storeName.trim() || form.businessName.trim() || "Merchant workspace"}
                contactName={form.contactName.trim() || "Primary merchant contact"}
                logoUrl={form.logoUrl}
                heroBannerUrl={form.heroBannerUrl}
                heroBannerPosition={form.heroBannerPosition}
                hasUnsavedBrandingChanges={hasUnsavedBrandingChanges}
              />
            </div>
          </div>
          <div className="field-shell md:col-span-2">
            <FieldLabel hint="Use a concise description of what you sell and how orders usually come in.">Business description</FieldLabel>
            <textarea
              className="field-input min-h-32 resize-y"
              value={form.businessDescription}
              onChange={(event) => update("businessDescription", event.target.value)}
              placeholder="Example: Fast-casual lunch kitchen serving office districts with peak order times from 11 AM to 2 PM."
            />
          </div>
          <div className="field-shell md:col-span-2">
            <FieldLabel hint="This should be the main pickup point SLYDE should treat as the operational dispatch address.">Primary pickup address</FieldLabel>
            <textarea className="field-input min-h-24 resize-y" value={form.pickupAddress} onChange={(event) => update("pickupAddress", event.target.value)} />
          </div>
          <div className="field-shell">
            <FieldLabel>Dispatch mode</FieldLabel>
            <div className="grid gap-3">
              {dispatchModeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update("dispatchMode", option.value)}
                  className={`rounded-3xl border px-4 py-4 text-left transition ${
                    form.dispatchMode === option.value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p className={`mt-1 text-xs leading-5 ${form.dispatchMode === option.value ? "text-slate-200" : "text-slate-500"}`}>
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div className="field-shell">
            <FieldLabel>Fulfillment mode</FieldLabel>
            <input className="field-input" value={form.fulfillmentMode} onChange={(event) => update("fulfillmentMode", event.target.value)} placeholder="Example: merchant prep + SLYDE pickup" />
          </div>
          <div className="field-shell">
            <FieldLabel>Delivery radius</FieldLabel>
            <select className="field-input" value={form.deliveryRadius} onChange={(event) => update("deliveryRadius", event.target.value)}>
              <option value="">Select coverage radius</option>
              {deliveryRadiusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="field-shell">
            <FieldLabel>Average basket size</FieldLabel>
            <input className="field-input" value={form.averageBasketSize} onChange={(event) => update("averageBasketSize", event.target.value)} placeholder="Example: JMD 2,500 - 4,000" />
          </div>
        </div>
      </Section>

      <Section
        id="hours-footprint"
        title="Operating hours and service footprint"
        description="Update the operating pattern SLYDE should work from when planning activation, pickups, support coverage, and readiness."
        tone="emerald"
      >
        <div className="space-y-6">
          <div className="field-shell">
            <FieldLabel hint="Select the days your operation is normally open for dispatch or collection.">Operating days</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {dayOptions.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => update("operatingDays", toggleValue(form.operatingDays, day))}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    form.operatingDays.includes(day)
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="field-shell">
              <FieldLabel>Open time</FieldLabel>
              <select className="field-input" value={form.openTime} onChange={(event) => update("openTime", event.target.value)}>
                <option value="">Select opening time</option>
                {timeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-shell">
              <FieldLabel>Close time</FieldLabel>
              <select className="field-input" value={form.closeTime} onChange={(event) => update("closeTime", event.target.value)}>
                <option value="">Select closing time</option>
                {timeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="field-shell">
              <FieldLabel hint="Enter one area per line so SLYDE knows where the merchant currently expects service.">Service areas</FieldLabel>
              <textarea
                className="field-input min-h-32 resize-y"
                value={form.serviceAreas.join("\n")}
                onChange={(event) => update("serviceAreas", normalizeStringList(event.target.value))}
                placeholder={serviceAreaHints.join("\n")}
              />
            </div>
            <div className="field-shell">
              <FieldLabel hint="List each pickup point or branch line by line if your team prepares from more than one location.">Pickup locations</FieldLabel>
              <textarea
                className="field-input min-h-32 resize-y"
                value={form.pickupLocations.join("\n")}
                onChange={(event) => update("pickupLocations", normalizeStringList(event.target.value))}
                placeholder={pickupLocationHints.join("\n")}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="delivery-profile"
        title="Delivery profile"
        description="Keep your package mix, order sources, and merchant delivery capabilities aligned with how your team actually fulfills orders."
        tone="emerald"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="field-shell">
              <FieldLabel>Package types</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {packageTypeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => update("packageTypes", toggleValue(form.packageTypes, option))}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      form.packageTypes.includes(option)
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="field-shell">
              <FieldLabel hint="List the channels that actually feed your day-to-day dispatch requests.">Order sources</FieldLabel>
              <textarea
                className="field-input min-h-28 resize-y"
                value={form.orderSources.join("\n")}
                onChange={(event) => update("orderSources", normalizeStringList(event.target.value))}
                placeholder={"Instagram DM\nWhatsApp\nWebsite checkout"}
              />
            </div>
          </div>
          <div className="space-y-4">
            {[
              {
                key: "acceptsCOD",
                title: "Cash on delivery",
                text: "Allow SLYDE to treat COD as part of your current delivery flow.",
              },
              {
                key: "sameDaySupported",
                title: "Same-day orders",
                text: "Use this if your operation can normally prepare and release orders same day.",
              },
              {
                key: "scheduledSupported",
                title: "Scheduled deliveries",
                text: "Use this if your team accepts future-dated deliveries or timed drop-offs.",
              },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => update(item.key as keyof typeof form, !Boolean(form[item.key as keyof typeof form]) as never)}
                className={`w-full rounded-3xl border px-5 py-4 text-left transition ${
                  form[item.key as keyof typeof form]
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.text}</p>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      form[item.key as keyof typeof form] ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {form[item.key as keyof typeof form] ? "Enabled" : "Off"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section
        id="compliance-review"
        title="Compliance and admin review"
        description="These items are visible for transparency, but they stay locked because SLYDE uses them for review, validation, approval, and activation decisions."
        badge={
          initial.compliance.isComplianceRestricted ? (
            <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
              Restricted pending license submission
            </div>
          ) : null
        }
        tone="amber"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reviewChips.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-sm font-semibold capitalize text-slate-950">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Business license submission</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Merchants can submit their COJ business-license number here, but only SLYDE can verify it and clear the compliance requirement.
            </p>
            <input
              className="field-input mt-4"
              placeholder="COJ business license number"
              value={form.businessLicenseNumber}
              onChange={(event) => update("businessLicenseNumber", event.target.value)}
            />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Current compliance window</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Grace deadline</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {initial.compliance.businessLicenseGraceEndsAt
                    ? new Date(initial.compliance.businessLicenseGraceEndsAt).toLocaleDateString()
                    : "Pending"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Completed deliveries</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {initial.compliance.completedDeliveries} / {initial.compliance.businessLicenseRequiredAfterDeliveries}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Deliveries remaining</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">{initial.compliance.deliveriesRemaining}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Days remaining</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">{initial.compliance.daysRemaining}</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="notify-defaults"
        title="Notifications and delivery defaults"
        description="Choose how the merchant team wants to receive key updates and keep a default delivery instruction ready for the ops team."
        tone="slate"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="field-shell">
              <FieldLabel hint="This note is useful for access instructions, landmark details, or recurring fulfillment notes.">Default delivery instruction</FieldLabel>
              <textarea
                className="field-input min-h-28 resize-y"
                value={form.defaultDeliveryInstruction}
                onChange={(event) => update("defaultDeliveryInstruction", event.target.value)}
                placeholder="Example: Call before arrival. Pickup packages from the dispatch counter beside the rear entrance."
              />
            </div>
          </div>
          <div className="space-y-3">
            {[
              ["emailEnabled", "Email alerts"],
              ["smsEnabled", "SMS alerts"],
              ["whatsappEnabled", "WhatsApp alerts"],
              ["notifyOnAssigned", "Notify on assignment"],
              ["notifyOnDelivered", "Notify on delivered"],
              ["notifyOnFailed", "Notify on failed"],
              ["notifyOnBilling", "Notify on billing"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                <input
                  className="field-checkbox"
                  type="checkbox"
                  checked={Boolean(form[key as keyof typeof form])}
                  onChange={(event) => update(key as keyof typeof form, event.target.checked as never)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      </Section>
      <div className="sticky bottom-4 z-10 rounded-[1.5rem] border border-slate-200 bg-white/95 px-5 py-4 shadow-panel backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
            <p className="text-sm text-slate-500">
          Save updates here whenever operating details change so the merchant account stays accurate for support and dispatch.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              Ready {onboardingReadiness}%
            </div>
            <Button type="button" onClick={submit} disabled={pending}>
              {pending ? "Saving..." : "Save onboarding updates"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
