"use client";

import { CircleHelp, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type MerchantTrack = "grabquik" | "slyde_delivery";

const PARISH_TOWNS: Record<string, string[]> = {
  Kingston: ["Downtown Kingston", "Half Way Tree", "New Kingston", "Papine", "Cross Roads", "Other"],
  "St. Andrew": ["Barbican", "Constant Spring", "Liguanea", "Manor Park", "Red Hills", "Other"],
  "St. Catherine": ["Spanish Town", "Portmore", "Old Harbour", "Linstead", "Bog Walk", "Other"],
  Clarendon: ["May Pen", "Old Harbour Bay", "Chapelton", "Lionel Town", "Other"],
  Manchester: ["Mandeville", "Christiana", "Porus", "Other"],
  "St. Elizabeth": ["Santa Cruz", "Black River", "Lacovia", "Other"],
  Westmoreland: ["Savanna-la-Mar", "Negril", "Grange Hill", "Other"],
  Hanover: ["Lucea", "Sandy Bay", "Other"],
  "St. James": ["Montego Bay", "Anchovy", "Ironshore", "Other"],
  Trelawny: ["Falmouth", "Duncans", "Other"],
  "St. Ann": ["Ocho Rios", "St. Ann's Bay", "Runaway Bay", "Other"],
  "St. Mary": ["Port Maria", "Annotto Bay", "Oracabessa", "Other"],
  Portland: ["Port Antonio", "Buff Bay", "Other"],
  "St. Thomas": ["Morant Bay", "Yallahs", "Other"],
};

const BUSINESS_CATEGORIES = [
  "Restaurant",
  "Cafe",
  "Bakery",
  "Grocery",
  "Pharmacy",
  "Retail store",
  "Beauty and personal care",
  "Electronics",
  "Home goods",
  "Fashion",
  "Wholesale",
  "Other",
];

const AVERAGE_DAILY_ORDER_OPTIONS = ["1-10 orders", "11-25 orders", "26-50 orders", "51-100 orders", "100+ orders"];
const CURRENT_DELIVERY_METHOD_OPTIONS = ["In-house driver", "Owner handles deliveries", "Taxi or route partner", "Courier on demand", "No delivery setup yet"];
const START_TIMELINE_OPTIONS = ["Immediately", "Within 7 days", "Within 2 weeks", "Within 30 days", "Just exploring"];
const ORDER_CHANNEL_OPTIONS = ["instagram", "whatsapp", "website", "marketplace", "phone"];
const ORDER_SOURCE_OPTIONS = ["instagram", "whatsapp", "website", "phone", "walk_in"];
const GRABQUIK_FULFILLMENT_OPTIONS = [
  { value: "merchant_managed", label: "Merchant managed" },
  { value: "slyde_fulfilled", label: "SLYDE fulfilled" },
  { value: "hybrid", label: "Hybrid" },
];
const SLYDE_FULFILLMENT_OPTIONS = [
  { value: "dispatch_only", label: "Dispatch only" },
  { value: "pickup_and_delivery", label: "Pickup and delivery" },
  { value: "same_day_focused", label: "Same-day focused" },
  { value: "mixed_flow", label: "Mixed flow" },
];
const DELIVERY_RADIUS_OPTIONS = ["Within town only", "Within parish", "Up to 10 km", "Up to 20 km", "Islandwide by request"];
const AVERAGE_ORDER_SIZE_OPTIONS = ["Small parcels", "Food boxes", "Mixed retail bags", "Bulk mixed orders", "Larger commercial packages"];
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM"];

const PACKAGE_TYPES_BY_CATEGORY: Record<string, string[]> = {
  Restaurant: ["Hot meals", "Cold meals", "Drink cups", "Family trays", "Catering pans"],
  Cafe: ["Coffee cups", "Pastry boxes", "Breakfast bags", "Drink carriers", "Snack packs"],
  Bakery: ["Bread bags", "Cake boxes", "Pastry trays", "Dessert packs", "Catering dessert trays"],
  Grocery: ["Shopping bags", "Produce bags", "Case packs", "Household bundles", "Mixed grocery baskets"],
  Pharmacy: ["Prescription bags", "OTC medicine bags", "Wellness parcels", "Temperature-sensitive items", "Document envelopes"],
  "Retail store": ["Shopping bags", "Gift bags", "Boxed items", "Fragile parcels", "Multi-item orders"],
  "Beauty and personal care": ["Product bags", "Glass bottle orders", "Gift boxes", "Salon refill packs", "Care bundles"],
  Electronics: ["Small device boxes", "Accessory packs", "Fragile electronics", "Sealed cartons", "Document envelopes"],
  "Home goods": ["Decor boxes", "Household bundles", "Fragile home items", "Soft goods packs", "Mixed cartons"],
  Fashion: ["Garment bags", "Shoe boxes", "Accessory packs", "Gift packaging", "Returns parcels"],
  Wholesale: ["Bulk cartons", "Case packs", "Mixed inventory bundles", "Pallet-ready boxes", "Commercial parcels"],
  Other: ["Small parcels", "Medium parcels", "Large parcels", "Fragile items", "Mixed orders"],
};

const FORM_STORAGE_VERSION = 1;

type MerchantDraftState = {
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  selectedParish: string;
  selectedTown: string;
  selectedCategory: string;
  averageDailyOrders: string;
  currentDeliveryMethod: string;
  preferredStartTimeline: string;
  instagramHandle: string;
  website: string;
  selectedOrderChannels: string[];
  serviceAreas: string[];
  serviceAreaParish: string;
  serviceAreaTown: string;
  operatingDays: string[];
  openTime: string;
  closeTime: string;
  storeName: string;
  logoUrl: string;
  selectedApplicationCategory: string;
  selectedGrabquikFulfillmentMode: string;
  businessDescription: string;
  catalogReady: string;
  legalAccepted: boolean;
  pickupAddress: string;
  selectedDispatchMode: string;
  selectedDeliveryRadius: string;
  selectedAverageOrderSize: string;
  selectedSlydeFulfillmentMode: string;
  selectedPackageTypes: string[];
  pickupLocations: string[];
  pickupLocationLabel: string;
  pickupLocationParish: string;
  pickupLocationTown: string;
  pickupLocationAddressLine: string;
  selectedOrderSources: string[];
  selectedCapabilities: string[];
};

type MerchantFieldIssueMap = Partial<Record<
  | "businessName"
  | "contactName"
  | "phone"
  | "email"
  | "selectedParish"
  | "selectedTown"
  | "selectedCategory"
  | "selectedOrderChannels"
  | "serviceAreas"
  | "operatingHours"
  | "storeName"
  | "selectedApplicationCategory"
  | "selectedGrabquikFulfillmentMode"
  | "pickupAddress"
  | "businessDescription"
  | "legalAccepted"
  | "selectedDispatchMode"
  | "selectedDeliveryRadius"
  | "selectedAverageOrderSize"
  | "selectedSlydeFulfillmentMode"
  | "selectedPackageTypes"
  | "pickupLocations"
  | "selectedOrderSources",
  boolean
>>;

type MerchantSectionCompletionKey =
  | "businessBasics"
  | "operationsSetup"
  | "marketplaceDetails"
  | "deliveryProfile";

function buildStorageKey(track: MerchantTrack) {
  return `slyde-merchant-onboarding-draft:${track}:v${FORM_STORAGE_VERSION}`;
}

function defaultDraftState(): MerchantDraftState {
  return {
    businessName: "",
    contactName: "",
    phone: "",
    email: "",
    selectedParish: "",
    selectedTown: "",
    selectedCategory: "",
    averageDailyOrders: "",
    currentDeliveryMethod: "",
    preferredStartTimeline: "",
    instagramHandle: "",
    website: "",
    selectedOrderChannels: [],
    serviceAreas: [],
    serviceAreaParish: "",
    serviceAreaTown: "",
    operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    openTime: "9:00 AM",
    closeTime: "6:00 PM",
    storeName: "",
    logoUrl: "",
    selectedApplicationCategory: "",
    selectedGrabquikFulfillmentMode: "",
    businessDescription: "",
    catalogReady: "true",
    legalAccepted: false,
    pickupAddress: "",
    selectedDispatchMode: "manual_dashboard",
    selectedDeliveryRadius: "",
    selectedAverageOrderSize: "",
    selectedSlydeFulfillmentMode: "",
    selectedPackageTypes: [],
    pickupLocations: [],
    pickupLocationLabel: "",
    pickupLocationParish: "",
    pickupLocationTown: "",
    pickupLocationAddressLine: "",
    selectedOrderSources: [],
    selectedCapabilities: [],
  };
}

function FieldHint({ label, purpose, example }: { label: string; purpose: string; example: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-950">{label}</span>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-sky-300 hover:text-sky-700"
          aria-label={`Explain ${label}`}
          aria-expanded={open}
        >
          <CircleHelp className="h-4 w-4" />
        </button>
      </div>
      {open ? (
        <div className="rounded-[1.1rem] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-700">
          <p><span className="font-semibold text-slate-950">Purpose:</span> {purpose}</p>
          <p className="mt-1"><span className="font-semibold text-slate-950">Example:</span> {example}</p>
        </div>
      ) : null}
    </div>
  );
}

function SelectField({
  name,
  value,
  onChange,
  options,
  placeholder,
  required,
}: {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Array<string | { value: string; label: string }>;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <select
      className="field-input"
      name={name}
      value={value}
      onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      required={required}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={typeof option === "string" ? option : option.value} value={typeof option === "string" ? option : option.value}>
          {typeof option === "string" ? option : option.label}
        </option>
      ))}
    </select>
  );
}

