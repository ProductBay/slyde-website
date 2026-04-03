"use client";

import { CircleHelp, MapPin, Package, Truck, UserRound } from "lucide-react";
import { startTransition, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { MerchantAddress, PartnerCarrier, PartnerHandoffLocation } from "@/types/backend/onboarding";

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

const PACKAGE_TYPES = [
  { value: "documents", label: "Documents", description: "Envelopes, invoices, signed paperwork." },
  { value: "small_parcel", label: "Small parcel", description: "Compact bag or box for quick drop-offs." },
  { value: "food_order", label: "Food order", description: "Prepared meals, combos, cups, bakery boxes." },
  { value: "retail_bag", label: "Retail bag", description: "Fashion, beauty, pharmacy, and light retail." },
  { value: "fragile_item", label: "Fragile item", description: "Glass bottles, electronics, breakables." },
  { value: "bulk_box", label: "Bulk box", description: "Larger cartons, stock top-ups, branch transfers." },
  { value: "temperature_sensitive", label: "Temperature-sensitive", description: "Items that need extra handling." },
];

const ITEM_PRESETS = [
  "Lunch order and drinks",
  "Prescription package",
  "Retail order bag",
  "Documents for signature",
  "Beauty product order",
  "Branch stock refill",
];

const PAYMENT_OPTIONS = [
  { value: "prepaid", label: "Prepaid", description: "Customer already paid online, by transfer, or in store." },
  { value: "cash_on_delivery", label: "Cash on delivery", description: "Payment will be collected from the customer at handoff." },
];

const TIMING_OPTIONS = [
  { value: "asap", label: "ASAP", description: "Submit now and let SLYDE queue the request immediately." },
  { value: "scheduled", label: "Scheduled", description: "Plan a later dispatch window for this order." },
];

const FINAL_FULFILLMENT_OPTIONS = [
  {
    value: "customer_collection",
    label: "Customer collection",
    description: "Customer collects at the destination partner location.",
  },
  {
    value: "partner_final_delivery",
    label: "Partner delivery",
    description: "The transfer partner completes final delivery after transfer.",
  },
  {
    value: "slyde_final_mile",
    label: "SLYDE final-mile delivery",
    description: "SLYDE completes delivery once the shipment reaches the destination parish.",
  },
] as const;

function buildAddress(parts: Array<string | undefined>) {
  return parts.map((part) => part?.trim()).filter(Boolean).join(", ");
}

function FieldHint({ label, purpose, example }: { label: string; purpose: string; example: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <span className="field-label">{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-sky-300 hover:text-sky-700"
          aria-label={`Explain ${label}`}
          aria-expanded={open}
        >
          <CircleHelp className="h-4 w-4" />
        </button>
        {open ? (
          <div className="absolute right-0 top-8 z-20 w-72 rounded-[1rem] border border-sky-200 bg-white p-3 text-left text-sm text-slate-700 shadow-soft">
            <p>
              <span className="font-semibold text-slate-950">Purpose:</span> {purpose}
            </p>
            <p className="mt-2">
              <span className="font-semibold text-slate-950">Example:</span> {example}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SectionCard({
  icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-5 flex items-start gap-4">
        <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] bg-slate-950 text-white">
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function SelectionCards({
  value,
  options,
  onSelect,
  columns = "md:grid-cols-2",
}: {
  value: string;
  options: ReadonlyArray<{ value: string; label: string; description: string; disabled?: boolean }>;
  onSelect: (value: string) => void;
  columns?: string;
}) {
  return (
    <div className={`grid gap-3 ${columns}`}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={option.disabled}
            onClick={() => onSelect(option.value)}
            className={`rounded-[1.35rem] border px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
              active ? "border-slate-900 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
            }`}
          >
            <p className="text-sm font-semibold">{option.label}</p>
            <p className={`mt-2 text-sm ${active ? "text-slate-200" : "text-slate-500"}`}>{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export function QuickDispatchForm({
  pickupAddresses,
  customerAddresses,
  partnerCarriers,
  partnerLocationsByCarrierId,
  presentation = "page",
  onSuccess,
}: {
  pickupAddresses: MerchantAddress[];
  customerAddresses: MerchantAddress[];
  partnerCarriers: PartnerCarrier[];
  partnerLocationsByCarrierId: Record<string, PartnerHandoffLocation[]>;
  presentation?: "page" | "modal";
  onSuccess?: () => void;
}) {
  const isModal = presentation === "modal";
  const defaultPickupLocationId = pickupAddresses.find((item) => item.isDefault)?.id ?? "";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    deliveryType: "in_parish",
    customerName: "",
    customerPhone: "",
    savedCustomerAddressId: "",
    deliveryParish: "",
    deliveryTown: "",
    deliveryAddressLine: "",
    deliveryAddress: "",
    pickupLocationId: defaultPickupLocationId,
    pickupAddress: "",
    itemDescription: "",
    packageType: "",
    paymentType: "prepaid",
    codAmount: "",
    deliveryTiming: "asap",
    scheduledFor: "",
    destinationParish: "",
    destinationTown: "",
    transferPartnerId: "",
    partnerHandoffLocationId: "",
    finalFulfillmentMethod: "customer_collection",
    packageValue: "",
    specialHandlingNotes: "",
    riderNote: "",
    internalNote: "",
  });

  const isOutOfParish = form.deliveryType === "out_of_parish";
  const selectedCarrier = partnerCarriers.find((carrier) => carrier.id === form.transferPartnerId);
  const partnerLocations = form.transferPartnerId ? (partnerLocationsByCarrierId[form.transferPartnerId] ?? []) : [];
  const selectedPickupAddress = pickupAddresses.find((address) => address.id === form.pickupLocationId);
  const deliveryTownOptions = useMemo(
    () => (form.deliveryParish ? PARISH_TOWNS[form.deliveryParish] ?? ["Other"] : []),
    [form.deliveryParish],
  );
  const outOfParishTownOptions = useMemo(
    () => (form.destinationParish ? PARISH_TOWNS[form.destinationParish] ?? ["Other"] : []),
    [form.destinationParish],
  );
  const readinessChecks = [
    Boolean(form.customerName && form.customerPhone),
    Boolean(form.deliveryAddress),
    Boolean(form.pickupLocationId || form.pickupAddress),
    Boolean(form.itemDescription && form.packageType),
    Boolean(form.paymentType !== "cash_on_delivery" || form.codAmount),
    Boolean(form.deliveryTiming !== "scheduled" || form.scheduledFor),
    Boolean(!isOutOfParish || (form.destinationParish && form.transferPartnerId && form.finalFulfillmentMethod)),
  ];
  const readinessPercent = Math.round((readinessChecks.filter(Boolean).length / readinessChecks.length) * 100);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function applyCustomerAddress(addressId: string) {
    const address = customerAddresses.find((item) => item.id === addressId);
    if (!address) {
      setForm((current) => ({
        ...current,
        savedCustomerAddressId: "",
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      savedCustomerAddressId: address.id,
      customerName: current.customerName || address.contactName,
      customerPhone: current.customerPhone || address.contactPhone,
      deliveryParish: address.parish,
      deliveryTown: address.town,
      deliveryAddressLine: address.addressLine,
      deliveryAddress: buildAddress([address.addressLine, address.town, address.parish]),
    }));
  }

  function updateManualDeliveryAddress(next: Partial<typeof form>) {
    setForm((current) => {
      const merged = { ...current, ...next, savedCustomerAddressId: "" };
      return {
        ...merged,
        deliveryAddress: buildAddress([merged.deliveryAddressLine, merged.deliveryTown, merged.deliveryParish]),
      };
    });
  }

  function resetAfterSubmit() {
    setForm({
      deliveryType: "in_parish",
      customerName: "",
      customerPhone: "",
      savedCustomerAddressId: "",
      deliveryParish: "",
      deliveryTown: "",
      deliveryAddressLine: "",
      deliveryAddress: "",
      pickupLocationId: defaultPickupLocationId,
      pickupAddress: "",
      itemDescription: "",
      packageType: "",
      paymentType: "prepaid",
      codAmount: "",
      deliveryTiming: "asap",
      scheduledFor: "",
      destinationParish: "",
      destinationTown: "",
      transferPartnerId: "",
      partnerHandoffLocationId: "",
      finalFulfillmentMethod: "customer_collection",
      packageValue: "",
      specialHandlingNotes: "",
      riderNote: "",
      internalNote: "",
    });
  }

  function submit() {
    setPending(true);
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await fetch("/api/merchant/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          codAmount: form.codAmount ? Number(form.codAmount) : undefined,
          pickupLocationId: form.pickupLocationId || undefined,
          pickupAddress: form.pickupAddress || undefined,
          scheduledFor: form.scheduledFor || undefined,
          destinationParish: isOutOfParish ? form.destinationParish || undefined : undefined,
          destinationTown: isOutOfParish ? form.destinationTown || undefined : undefined,
          transferPartnerId: isOutOfParish ? form.transferPartnerId || undefined : undefined,
          partnerHandoffLocationId: isOutOfParish ? form.partnerHandoffLocationId || undefined : undefined,
          finalFulfillmentMethod: isOutOfParish ? form.finalFulfillmentMethod : undefined,
          packageValue: isOutOfParish && form.packageValue ? Number(form.packageValue) : undefined,
          specialHandlingNotes: isOutOfParish ? form.specialHandlingNotes || undefined : undefined,
        }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string; order?: { orderNumber: string } } | null;
      setPending(false);

      if (!response.ok) {
        setError(body?.error ?? "Unable to create dispatch.");
        return;
      }

      setSuccess(`Dispatch ${body?.order?.orderNumber ?? "request"} submitted.`);
      resetAfterSubmit();
      if (onSuccess) {
        window.setTimeout(() => {
          onSuccess();
          window.location.assign("/merchant/deliveries");
        }, 900);
      }
    });
  }

  const summaryLines = [
    { label: "Delivery type", value: isOutOfParish ? "Out-of-parish" : "In-parish" },
    { label: "Customer", value: form.customerName || "Pending" },
    { label: "Drop-off", value: form.deliveryAddress || "Pending" },
    {
      label: "Pickup",
      value: selectedPickupAddress
        ? `${selectedPickupAddress.label}${selectedPickupAddress.isDefault ? " (Default)" : ""}`
        : form.pickupAddress || "Pending",
    },
    {
      label: "Package",
      value: PACKAGE_TYPES.find((item) => item.value === form.packageType)?.label || "Pending",
    },
    {
      label: "Payment",
      value: form.paymentType === "cash_on_delivery" ? `Cash on delivery${form.codAmount ? ` - JMD ${form.codAmount}` : ""}` : "Prepaid",
    },
    {
      label: "Timing",
      value: form.deliveryTiming === "scheduled" && form.scheduledFor ? `Scheduled - ${form.scheduledFor}` : "ASAP",
    },
  ];

  if (isOutOfParish) {
    summaryLines.push(
      { label: "Destination parish", value: form.destinationParish || "Pending" },
      { label: "Transfer partner", value: selectedCarrier?.name || "Pending" },
      {
        label: "Final fulfillment",
        value: FINAL_FULFILLMENT_OPTIONS.find((item) => item.value === form.finalFulfillmentMethod)?.label || "Pending",
      },
    );
  }

  return (
    <div className={`grid gap-6 ${isModal ? "grid-cols-1" : "xl:grid-cols-[minmax(0,1.55fr)_22rem]"}`}>
      <div className="space-y-6">
        <div className={`rounded-[2rem] border border-slate-200 bg-white shadow-soft ${isModal ? "p-5" : "p-6"}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Quick dispatch</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {isModal ? "Dispatch from anywhere in the workspace" : "Create a delivery in under a minute"}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {isModal
                  ? "This mobile action keeps the core order workflow one tap away while still preserving the full SLYDE dispatch structure."
                  : "Use guided selections to move fast, reduce dispatch mistakes, and keep the request clean for ops."}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Dispatch readiness</p>
              <div className="mt-2 flex items-end gap-3">
                <span className="text-3xl font-semibold tracking-tight text-slate-950">{readinessPercent}%</span>
                <span className="pb-1 text-sm text-slate-600">of key fields ready</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#0f172a_0%,#2563eb_100%)] transition-all duration-300"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <SectionCard
          icon={<Truck className="h-5 w-5" />}
          eyebrow="Delivery mode"
          title="Choose the delivery workflow"
          description="Pick the fastest routing path first so the rest of the form adapts around the job."
        >
          <SelectionCards
            value={form.deliveryType}
            onSelect={(value) =>
              setForm((current) => ({
                ...current,
                deliveryType: value,
                destinationParish: value === "out_of_parish" ? current.destinationParish : "",
                destinationTown: value === "out_of_parish" ? current.destinationTown : "",
                transferPartnerId: value === "out_of_parish" ? current.transferPartnerId : "",
                partnerHandoffLocationId: value === "out_of_parish" ? current.partnerHandoffLocationId : "",
                finalFulfillmentMethod: value === "out_of_parish" ? current.finalFulfillmentMethod : "customer_collection",
                packageValue: value === "out_of_parish" ? current.packageValue : "",
                specialHandlingNotes: value === "out_of_parish" ? current.specialHandlingNotes : "",
              }))
            }
            options={[
              {
                value: "in_parish",
                label: "In-parish delivery",
                description: "Standard SLYDE pickup and delivery inside the same parish.",
              },
              {
                value: "out_of_parish",
                label: "Out-of-parish delivery",
                description: "SLYDE pickup with transfer-partner movement across parishes.",
              },
            ]}
          />
        </SectionCard>

        <SectionCard
          icon={<UserRound className="h-5 w-5" />}
          eyebrow="Customer"
          title="Customer and destination"
          description="Use a saved customer address when possible, or build a clean delivery address with guided location selections."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="field-shell md:col-span-2">
              <FieldHint
                label="Saved customer address"
                purpose="This lets your team reuse a delivery profile instead of typing details again."
                example="Choose the office or returning customer record if this is someone you deliver to often."
              />
              <select className="field-input" value={form.savedCustomerAddressId} onChange={(event) => applyCustomerAddress(event.target.value)}>
                <option value="">Build a new destination</option>
                {customerAddresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.label} - {address.town}, {address.parish}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-shell">
              <FieldHint
                label="Customer name"
                purpose="Ops and support use this to match the order with the right recipient."
                example="Use the actual recipient name, not just the company or store nickname."
              />
              <input className="field-input" value={form.customerName} onChange={(event) => update("customerName", event.target.value)} />
            </label>
            <label className="field-shell">
              <FieldHint
                label="Customer phone"
                purpose="This gives the rider or support team a direct number if they need delivery confirmation."
                example="Use the phone number the customer actively answers on delivery day."
              />
              <input className="field-input" value={form.customerPhone} onChange={(event) => update("customerPhone", event.target.value)} />
            </label>

            <label className="field-shell">
              <FieldHint
                label="Destination parish"
                purpose="This helps route the job correctly, especially if delivery leaves the merchant's normal area."
                example="Choose St. James if the customer is in Montego Bay."
              />
              <select
                className="field-input"
                value={form.deliveryParish}
                onChange={(event) => updateManualDeliveryAddress({ deliveryParish: event.target.value, deliveryTown: "" })}
              >
                <option value="">Select parish</option>
                {Object.keys(PARISH_TOWNS).map((parish) => (
                  <option key={parish} value={parish}>
                    {parish}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-shell">
              <FieldHint
                label="Destination town"
                purpose="This narrows the delivery area before the rider reaches the exact address."
                example="Choose New Kingston, Portmore, or Ocho Rios where applicable."
              />
              <select
                className="field-input"
                value={form.deliveryTown}
                onChange={(event) => updateManualDeliveryAddress({ deliveryTown: event.target.value })}
                disabled={!form.deliveryParish}
              >
                <option value="">{form.deliveryParish ? "Select town" : "Select parish first"}</option>
                {deliveryTownOptions.map((town) => (
                  <option key={town} value={town}>
                    {town}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-shell md:col-span-2">
              <FieldHint
                label="Address line"
                purpose="Use the street, shop, apartment, gate, or landmark details needed for a successful drop-off."
                example="Shop 8, Sovereign Centre, Hope Road or 24 Main Street, Apt 3, blue gate."
              />
              <textarea
                className="field-input min-h-24"
                value={form.deliveryAddressLine}
                onChange={(event) => updateManualDeliveryAddress({ deliveryAddressLine: event.target.value })}
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard
          icon={<Package className="h-5 w-5" />}
          eyebrow="Package and payment"
          title="Tell ops what is moving"
          description="Use guided package and payment selections so the dispatch lands in queue with the right context."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="field-shell">
              <FieldHint
                label="Pickup location"
                purpose="Use a saved pickup point if this order starts from a known branch, kitchen, or dispatch desk."
                example="Choose Main Store (Default) for your normal dispatch origin."
              />
              <select
                className="field-input"
                value={form.pickupLocationId}
                onChange={(event) => update("pickupLocationId", event.target.value)}
              >
                <option value="">Use manual pickup address</option>
                {pickupAddresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.label} {address.isDefault ? "(Default)" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-shell">
              <FieldHint
                label="Manual pickup address"
                purpose="Use this when the dispatch starts from a one-off location that is not already saved."
                example="Roadside stall at 14 Orange Street or pop-up booth at Devon House."
              />
              <input className="field-input" value={form.pickupAddress} onChange={(event) => update("pickupAddress", event.target.value)} />
            </label>

            <label className="field-shell md:col-span-2">
              <FieldHint
                label="Item description"
                purpose="This helps riders and support teams understand what is in the order without needing the full internal sales record."
                example="Two lunch boxes, one juice, and one pastry box."
              />
              <input className="field-input" value={form.itemDescription} onChange={(event) => update("itemDescription", event.target.value)} />
              <div className="mt-3 flex flex-wrap gap-2">
                {ITEM_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => update("itemDescription", preset)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </label>

            <label className="field-shell">
              <FieldHint
                label="Package type"
                purpose="This keeps dispatch classification consistent and reduces guesswork for ops."
                example="Choose Food order for meals, Small parcel for compact boxed items, or Fragile item for breakables."
              />
              <select className="field-input" value={form.packageType} onChange={(event) => update("packageType", event.target.value)}>
                <option value="">Select package type</option>
                {PACKAGE_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {form.packageType ? (
                <p className="mt-2 text-xs text-slate-500">
                  {PACKAGE_TYPES.find((item) => item.value === form.packageType)?.description}
                </p>
              ) : null}
            </label>

            <div className="field-shell">
              <FieldHint
                label="Payment type"
                purpose="This determines whether COD handling and reconciliation details are needed."
                example="Choose Prepaid if the merchant already collected payment before dispatch."
              />
              <SelectionCards
                value={form.paymentType}
                onSelect={(value) => update("paymentType", value)}
                options={PAYMENT_OPTIONS}
                columns="grid-cols-1"
              />
            </div>

            {form.paymentType === "cash_on_delivery" ? (
              <label className="field-shell">
                <FieldHint
                  label="COD amount"
                  purpose="This gives ops and support the amount expected from the customer at delivery."
                  example="Enter the amount the customer must pay on handoff, such as 4500."
                />
                <input className="field-input" inputMode="decimal" value={form.codAmount} onChange={(event) => update("codAmount", event.target.value)} />
              </label>
            ) : null}

            <div className="field-shell">
              <FieldHint
                label="Dispatch timing"
                purpose="This tells the queue whether to work the order now or hold it for a future release."
                example="Choose Scheduled if this order should leave at 4:30 PM instead of immediately."
              />
              <SelectionCards
                value={form.deliveryTiming}
                onSelect={(value) => update("deliveryTiming", value)}
                options={TIMING_OPTIONS}
                columns="grid-cols-1"
              />
            </div>

            {form.deliveryTiming === "scheduled" ? (
              <label className="field-shell md:col-span-2">
                <FieldHint
                  label="Scheduled for"
                  purpose="Choose the requested dispatch date and time when the order should enter active operations."
                  example="Use this for prebooked office lunch runs or tomorrow-morning bakery drops."
                />
                <input
                  className="field-input"
                  type="datetime-local"
                  value={form.scheduledFor}
                  onChange={(event) => update("scheduledFor", event.target.value)}
                />
              </label>
            ) : null}
          </div>
        </SectionCard>

        {isOutOfParish ? (
          <SectionCard
            icon={<MapPin className="h-5 w-5" />}
            eyebrow="Out-of-parish plan"
            title="Transfer partner and destination setup"
            description="Keep the out-of-parish flow simple: choose the partner, destination, and how the final handoff should happen."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="field-shell">
                <FieldHint
                  label="Destination parish"
                  purpose="This tells SLYDE where the inter-parish movement needs to end."
                  example="Choose Manchester if the order is leaving Kingston and ending in Mandeville."
                />
                <select
                  className="field-input"
                  value={form.destinationParish}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      destinationParish: event.target.value,
                      destinationTown: "",
                    }));
                  }}
                >
                  <option value="">Select destination parish</option>
                  {Object.keys(PARISH_TOWNS).map((parish) => (
                    <option key={parish} value={parish}>
                      {parish}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field-shell">
                <FieldHint
                  label="Destination town"
                  purpose="Use this when you know the main town or handoff area at destination."
                  example="Choose Mandeville, Montego Bay, or Ocho Rios."
                />
                <select
                  className="field-input"
                  value={form.destinationTown}
                  onChange={(event) => update("destinationTown", event.target.value)}
                  disabled={!form.destinationParish}
                >
                  <option value="">{form.destinationParish ? "Select destination town" : "Select parish first"}</option>
                  {outOfParishTownOptions.map((town) => (
                    <option key={town} value={town}>
                      {town}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field-shell">
                <FieldHint
                  label="Transfer partner"
                  purpose="This chooses the carrier that will handle the inter-parish movement."
                  example="Choose Knutsford Express or another configured transfer partner."
                />
                <select
                  className="field-input"
                  value={form.transferPartnerId}
                  onChange={(event) =>
                    setForm((current) => {
                      const carrier = partnerCarriers.find((item) => item.id === event.target.value);
                      return {
                        ...current,
                        transferPartnerId: event.target.value,
                        partnerHandoffLocationId: "",
                        finalFulfillmentMethod:
                          current.finalFulfillmentMethod === "partner_final_delivery" && carrier && !carrier.supportsFinalDelivery
                            ? "customer_collection"
                            : current.finalFulfillmentMethod,
                      };
                    })
                  }
                >
                  <option value="">Select transfer partner</option>
                  {partnerCarriers.map((carrier) => (
                    <option key={carrier.id} value={carrier.id}>
                      {carrier.name}
                    </option>
                  ))}
                </select>
                {selectedCarrier ? (
                  <p className="mt-2 text-xs text-slate-500">
                    {selectedCarrier.supportsBranchCollection ? "Supports customer collection" : "Collection requires SLYDE final-mile"} |{" "}
                    {selectedCarrier.supportsFinalDelivery ? "Supports partner final delivery" : "No partner final delivery"}
                  </p>
                ) : null}
              </label>

              <label className="field-shell">
                <FieldHint
                  label="Partner handoff location"
                  purpose="Use a configured branch or handoff location when the selected partner requires a defined drop point."
                  example="Choose the branch where the SLYDE rider should hand over the package."
                />
                <select
                  className="field-input"
                  value={form.partnerHandoffLocationId}
                  onChange={(event) => update("partnerHandoffLocationId", event.target.value)}
                  disabled={!form.transferPartnerId}
                >
                  <option value="">{partnerLocations.length ? "Select handoff location" : "No handoff location required"}</option>
                  {partnerLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.town}, {location.parish}
                    </option>
                  ))}
                </select>
              </label>

              <div className="field-shell md:col-span-2">
                <FieldHint
                  label="Final fulfillment method"
                  purpose="This tells SLYDE what happens after the transfer partner moves the package to the destination parish."
                  example="Choose Customer collection when the receiver will pick up from the partner branch."
                />
                <SelectionCards
                  value={form.finalFulfillmentMethod}
                  onSelect={(value) => update("finalFulfillmentMethod", value)}
                  options={FINAL_FULFILLMENT_OPTIONS.map((option) => ({
                    ...option,
                    disabled:
                      !selectedCarrier ||
                      (option.value === "customer_collection" && !selectedCarrier.supportsBranchCollection) ||
                      (option.value === "partner_final_delivery" && !selectedCarrier.supportsFinalDelivery),
                  }))}
                  columns="md:grid-cols-3"
                />
              </div>

              <label className="field-shell">
                <FieldHint
                  label="Package value"
                  purpose="Use this when the shipment value matters for partner handling or internal ops review."
                  example="Enter the declared package value if the shipment is higher value or fragile."
                />
                <input className="field-input" inputMode="decimal" value={form.packageValue} onChange={(event) => update("packageValue", event.target.value)} />
              </label>

              <label className="field-shell">
                <FieldHint
                  label="Special handling notes"
                  purpose="Use this for anything the pickup, partner handoff, or destination handoff should know."
                  example="Keep upright, collect from branch back door, or call recipient before partner drop-off."
                />
                <input className="field-input" value={form.specialHandlingNotes} onChange={(event) => update("specialHandlingNotes", event.target.value)} />
              </label>
            </div>
          </SectionCard>
        ) : null}

        <SectionCard
          icon={<MapPin className="h-5 w-5" />}
          eyebrow="Ops notes"
          title="Optional notes for dispatch and support"
          description="Use these fields only when they will improve execution. Keep them short and action-focused."
        >
          <div className="grid gap-4">
            <label className="field-shell">
              <FieldHint
                label="Rider note"
                purpose="Use this for delivery-facing guidance only."
                example="Call on arrival, use side entrance, or ask security for unit 12."
              />
              <textarea className="field-input min-h-20" value={form.riderNote} onChange={(event) => update("riderNote", event.target.value)} />
            </label>
            <label className="field-shell">
              <FieldHint
                label="Internal note"
                purpose="Use this for merchant-side operational context that should stay inside your dispatch history."
                example="VIP customer, duplicate of phone order, or hold until store manager confirms stock."
              />
              <textarea className="field-input min-h-20" value={form.internalNote} onChange={(event) => update("internalNote", event.target.value)} />
            </label>
          </div>
        </SectionCard>

        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          Quote preview placeholder: pricing can later plug in local pickup, inter-parish transfer, and final-mile totals without changing the form workflow.
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={submit} disabled={pending}>
            {pending ? "Submitting..." : "Submit dispatch"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => window.location.assign("/merchant/orders")}>
            View queue
          </Button>
        </div>
      </div>

      <aside className={isModal ? "space-y-4" : "xl:sticky xl:top-6 xl:self-start"}>
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Dispatch summary</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Ready before you submit</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This panel shows the operational shape of the request so the merchant can spot missing details before sending it to queue.
          </p>

          <div className="mt-6 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Completion</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <span className="text-3xl font-semibold tracking-tight text-slate-950">{readinessPercent}%</span>
              <span className="text-sm text-slate-600">
                {readinessChecks.filter(Boolean).length} of {readinessChecks.length} checks ready
              </span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#0f172a_0%,#2563eb_100%)] transition-all duration-300"
                style={{ width: `${readinessPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-6 divide-y divide-slate-100">
            {summaryLines.map((line) => (
              <SummaryRow key={line.label} label={line.label} value={line.value} />
            ))}
          </div>

          <div className="mt-6 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Workflow guidance</p>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <p>Use saved pickup and customer addresses whenever possible to keep requests faster and more consistent.</p>
              <p>Choose package and payment types from the guided options so ops can triage the dispatch correctly on first review.</p>
              {isOutOfParish ? (
                <p>Out-of-parish requests should always leave with a clear transfer partner and final fulfillment method before submission.</p>
              ) : null}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