function MultiSelectChips({
  name,
  options,
  values,
  onToggle,
}: {
  name: string;
  options: string[];
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {values.map((value) => (
        <input key={`hidden-${name}-${value}`} type="hidden" name={name} value={value} />
      ))}
      {options.map((option) => {
        const active = values.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              active ? "border-slate-900 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function ToggleChoiceCards({
  items,
  values,
  onToggle,
}: {
  items: Array<{ key: string; label: string; description: string; example: string }>;
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((item) => {
        const active = values.includes(item.key);
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onToggle(item.key)}
            className={`rounded-[1.4rem] border px-4 py-4 text-left transition ${
              active ? "border-slate-900 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <p className="text-sm font-semibold">{item.label}</p>
            <p className={`mt-2 text-sm ${active ? "text-slate-200" : "text-slate-600"}`}>{item.description}</p>
            <p className={`mt-2 text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>Example: {item.example}</p>
          </button>
        );
      })}
    </div>
  );
}

function buildOperatingHoursSummary(days: string[], openTime: string, closeTime: string) {
  if (!days.length && !openTime && !closeTime) return "";
  const daySummary = days.length ? days.join(", ") : "Days pending";
  const timeSummary = openTime && closeTime ? `${openTime} to ${closeTime}` : "Hours pending";
  return `${daySummary} | ${timeSummary}`;
}

function SummaryLine({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="max-w-[65%] text-right text-sm font-semibold text-slate-900">{value || "Pending"}</span>
    </div>
  );
}

function SectionHeader({
  title,
  description,
  complete,
  celebrate,
}: {
  title: string;
  description: string;
  complete: boolean;
  celebrate?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-500 ${
          complete
            ? celebrate
              ? "scale-105 animate-pulse bg-emerald-100 text-emerald-800 shadow-[0_0_0_6px_rgba(16,185,129,0.10)]"
              : "bg-emerald-100 text-emerald-800"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {complete ? (celebrate ? "Just completed" : "Complete") : "In progress"}
      </span>
    </div>
  );
}

function StepNavigator({
  steps,
}: {
  steps: Array<{ id: string; label: string; complete: boolean }>;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-3">
        {steps.map((step, index) => (
          <a
            key={step.id}
            href={`#${step.id}`}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              step.complete ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
              step.complete ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
            }`}>
              {index + 1}
            </span>
            <span>{step.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function scrollToSection(sectionId: string) {
  if (typeof window === "undefined") return;
  const element = document.getElementById(sectionId);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

function fieldErrorClass(active?: boolean) {
  return active ? "border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-200" : "";
}

function buildChecklistItems(input: {
  track: MerchantTrack;
  selectedCategory: string;
  selectedParish: string;
  selectedTown: string;
  selectedOrderChannels: string[];
  serviceAreas: string[];
  operatingHoursSummary: string;
  selectedApplicationCategory: string;
  selectedGrabquikFulfillmentMode: string;
  selectedDispatchMode: string;
  selectedDeliveryRadius: string;
  selectedAverageOrderSize: string;
  selectedSlydeFulfillmentMode: string;
  selectedPackageTypes: string[];
  pickupLocations: string[];
}) {
  const checks = [
    { label: "Business category selected", complete: Boolean(input.selectedCategory) },
    { label: "Primary location selected", complete: Boolean(input.selectedParish && input.selectedTown) },
    { label: "At least one order channel selected", complete: input.selectedOrderChannels.length > 0 },
    { label: "At least one service area added", complete: input.serviceAreas.length > 0 },
    { label: "Operating days and hours selected", complete: Boolean(input.operatingHoursSummary) },
  ];

  if (input.track === "grabquik") {
    checks.push(
      { label: "Marketplace category selected", complete: Boolean(input.selectedApplicationCategory) },
      { label: "Fulfillment type selected", complete: Boolean(input.selectedGrabquikFulfillmentMode) },
    );
  } else {
    checks.push(
      { label: "Dispatch mode selected", complete: Boolean(input.selectedDispatchMode) },
      { label: "Delivery radius selected", complete: Boolean(input.selectedDeliveryRadius) },
      { label: "Average order size selected", complete: Boolean(input.selectedAverageOrderSize) },
      { label: "Fulfillment mode selected", complete: Boolean(input.selectedSlydeFulfillmentMode) },
      { label: "At least one package type selected", complete: input.selectedPackageTypes.length > 0 },
      { label: "At least one pickup location added", complete: input.pickupLocations.length > 0 },
    );
  }

  return checks;
}

function buildSmartSuggestions(input: {
  track: MerchantTrack;
  selectedCategory: string;
  selectedPackageTypes: string[];
  serviceAreas: string[];
  pickupLocations: string[];
  selectedOrderChannels: string[];
  selectedCapabilities: string[];
}) {
  const suggestions: string[] = [];

  if (input.selectedCategory === "Restaurant") {
    if (!input.selectedPackageTypes.includes("Drink cups")) {
      suggestions.push("You selected Restaurant, consider adding Drink cups if beverages are part of your normal orders.");
    }
    if (!input.selectedPackageTypes.includes("Family trays")) {
      suggestions.push("You selected Restaurant, consider adding Family trays if you handle larger group meals or combo orders.");
    }
  }

  if (input.selectedCategory === "Pharmacy" && !input.selectedPackageTypes.includes("Temperature-sensitive items")) {
    suggestions.push("You selected Pharmacy, consider adding Temperature-sensitive items if any products need extra handling.");
  }

  if (input.serviceAreas.length > 1 && input.pickupLocations.length < 2 && input.track === "slyde_delivery") {
    suggestions.push("You selected multiple service areas, consider adding a second pickup location if orders start from more than one branch or prep point.");
  }

  if (input.selectedOrderChannels.includes("instagram") && !input.selectedOrderChannels.includes("whatsapp")) {
    suggestions.push("You selected Instagram, consider adding WhatsApp too if customers usually confirm orders there after messaging on social.");
  }

  if (input.track === "slyde_delivery" && !input.selectedCapabilities.includes("scheduledSupported")) {
    suggestions.push("If customers often place orders ahead of time, consider enabling Scheduled supported so your launch profile matches that workflow.");
  }

  return suggestions.slice(0, 4);
}

export function MerchantForm({ track, title, description }: { track: MerchantTrack; title: string; description: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldIssues, setFieldIssues] = useState<MerchantFieldIssueMap>({});
  const [draft, setDraft] = useState<MerchantDraftState>(() => defaultDraftState());
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftNotice, setDraftNotice] = useState<string>("Draft autosave is on. Your progress is being saved on this device.");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [showDraftRecoveredBanner, setShowDraftRecoveredBanner] = useState(false);
  const [showClearDraftConfirm, setShowClearDraftConfirm] = useState(false);
  const [celebratingSections, setCelebratingSections] = useState<Partial<Record<MerchantSectionCompletionKey, boolean>>>({});
  const previousCompletionRef = useRef<Record<MerchantSectionCompletionKey, boolean>>({
    businessBasics: false,
    operationsSetup: false,
    marketplaceDetails: false,
    deliveryProfile: false,
  });
  const completionTimersRef = useRef<Partial<Record<MerchantSectionCompletionKey, ReturnType<typeof setTimeout>>>>({});

  const {
    businessName,
    contactName,
    phone,
    email,
    selectedParish,
    selectedTown,
    selectedCategory,
    averageDailyOrders,
    currentDeliveryMethod,
    preferredStartTimeline,
    instagramHandle,
    website,
    selectedOrderChannels,
    serviceAreas,
    serviceAreaParish,
    serviceAreaTown,
    operatingDays,
    openTime,
    closeTime,
    storeName,
    logoUrl,
    selectedApplicationCategory,
    selectedGrabquikFulfillmentMode,
    businessDescription,
    catalogReady,
    legalAccepted,
    pickupAddress,
    selectedDispatchMode,
    selectedDeliveryRadius,
    selectedAverageOrderSize,
    selectedSlydeFulfillmentMode,
    selectedPackageTypes,
    pickupLocations,
    pickupLocationLabel,
    pickupLocationParish,
    pickupLocationTown,
    pickupLocationAddressLine,
    selectedOrderSources,
    selectedCapabilities,
  } = draft;

  const townOptions = useMemo(() => (selectedParish ? PARISH_TOWNS[selectedParish] ?? ["Other"] : []), [selectedParish]);
  const packageTypeOptions = useMemo(() => PACKAGE_TYPES_BY_CATEGORY[selectedCategory] ?? PACKAGE_TYPES_BY_CATEGORY.Other, [selectedCategory]);
  const serviceAreaTownOptions = useMemo(() => (serviceAreaParish ? PARISH_TOWNS[serviceAreaParish] ?? ["Other"] : []), [serviceAreaParish]);
  const pickupLocationTownOptions = useMemo(() => (pickupLocationParish ? PARISH_TOWNS[pickupLocationParish] ?? ["Other"] : []), [pickupLocationParish]);
  const operatingHoursSummary = useMemo(() => buildOperatingHoursSummary(operatingDays, openTime, closeTime), [operatingDays, openTime, closeTime]);
  const capabilityLabels = useMemo(() => {
    const labels: Record<string, string> = {
      sameDaySupported: "Same-day",
      scheduledSupported: "Scheduled",
      acceptsCOD: "Cash on delivery",
    };
    return selectedCapabilities.map((value) => labels[value] ?? value);
  }, [selectedCapabilities]);
  const readinessChecks = useMemo(
    () =>
      buildChecklistItems({
        track,
        selectedCategory,
        selectedParish,
        selectedTown,
        selectedOrderChannels,
        serviceAreas,
        operatingHoursSummary,
        selectedApplicationCategory,
        selectedGrabquikFulfillmentMode,
        selectedDispatchMode,
        selectedDeliveryRadius,
        selectedAverageOrderSize,
        selectedSlydeFulfillmentMode,
        selectedPackageTypes,
        pickupLocations,
      }),
    [
      track,
      selectedCategory,
      selectedParish,
      selectedTown,
      selectedOrderChannels,
      serviceAreas,
      operatingHoursSummary,
      selectedApplicationCategory,
      selectedGrabquikFulfillmentMode,
      selectedDispatchMode,
      selectedDeliveryRadius,
      selectedAverageOrderSize,
      selectedSlydeFulfillmentMode,
      selectedPackageTypes,
      pickupLocations,
    ],
  );
  const readinessCompletedCount = readinessChecks.filter((item) => item.complete).length;
  const readinessPercent = readinessChecks.length ? Math.round((readinessCompletedCount / readinessChecks.length) * 100) : 0;
  const missingChecklistItems = readinessChecks.filter((item) => !item.complete);
  const businessBasicsComplete = Boolean(
    businessName &&
      contactName &&
      phone &&
      email &&
      selectedParish &&
      selectedTown &&
      selectedCategory &&
      selectedOrderChannels.length > 0,
  );
  const operationsSetupComplete = Boolean(
    serviceAreas.length > 0 &&
      operatingDays.length > 0 &&
      openTime &&
      closeTime,
  );
  const grabquikSectionComplete = Boolean(
    storeName &&
      selectedApplicationCategory &&
      selectedGrabquikFulfillmentMode &&
      pickupAddress &&
      businessDescription &&
      legalAccepted,
  );
  const slydeSectionComplete = Boolean(
    pickupAddress &&
      selectedDispatchMode &&
      selectedDeliveryRadius &&
      selectedAverageOrderSize &&
      selectedSlydeFulfillmentMode &&
      selectedPackageTypes.length > 0 &&
      pickupLocations.length > 0 &&
      selectedOrderSources.length > 0,
  );
  const smartSuggestions = useMemo(
    () =>
      buildSmartSuggestions({
        track,
        selectedCategory,
        selectedPackageTypes,
        serviceAreas,
        pickupLocations,
        selectedOrderChannels,
        selectedCapabilities,
      }),
    [
      track,
      selectedCategory,
      selectedPackageTypes,
      serviceAreas,
      pickupLocations,
      selectedOrderChannels,
      selectedCapabilities,
    ],
  );
  const formSteps = useMemo(
    () => [
      { id: "business-basics", label: "Business basics", complete: businessBasicsComplete },
      { id: "operations-setup", label: "Operations setup", complete: operationsSetupComplete },
      {
        id: track === "grabquik" ? "marketplace-launch" : "delivery-profile",
        label: track === "grabquik" ? "Marketplace details" : "Delivery profile",
        complete: track === "grabquik" ? grabquikSectionComplete : slydeSectionComplete,
      },
      { id: "application-summary", label: "Summary", complete: readinessPercent === 100 },
    ],
    [
      businessBasicsComplete,
      operationsSetupComplete,
      track,
      grabquikSectionComplete,
      slydeSectionComplete,
      readinessPercent,
    ],
  );
  const storageKey = useMemo(() => buildStorageKey(track), [track]);
  const firstIncompleteSectionId = useMemo(() => {
    if (!businessBasicsComplete) return "business-basics";
    if (!operationsSetupComplete) return "operations-setup";
    if (track === "grabquik" && !grabquikSectionComplete) return "marketplace-launch";
    if (track === "slyde_delivery" && !slydeSectionComplete) return "delivery-profile";
    return "application-summary";
  }, [
    businessBasicsComplete,
    operationsSetupComplete,
    track,
    grabquikSectionComplete,
    slydeSectionComplete,
  ]);

  useEffect(() => {
    const nextCompletionState: Record<MerchantSectionCompletionKey, boolean> = {
      businessBasics: businessBasicsComplete,
      operationsSetup: operationsSetupComplete,
      marketplaceDetails: grabquikSectionComplete,
      deliveryProfile: slydeSectionComplete,
    };

    (Object.keys(nextCompletionState) as MerchantSectionCompletionKey[]).forEach((key) => {
      if (nextCompletionState[key] && !previousCompletionRef.current[key]) {
        if (completionTimersRef.current[key]) {
          clearTimeout(completionTimersRef.current[key]);
        }

        setCelebratingSections((current) => ({ ...current, [key]: true }));
        completionTimersRef.current[key] = setTimeout(() => {
          setCelebratingSections((current) => ({ ...current, [key]: false }));
        }, 1600);
      }
    });

    previousCompletionRef.current = nextCompletionState;
  }, [
    businessBasicsComplete,
    operationsSetupComplete,
    grabquikSectionComplete,
    slydeSectionComplete,
  ]);

  useEffect(() => {
    return () => {
      (Object.values(completionTimersRef.current) as Array<ReturnType<typeof setTimeout> | undefined>).forEach((timer) => {
        if (timer) {
          clearTimeout(timer);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setDraftLoaded(true);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<MerchantDraftState>;
      setDraft({
        ...defaultDraftState(),
        ...parsed,
      });
      setDraftNotice("Saved draft restored on this device.");
      setLastSavedAt(new Date().toISOString());
      setShowDraftRecoveredBanner(true);
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setDraftLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!draftLoaded || typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
    setLastSavedAt(new Date().toISOString());
  }, [draft, draftLoaded, storageKey]);

  function saveDraftNow() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
    setDraftNotice("Draft saved on this device.");
    setLastSavedAt(new Date().toISOString());
  }

  function clearDraftNow() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(storageKey);
    setDraft(defaultDraftState());
    setError(null);
    setDraftNotice("Draft cleared from this device.");
    setLastSavedAt(null);
    setShowClearDraftConfirm(false);
    setShowDraftRecoveredBanner(false);
  }

  function toggleValue(setter: React.Dispatch<React.SetStateAction<string[]>>, currentValues: string[], value: string) {
    setter(currentValues.includes(value) ? currentValues.filter((item) => item !== value) : [...currentValues, value]);
  }

  function addServiceArea() {
    if (!serviceAreaParish || !serviceAreaTown) {
      setError("Select both a parish and town before adding a service area.");
      return;
    }

    const next = `${serviceAreaTown}, ${serviceAreaParish}`;
    setDraft((current) => ({
      ...current,
      serviceAreas: current.serviceAreas.includes(next) ? current.serviceAreas : [...current.serviceAreas, next],
      serviceAreaParish: "",
      serviceAreaTown: "",
    }));
    setError(null);
  }

  function addPickupLocation() {
    if (!pickupLocationLabel || !pickupLocationParish || !pickupLocationTown || !pickupLocationAddressLine) {
      setError("Add a label, parish, town, and address line before saving a pickup location.");
      return;
    }

    const next = `${pickupLocationLabel} - ${pickupLocationAddressLine}, ${pickupLocationTown}, ${pickupLocationParish}`;
    setDraft((current) => ({
      ...current,
      pickupLocations: current.pickupLocations.includes(next) ? current.pickupLocations : [...current.pickupLocations, next],
      pickupLocationLabel: "",
      pickupLocationParish: "",
      pickupLocationTown: "",
      pickupLocationAddressLine: "",
    }));
    setError(null);
  }

  async function submit(formData: FormData) {
    setError(null);
    setFieldIssues({});

    const nextIssues: MerchantFieldIssueMap = {};

    if (!businessName) nextIssues.businessName = true;
    if (!contactName) nextIssues.contactName = true;
    if (!phone) nextIssues.phone = true;
    if (!email) nextIssues.email = true;
    if (!selectedParish) nextIssues.selectedParish = true;
    if (!selectedTown) nextIssues.selectedTown = true;
    if (!selectedCategory) nextIssues.selectedCategory = true;
    if (!selectedOrderChannels.length) nextIssues.selectedOrderChannels = true;
    if (!serviceAreas.length) nextIssues.serviceAreas = true;
    if (!operatingDays.length || !openTime || !closeTime) nextIssues.operatingHours = true;

    if (track === "grabquik") {
      if (!storeName) nextIssues.storeName = true;
      if (!selectedApplicationCategory) nextIssues.selectedApplicationCategory = true;
      if (!selectedGrabquikFulfillmentMode) nextIssues.selectedGrabquikFulfillmentMode = true;
      if (!pickupAddress) nextIssues.pickupAddress = true;
      if (!businessDescription) nextIssues.businessDescription = true;
      if (!legalAccepted) nextIssues.legalAccepted = true;
    } else {
      if (!pickupAddress) nextIssues.pickupAddress = true;
      if (!selectedDispatchMode) nextIssues.selectedDispatchMode = true;
      if (!selectedDeliveryRadius) nextIssues.selectedDeliveryRadius = true;
      if (!selectedAverageOrderSize) nextIssues.selectedAverageOrderSize = true;
      if (!selectedSlydeFulfillmentMode) nextIssues.selectedSlydeFulfillmentMode = true;
      if (!selectedPackageTypes.length) nextIssues.selectedPackageTypes = true;
      if (!pickupLocations.length) nextIssues.pickupLocations = true;
      if (!selectedOrderSources.length) nextIssues.selectedOrderSources = true;
    }

    if (Object.keys(nextIssues).length) {
      setFieldIssues(nextIssues);
    }

    if (!businessBasicsComplete) {
      setError("Finish the business basics section before continuing.");
      scrollToSection("business-basics");
      return;
    }

    if (!operationsSetupComplete) {
      setError("Finish the operations setup section before continuing.");
      scrollToSection("operations-setup");
      return;
    }

    if (!serviceAreas.length) {
      setError("Add at least one service area before continuing.");
      scrollToSection("operations-setup");
      return;
    }

    if (track === "slyde_delivery" && !pickupLocations.length) {
      setError("Add at least one pickup location before continuing.");
      scrollToSection("delivery-profile");
      return;
    }

    if (track === "grabquik" && !grabquikSectionComplete) {
      setError("Finish the remaining marketplace details before continuing.");
      scrollToSection(firstIncompleteSectionId);
      return;
    }

    if (track === "slyde_delivery" && !slydeSectionComplete) {
      setError("Finish the remaining delivery profile details before continuing.");
      scrollToSection(firstIncompleteSectionId);
      return;
    }

    const commonPayload = {
      businessName: String(formData.get("businessName") || ""),
      contactName: String(formData.get("contactName") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      parish: String(formData.get("parish") || ""),
      town: String(formData.get("town") || ""),
      category: String(formData.get("category") || ""),
      instagramHandle: String(formData.get("instagramHandle") || "") || undefined,
      website: String(formData.get("website") || "") || undefined,
      orderChannels: selectedOrderChannels,
      averageDailyOrders: String(formData.get("averageDailyOrders") || "") || undefined,
      currentDeliveryMethod: String(formData.get("currentDeliveryMethod") || "") || undefined,
      preferredStartTimeline: String(formData.get("preferredStartTimeline") || "") || undefined,
      productIntent: track,
    };

    const leadResponse = await fetch("/api/public/merchant-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commonPayload),
    });
    const leadPayload = await leadResponse.json().catch(() => null);

    if (!leadResponse.ok || !leadPayload?.lead?.id) {
      setError(
        typeof leadPayload?.error === "string"
          ? leadPayload.error
          : leadPayload?.error?.formErrors?.[0] || "We could not start merchant onboarding.",
      );
      return;
    }

    const applicationPayload =
      track === "grabquik"
        ? {
            merchantLeadId: leadPayload.lead.id,
            onboardingTrack: "grabquik",
            storeName: String(formData.get("storeName") || ""),
            logoUrl: String(formData.get("logoUrl") || "") || undefined,
            businessDescription: String(formData.get("businessDescription") || ""),
            category: String(formData.get("applicationCategory") || commonPayload.category),
            operatingHours: {
              days: operatingDays,
              openTime,
              closeTime,
              summary: operatingHoursSummary || "To be confirmed",
            },
            pickupAddress: String(formData.get("pickupAddress") || ""),
            serviceAreas,
            fulfillmentMode: String(formData.get("fulfillmentMode") || ""),
            catalogReady: formData.get("catalogReady") === "true",
            payoutDetails: { status: "placeholder" },
            legalAccepted: formData.get("legalAccepted") === "on",
          }
        : {
            merchantLeadId: leadPayload.lead.id,
            onboardingTrack: "slyde_delivery",
            pickupAddress: String(formData.get("pickupAddress") || ""),
            serviceAreas,
            fulfillmentMode: String(formData.get("fulfillmentMode") || "") || undefined,
            orderSources: selectedOrderSources,
            dispatchMode: String(formData.get("dispatchMode") || ""),
            pickupLocations,
            deliveryRadius: String(formData.get("deliveryRadius") || ""),
            packageTypes: selectedPackageTypes,
            averageOrderSize: String(formData.get("averageOrderSize") || "") || undefined,
            operatingHours: {
              days: operatingDays,
              openTime,
              closeTime,
              summary: operatingHoursSummary || "To be confirmed",
            },
            sameDaySupported: selectedCapabilities.includes("sameDaySupported"),
            scheduledSupported: selectedCapabilities.includes("scheduledSupported"),
            acceptsCOD: selectedCapabilities.includes("acceptsCOD"),
          };

    const applicationResponse = await fetch(
      track === "grabquik" ? "/api/public/merchant-applications/grabquik" : "/api/public/merchant-applications/slyde",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationPayload),
      },
    );
    const applicationResult = await applicationResponse.json().catch(() => null);

    if (!applicationResponse.ok || !applicationResult?.application?.id) {
      setError(
        typeof applicationResult?.error === "string"
          ? applicationResult.error
          : applicationResult?.error?.formErrors?.[0] || "We could not continue merchant onboarding.",
      );
      return;
    }

    router.push(
      `/for-businesses/success?track=${encodeURIComponent(track)}&lead=${encodeURIComponent(leadPayload.lead.id)}&application=${encodeURIComponent(applicationResult.application.id)}`,
    );
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
  }

  return (
    <div className="surface-panel p-8">
      <div className="max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">{track === "grabquik" ? "GrabQuik Onboarding" : "SLYDE Delivery Onboarding"}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
        {showDraftRecoveredBanner ? (
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3 rounded-[1.25rem] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-700">
            <div>
              <p className="font-semibold text-slate-900">Saved draft recovered</p>
              <p className="mt-1">
                Your previous onboarding progress has been restored on this device, so you can continue from where you left off.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDraftRecoveredBanner(false)}
              className="text-sm font-semibold text-sky-700 transition hover:text-sky-800"
            >
              Dismiss
            </button>
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
            {draftLoaded ? draftNotice : "Loading saved draft..."}
          </div>
          <button
            type="button"
            onClick={saveDraftNow}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => setShowClearDraftConfirm(true)}
            className="inline-flex items-center rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
          >
            Clear draft
          </button>
          <span className="text-sm text-slate-500">
            {lastSavedAt ? `Last saved ${new Date(lastSavedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "No local draft timestamp yet"}
          </span>
        </div>

        {showClearDraftConfirm ? (
          <div className="mt-4 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Start fresh?</p>
            <p className="mt-1">
              This will remove the saved draft on this device and reset the form back to a blank state.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={clearDraftNow}
                className="inline-flex items-center rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Yes, clear draft
              </button>
              <button
                type="button"
                onClick={() => setShowClearDraftConfirm(false)}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Keep draft
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <form
        id={`merchant-onboarding-form-${track}`}
        className="mt-8 grid gap-8 pb-28 xl:grid-cols-[minmax(0,1fr)_360px] xl:pb-0"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          startTransition(() => void submit(formData));
        }}
      >
        <div className="grid gap-8">
          <section className="grid gap-4">
            <StepNavigator steps={formSteps} />
          </section>

          <section
            id="business-basics"
            className={`grid gap-4 scroll-mt-24 rounded-[1.5rem] transition-all duration-500 ${
              celebratingSections.businessBasics ? "bg-emerald-50/70 px-4 py-4 ring-1 ring-emerald-200" : ""
            }`}
          >
            <SectionHeader
              title="Business basics"
              description="Core business identity, contact details, and how customers already place orders."
              complete={businessBasicsComplete}
              celebrate={Boolean(celebratingSections.businessBasics)}
            />
            <div className="grid gap-4 md:grid-cols-2">
            <input className={`field-input ${fieldErrorClass(fieldIssues.businessName)}`} name="businessName" value={businessName} onChange={(event) => setDraft((current) => ({ ...current, businessName: event.target.value }))} placeholder="Business name" required />
            <input className={`field-input ${fieldErrorClass(fieldIssues.contactName)}`} name="contactName" value={contactName} onChange={(event) => setDraft((current) => ({ ...current, contactName: event.target.value }))} placeholder="Contact name" required />
            <input className={`field-input ${fieldErrorClass(fieldIssues.phone)}`} name="phone" value={phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone" required />
            <input className={`field-input ${fieldErrorClass(fieldIssues.email)}`} type="email" name="email" value={email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} placeholder="Email" required />
            <div className="grid gap-2">
              <FieldHint label="Parish" purpose="This routes your onboarding to the right ops footprint and helps us understand where your business mainly operates." example="Choose the parish where your main pickup location runs most days." />
              <div className={fieldErrorClass(fieldIssues.selectedParish)}>
                <SelectField
                name="parish"
                value={selectedParish}
                    onChange={(value) => {
                      setDraft((current) => ({ ...current, selectedParish: value, selectedTown: "" }));
                    }}
                options={Object.keys(PARISH_TOWNS)}
                placeholder="Select your main parish"
                required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <FieldHint label="Town" purpose="This narrows your operating area inside the parish so we can plan rollout more accurately." example="Choose Montego Bay, New Kingston, or the town where your orders usually start." />
              <div className={fieldErrorClass(fieldIssues.selectedTown)}>
                <SelectField name="town" value={selectedTown} onChange={(value) => setDraft((current) => ({ ...current, selectedTown: value }))} options={townOptions} placeholder={selectedParish ? "Select your town" : "Select parish first"} required />
              </div>
            </div>
            <div className="grid gap-2">
              <FieldHint label="Business category" purpose="This helps us tailor onboarding, suggested package types, and future dispatch assumptions." example="Choose Restaurant if you mainly sell meals or Retail store if you mostly send packaged items." />
              <div className={fieldErrorClass(fieldIssues.selectedCategory)}>
                <SelectField name="category" value={selectedCategory} onChange={(value) => setDraft((current) => ({ ...current, selectedCategory: value, selectedPackageTypes: [] }))} options={BUSINESS_CATEGORIES} placeholder="Select business category" required />
              </div>
            </div>
            <div className="grid gap-2">
              <FieldHint label="Average daily orders" purpose="This helps us size the kind of launch support and dispatch rhythm your business may need." example="If you normally send around 18 orders per day, choose 11-25 orders." />
              <SelectField name="averageDailyOrders" value={averageDailyOrders} onChange={(value) => setDraft((current) => ({ ...current, averageDailyOrders: value }))} options={AVERAGE_DAILY_ORDER_OPTIONS} placeholder="Select average daily orders" />
            </div>
            <div className="grid gap-2">
              <FieldHint label="Current delivery method" purpose="We want to understand what is already working so we can improve your setup instead of guessing." example="Choose Owner handles deliveries if the owner still delivers orders personally." />
              <SelectField name="currentDeliveryMethod" value={currentDeliveryMethod} onChange={(value) => setDraft((current) => ({ ...current, currentDeliveryMethod: value }))} options={CURRENT_DELIVERY_METHOD_OPTIONS} placeholder="Select current delivery method" />
            </div>
            <div className="grid gap-2">
              <FieldHint label="Preferred start timeline" purpose="This tells us whether you need urgent onboarding or whether you are still evaluating options." example="Choose Within 7 days if you want to launch soon after approval." />
              <SelectField name="preferredStartTimeline" value={preferredStartTimeline} onChange={(value) => setDraft((current) => ({ ...current, preferredStartTimeline: value }))} options={START_TIMELINE_OPTIONS} placeholder="Select preferred start timeline" />
            </div>
            <input className="field-input" name="instagramHandle" value={instagramHandle} onChange={(event) => setDraft((current) => ({ ...current, instagramHandle: event.target.value }))} placeholder="Instagram handle (optional)" />
            <input className="field-input" name="website" value={website} onChange={(event) => setDraft((current) => ({ ...current, website: event.target.value }))} placeholder="Website (optional)" />
            </div>

            <div className={`grid gap-3 rounded-[1rem] ${fieldIssues.selectedOrderChannels ? "border border-rose-300 bg-rose-50 p-3" : ""}`}>
              <FieldHint label="Order channels" purpose="This shows where customers already place orders so SLYDE can fit your actual sales workflow." example="Select Instagram and WhatsApp if that is where most customer conversations start today." />
              <MultiSelectChips
                name="orderChannels"
                options={ORDER_CHANNEL_OPTIONS.map((option) => option.replace(/_/g, " "))}
                values={selectedOrderChannels}
                onToggle={(label) => {
                  const value = label.replace(/ /g, "_");
                  setDraft((current) => ({
                    ...current,
                    selectedOrderChannels: current.selectedOrderChannels.includes(value)
                      ? current.selectedOrderChannels.filter((item) => item !== value)
                      : [...current.selectedOrderChannels, value],
                  }));
                }}
              />
            </div>
          </section>

          <section
            id="operations-setup"
            className={`grid gap-4 scroll-mt-24 rounded-[1.5rem] transition-all duration-500 ${
              celebratingSections.operationsSetup ? "bg-emerald-50/70 px-4 py-4 ring-1 ring-emerald-200" : ""
            }`}
          >
            <SectionHeader
              title="Operations setup"
              description="Where you serve and when your business is actually open to prepare and hand off orders."
              complete={operationsSetupComplete}
              celebrate={Boolean(celebratingSections.operationsSetup)}
            />
            <FieldHint label="Operating days and hours" purpose="This gives us a clean operational window for when your business can prepare and hand off orders." example="Select Monday to Saturday, then choose 9:00 AM opening and 7:00 PM closing if those are your active dispatch hours." />
            <div className={`rounded-[1.5rem] border bg-slate-50 p-5 ${fieldIssues.operatingHours ? "border-rose-300 bg-rose-50" : "border-slate-200"}`}>
              <div className="flex flex-wrap gap-3">
                {operatingDays.map((day) => (
                  <input key={`operating-day-${day}`} type="hidden" name="operatingDays" value={day} />
                ))}
                {DAYS_OF_WEEK.map((day) => {
                  const active = operatingDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          operatingDays: current.operatingDays.includes(day)
                            ? current.operatingDays.filter((item) => item !== day)
                            : [...current.operatingDays, day],
                        }))
                      }
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        active ? "border-slate-900 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <SelectField name="operatingOpenTime" value={openTime} onChange={(value) => setDraft((current) => ({ ...current, openTime: value }))} options={TIME_SLOTS} placeholder="Select opening time" required />
                <SelectField name="operatingCloseTime" value={closeTime} onChange={(value) => setDraft((current) => ({ ...current, closeTime: value }))} options={TIME_SLOTS} placeholder="Select closing time" required />
              </div>
              <input type="hidden" name="operatingHours" value={operatingHoursSummary} />
            </div>
          </section>

          {track === "grabquik" ? (
            <section
              id="marketplace-launch"
              className={`grid gap-4 md:grid-cols-2 scroll-mt-24 rounded-[1.5rem] transition-all duration-500 ${
                celebratingSections.marketplaceDetails ? "bg-emerald-50/70 px-4 py-4 ring-1 ring-emerald-200" : ""
              }`}
            >
            <SectionHeader
              title="Marketplace launch details"
              description="What GrabQuik needs to understand your storefront, catalog readiness, and marketplace fulfillment plan."
              complete={grabquikSectionComplete}
              celebrate={Boolean(celebratingSections.marketplaceDetails)}
            />
            <input className="field-input" name="storeName" value={storeName} onChange={(event) => setDraft((current) => ({ ...current, storeName: event.target.value }))} placeholder="Store name" required />
            <input className="field-input" name="logoUrl" value={logoUrl} onChange={(event) => setDraft((current) => ({ ...current, logoUrl: event.target.value }))} placeholder="Logo URL (optional)" />
            <div className="grid gap-2">
              <FieldHint label="Marketplace category" purpose="This controls how your storefront will be grouped and discovered inside GrabQuik." example="A pharmacy should choose Pharmacy. A food brand should choose Restaurant or Cafe." />
              <SelectField name="applicationCategory" value={selectedApplicationCategory} onChange={(value) => setDraft((current) => ({ ...current, selectedApplicationCategory: value }))} options={BUSINESS_CATEGORIES} placeholder="Select marketplace category" required />
            </div>
            <div className="grid gap-2">
              <FieldHint label="Fulfillment type" purpose="This tells us who will help fulfill demand once customers start ordering through GrabQuik." example="Choose SLYDE fulfilled if you want SLYDE to handle delivery operations." />
              <SelectField name="fulfillmentMode" value={selectedGrabquikFulfillmentMode} onChange={(value) => setDraft((current) => ({ ...current, selectedGrabquikFulfillmentMode: value }))} options={GRABQUIK_FULFILLMENT_OPTIONS} placeholder="Select fulfillment type" required />
            </div>
            <input className="field-input md:col-span-2" name="pickupAddress" value={pickupAddress} onChange={(event) => setDraft((current) => ({ ...current, pickupAddress: event.target.value }))} placeholder="Pickup address" required />
            <div className="grid gap-3 md:col-span-2">
              <FieldHint label="Service areas" purpose="This gives us a first view of where you want delivery support and visibility." example="Add New Kingston, Kingston and Half Way Tree, Kingston as separate service areas if those are your launch zones." />
              <div className={`rounded-[1.5rem] border bg-slate-50 p-5 ${fieldIssues.serviceAreas ? "border-rose-300 bg-rose-50" : "border-slate-200"}`}>
                {serviceAreas.map((area) => (
                  <input key={`service-area-${area}`} type="hidden" name="serviceAreas" value={area} />
                ))}
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <SelectField
                    name="serviceAreaParishBuilder"
                    value={serviceAreaParish}
                    onChange={(value) => {
                      setDraft((current) => ({ ...current, serviceAreaParish: value, serviceAreaTown: "" }));
                    }}
                    options={Object.keys(PARISH_TOWNS)}
                    placeholder="Select parish"
                  />
                  <SelectField
                    name="serviceAreaTownBuilder"
                    value={serviceAreaTown}
                    onChange={(value) => setDraft((current) => ({ ...current, serviceAreaTown: value }))}
                    options={serviceAreaTownOptions}
                    placeholder={serviceAreaParish ? "Select town" : "Select parish first"}
                  />
                  <Button type="button" onClick={addServiceArea} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add area
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {serviceAreas.length ? serviceAreas.map((area) => (
                    <div key={area} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
                      <span>{area}</span>
                      <button type="button" onClick={() => setDraft((current) => ({ ...current, serviceAreas: current.serviceAreas.filter((item) => item !== area) }))} className="text-slate-400 hover:text-rose-600" aria-label={`Remove ${area}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )) : <p className="text-sm text-slate-500">No service areas added yet.</p>}
                </div>
              </div>
            </div>
            <textarea className={`field-input min-h-32 md:col-span-2 ${fieldErrorClass(fieldIssues.businessDescription)}`} name="businessDescription" value={businessDescription} onChange={(event) => setDraft((current) => ({ ...current, businessDescription: event.target.value }))} placeholder="Business description" required />
            <div className="grid gap-2">
              <FieldHint label="Catalog ready" purpose="This tells us whether your products, prices, and product setup can move quickly into marketplace launch." example="Choose Yes if your menu or item catalog is already prepared with pricing." />
              <select className="field-input" name="catalogReady" value={catalogReady} onChange={(event) => setDraft((current) => ({ ...current, catalogReady: event.target.value }))}>
                <option value="true">Yes, catalog is ready</option>
                <option value="false">Not yet, still preparing catalog</option>
              </select>
            </div>
            <label className={`inline-flex items-center gap-2 text-sm md:col-span-2 ${fieldIssues.legalAccepted ? "text-rose-700" : "text-slate-700"}`}>
              <input type="checkbox" name="legalAccepted" checked={legalAccepted} onChange={(event) => setDraft((current) => ({ ...current, legalAccepted: event.target.checked }))} className="field-checkbox" required />
              <span>We accept the current onboarding and legal terms.</span>
            </label>
            </section>
          ) : (
            <section
              id="delivery-profile"
              className={`grid gap-4 md:grid-cols-2 scroll-mt-24 rounded-[1.5rem] transition-all duration-500 ${
                celebratingSections.deliveryProfile ? "bg-emerald-50/70 px-4 py-4 ring-1 ring-emerald-200" : ""
              }`}
            >
            <SectionHeader
              title="Delivery operations profile"
              description="How SLYDE should dispatch, what you send, where pickups happen, and what your team can support at launch."
              complete={slydeSectionComplete}
              celebrate={Boolean(celebratingSections.deliveryProfile)}
            />
            <input className="field-input md:col-span-2" name="pickupAddress" value={pickupAddress} onChange={(event) => setDraft((current) => ({ ...current, pickupAddress: event.target.value }))} placeholder="Primary pickup address" required />
            <div className="grid gap-3 md:col-span-2">
              <FieldHint label="Service areas" purpose="This helps us understand where you want to send deliveries first, even if your footprint expands later." example="Add Mandeville, Manchester and Santa Cruz, St. Elizabeth as separate service areas if those are the first zones you want to support." />
              <div className={`rounded-[1.5rem] border bg-slate-50 p-5 ${fieldIssues.serviceAreas ? "border-rose-300 bg-rose-50" : "border-slate-200"}`}>
                {serviceAreas.map((area) => (
                  <input key={`service-area-${area}`} type="hidden" name="serviceAreas" value={area} />
                ))}
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <SelectField
                    name="serviceAreaParishBuilder"
                    value={serviceAreaParish}
                    onChange={(value) => {
                      setDraft((current) => ({ ...current, serviceAreaParish: value, serviceAreaTown: "" }));
                    }}
                    options={Object.keys(PARISH_TOWNS)}
                    placeholder="Select parish"
                  />
                  <SelectField
                    name="serviceAreaTownBuilder"
                    value={serviceAreaTown}
                    onChange={(value) => setDraft((current) => ({ ...current, serviceAreaTown: value }))}
                    options={serviceAreaTownOptions}
                    placeholder={serviceAreaParish ? "Select town" : "Select parish first"}
                  />
                  <Button type="button" onClick={addServiceArea} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add area
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {serviceAreas.length ? serviceAreas.map((area) => (
                    <div key={area} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
                      <span>{area}</span>
                      <button type="button" onClick={() => setDraft((current) => ({ ...current, serviceAreas: current.serviceAreas.filter((item) => item !== area) }))} className="text-slate-400 hover:text-rose-600" aria-label={`Remove ${area}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )) : <p className="text-sm text-slate-500">No service areas added yet.</p>}
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <FieldHint label="Dispatch mode" purpose="This tells us how your team wants to request deliveries at launch." example="Choose Manual dashboard if staff will log in and create requests themselves." />
              <select className="field-input" name="dispatchMode" value={selectedDispatchMode} onChange={(event) => setDraft((current) => ({ ...current, selectedDispatchMode: event.target.value }))} required>
                <option value="manual_dashboard">Manual dashboard</option>
                <option value="whatsapp_assisted">WhatsApp assisted</option>
                <option value="api_later">API later</option>
              </select>
            </div>
            <div className="grid gap-2">
              <FieldHint label="Delivery radius" purpose="This gives us a practical view of how wide your normal fulfillment footprint is." example="Choose Within parish if most orders stay inside the same parish." />
              <SelectField name="deliveryRadius" value={selectedDeliveryRadius} onChange={(value) => setDraft((current) => ({ ...current, selectedDeliveryRadius: value }))} options={DELIVERY_RADIUS_OPTIONS} placeholder="Select delivery radius" required />
            </div>
            <div className="grid gap-2">
              <FieldHint label="Average order size" purpose="This helps us estimate dispatch complexity and rider suitability." example="Choose Food boxes if you mainly deliver prepared meals and combo boxes." />
              <SelectField name="averageOrderSize" value={selectedAverageOrderSize} onChange={(value) => setDraft((current) => ({ ...current, selectedAverageOrderSize: value }))} options={AVERAGE_ORDER_SIZE_OPTIONS} placeholder="Select average order size" />
            </div>
            <div className="grid gap-2">
              <FieldHint label="Fulfillment mode" purpose="This tells us whether you just need last-mile help or a broader pickup-and-delivery workflow." example="Choose Dispatch only if your team prepares the order and simply needs a rider dispatched." />
              <SelectField name="fulfillmentMode" value={selectedSlydeFulfillmentMode} onChange={(value) => setDraft((current) => ({ ...current, selectedSlydeFulfillmentMode: value }))} options={SLYDE_FULFILLMENT_OPTIONS} placeholder="Select fulfillment mode" />
            </div>
            <div className="grid gap-3 md:col-span-2">
              <FieldHint label="Package types" purpose="This helps ops understand what your team actually sends so we can match the right delivery workflow and rider expectations." example="A restaurant may choose Hot meals and Drink cups, while a pharmacy may choose Prescription bags and Document envelopes." />
              <div className={`rounded-[1rem] ${fieldIssues.selectedPackageTypes ? "border border-rose-300 bg-rose-50 p-3" : ""}`}>
                <MultiSelectChips
                name="packageTypes"
                options={packageTypeOptions}
                values={selectedPackageTypes}
                onToggle={(value) =>
                  setDraft((current) => ({
                    ...current,
                    selectedPackageTypes: current.selectedPackageTypes.includes(value)
                      ? current.selectedPackageTypes.filter((item) => item !== value)
                      : [...current.selectedPackageTypes, value],
                  }))
                }
                />
              </div>
            </div>
            <div className="grid gap-3 md:col-span-2">
              <FieldHint label="Pickup locations" purpose="We use this to understand whether your dispatches start from one branch or several pickup points." example="Add Main Store - 12 Main Street, Mandeville, Manchester and Kitchen Hub - 4 Market Lane, Santa Cruz, St. Elizabeth as separate pickup locations." />
              <div className={`rounded-[1.5rem] border bg-slate-50 p-5 ${fieldIssues.pickupLocations ? "border-rose-300 bg-rose-50" : "border-slate-200"}`}>
                {pickupLocations.map((location) => (
                  <input key={`pickup-location-${location}`} type="hidden" name="pickupLocations" value={location} />
                ))}
                <div className="grid gap-3 md:grid-cols-2">
                  <input className="field-input" value={pickupLocationLabel} onChange={(event) => setDraft((current) => ({ ...current, pickupLocationLabel: event.target.value }))} placeholder="Location label, e.g. Main Store" />
                  <input className="field-input" value={pickupLocationAddressLine} onChange={(event) => setDraft((current) => ({ ...current, pickupLocationAddressLine: event.target.value }))} placeholder="Address line" />
                  <SelectField
                    name="pickupLocationParishBuilder"
                    value={pickupLocationParish}
                    onChange={(value) => {
                      setDraft((current) => ({ ...current, pickupLocationParish: value, pickupLocationTown: "" }));
                    }}
                    options={Object.keys(PARISH_TOWNS)}
                    placeholder="Select parish"
                  />
                  <SelectField
                    name="pickupLocationTownBuilder"
                    value={pickupLocationTown}
                    onChange={(value) => setDraft((current) => ({ ...current, pickupLocationTown: value }))}
                    options={pickupLocationTownOptions}
                    placeholder={pickupLocationParish ? "Select town" : "Select parish first"}
                  />
                </div>
                <div className="mt-4">
                  <Button type="button" onClick={addPickupLocation} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add pickup location
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {pickupLocations.length ? pickupLocations.map((location) => (
                    <div key={location} className="flex items-center justify-between gap-3 rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                      <span>{location}</span>
                      <button type="button" onClick={() => setDraft((current) => ({ ...current, pickupLocations: current.pickupLocations.filter((item) => item !== location) }))} className="text-slate-400 hover:text-rose-600" aria-label={`Remove ${location}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )) : <p className="text-sm text-slate-500">No pickup locations added yet.</p>}
                </div>
              </div>
            </div>
            <div className={`grid gap-3 md:col-span-2 rounded-[1rem] ${fieldIssues.selectedOrderSources ? "border border-rose-300 bg-rose-50 p-3" : ""}`}>
              <FieldHint label="Order sources" purpose="This tells us where your customer demand already comes from so SLYDE can fit around your real business." example="Choose Instagram, WhatsApp, and Walk in if those are your live order sources today." />
              <MultiSelectChips
                name="orderSources"
                options={ORDER_SOURCE_OPTIONS.map((option) => option.replace(/_/g, " "))}
                values={selectedOrderSources}
                onToggle={(label) => {
                  const value = label.replace(/ /g, "_");
                  setDraft((current) => ({
                    ...current,
                    selectedOrderSources: current.selectedOrderSources.includes(value)
                      ? current.selectedOrderSources.filter((item) => item !== value)
                      : [...current.selectedOrderSources, value],
                  }));
                }}
              />
            </div>
            <div className="grid gap-3 md:col-span-2">
              <FieldHint
                label="Operational capabilities"
                purpose="These answers tell us what your team can confidently support from day one, so we shape the delivery workflow around real operations instead of assumptions."
                example="Turn on Same-day supported if orders placed before your cutoff can still go out today. Turn on Cash on delivery supported if your staff already accepts payment at drop-off."
              />
              {selectedCapabilities.map((value) => (
                <input key={`capability-${value}`} type="hidden" name={value} value="on" />
              ))}
              <ToggleChoiceCards
                items={[
                  {
                    key: "sameDaySupported",
                    label: "Same-day supported",
                    description: "Your team can prepare and release many orders on the same day they come in.",
                    example: "A lunch spot that receives orders at 11:00 AM and can still dispatch before 2:00 PM.",
                  },
                  {
                    key: "scheduledSupported",
                    label: "Scheduled supported",
                    description: "You want merchants or staff to queue deliveries for a later time slot or future date.",
                    example: "A bakery that wants tomorrow-morning deliveries booked the day before.",
                  },
                  {
                    key: "acceptsCOD",
                    label: "Cash on delivery supported",
                    description: "Your business is ready to let customers pay at delivery and reconcile that payment operationally.",
                    example: "A retail store that sends orders first and collects payment from the customer on handoff.",
                  },
                ]}
                values={selectedCapabilities}
                onToggle={(value) =>
                  setDraft((current) => ({
                    ...current,
                    selectedCapabilities: current.selectedCapabilities.includes(value)
                      ? current.selectedCapabilities.filter((item) => item !== value)
                      : [...current.selectedCapabilities, value],
                  }))
                }
              />
            </div>
            </section>
          )}

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <div>
            <Button type="submit" disabled={pending}>{pending ? "Submitting..." : "Continue Merchant Onboarding"}</Button>
          </div>
        </div>

        <aside id="application-summary" className="xl:sticky xl:top-8 xl:self-start scroll-mt-24">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Live Application Summary</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {track === "grabquik" ? "GrabQuik profile" : "SLYDE delivery profile"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This panel updates as the merchant makes selections so they can confirm the onboarding profile they are building before they submit.
            </p>

            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Readiness score</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{readinessPercent}%</p>
                </div>
                <p className="text-sm text-slate-600">{readinessCompletedCount} of {readinessChecks.length} key items complete</p>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#0f172a_0%,#2563eb_100%)] transition-all duration-500"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-slate-600">
                {readinessPercent === 100
                  ? "This application looks complete and ready for review."
                  : "Finish the remaining items below to make review faster and reduce onboarding back-and-forth."}
              </p>
            </div>

            <div className="mt-6 divide-y divide-slate-100">
              <SummaryLine label="Track" value={track === "grabquik" ? "Grow with GrabQuik" : "Use SLYDE for Delivery"} />
              <SummaryLine label="Business category" value={selectedCategory} />
              <SummaryLine label="Primary parish" value={selectedParish} />
              <SummaryLine label="Primary town" value={selectedTown} />
              <SummaryLine label="Order channels" value={selectedOrderChannels.length ? selectedOrderChannels.map((item) => item.replace(/_/g, " ")).join(", ") : undefined} />
              <SummaryLine label="Service areas" value={serviceAreas.length ? `${serviceAreas.length} selected` : undefined} />
              <SummaryLine label="Operating hours" value={operatingHoursSummary} />
              {track === "grabquik" ? (
                <>
                  <SummaryLine label="Storefront type" value="Marketplace onboarding" />
                  <SummaryLine label="Marketplace category" value={selectedApplicationCategory} />
                  <SummaryLine label="Fulfillment type" value={selectedGrabquikFulfillmentMode ? selectedGrabquikFulfillmentMode.replace(/_/g, " ") : undefined} />
                </>
              ) : (
                <>
                  <SummaryLine label="Dispatch mode" value={selectedDispatchMode.replace(/_/g, " ")} />
                  <SummaryLine label="Delivery radius" value={selectedDeliveryRadius} />
                  <SummaryLine label="Average order size" value={selectedAverageOrderSize} />
                  <SummaryLine label="Fulfillment mode" value={selectedSlydeFulfillmentMode ? selectedSlydeFulfillmentMode.replace(/_/g, " ") : undefined} />
                  <SummaryLine label="Package types" value={selectedPackageTypes.length ? selectedPackageTypes.join(", ") : undefined} />
                  <SummaryLine label="Pickup locations" value={pickupLocations.length ? `${pickupLocations.length} added` : undefined} />
                  <SummaryLine label="Capabilities" value={capabilityLabels.length ? capabilityLabels.join(", ") : undefined} />
                </>
              )}
            </div>

            <div className="mt-6 rounded-[1.35rem] border border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Missing items checklist</p>
              <div className="mt-3 space-y-2">
                {missingChecklistItems.length ? (
                  missingChecklistItems.map((item) => (
                    <div key={item.label} className="flex items-start gap-3 text-sm text-slate-600">
                      <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                      <span>{item.label}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-emerald-700">No missing items. This profile is ready to submit.</p>
                )}
              </div>
              <p className="mt-3 text-sm text-slate-600">
                The more complete this summary looks, the faster ops can route the business into the right onboarding path.
              </p>
            </div>

            <div className="mt-6 rounded-[1.35rem] border border-sky-200 bg-sky-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Smart suggestions</p>
              <div className="mt-3 space-y-3">
                {smartSuggestions.length ? (
                  smartSuggestions.map((suggestion) => (
                    <div key={suggestion} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-sky-600" />
                      <span>{suggestion}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No coaching suggestions right now. This profile already looks well aligned with the selections made so far.</p>
                )}
              </div>
            </div>
          </div>
        </aside>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur xl:hidden">
          <div className="mx-auto flex max-w-4xl items-center gap-3">
            <button
              type="button"
              onClick={saveDraftNow}
              className="inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Save draft
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {readinessPercent === 100 ? "Ready to submit" : `${readinessPercent}% complete`}
              </p>
              <p className="truncate text-sm text-slate-600">
                {lastSavedAt
                  ? `Last saved ${new Date(lastSavedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                  : "Draft autosave is on for this device"}
              </p>
            </div>
            <Button type="submit" disabled={pending} className="shrink-0">
              {pending ? "Submitting..." : "Continue"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
