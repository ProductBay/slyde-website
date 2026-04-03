"use client";

import { useMemo } from "react";
import { startTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import type { MerchantAddress } from "@/types/backend/onboarding";

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

export function MerchantAddressBook({ addresses }: { addresses: MerchantAddress[] }) {
  const [label, setLabel] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [parish, setParish] = useState("");
  const [town, setTown] = useState("");
  const [pending, setPending] = useState(false);
  const townOptions = useMemo(() => (parish ? PARISH_TOWNS[parish] ?? ["Other"] : []), [parish]);

  function submit() {
    setPending(true);
    startTransition(async () => {
      await fetch("/api/merchant/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pickup",
          label,
          contactName,
          contactPhone,
          addressLine,
          parish,
          town,
          isDefault: !addresses.length,
        }),
      });
      window.location.reload();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-950">Saved addresses</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Keep pickup and customer records clean so dispatches can be created faster with fewer repeated typing mistakes.
        </p>
        <div className="mt-5 space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{address.label}</p>
                  <p className="text-sm text-slate-600">{address.addressLine}</p>
                  <p className="text-sm text-slate-500">
                    {address.town}, {address.parish}
                  </p>
                </div>
                {address.isDefault ? <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">Default</span> : null}
              </div>
            </div>
          ))}
          {!addresses.length ? <p className="text-sm text-slate-500">No saved addresses yet.</p> : null}
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-950">Add pickup address</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Use guided location selections so your saved addresses stay consistent across the merchant workspace.</p>
        <div className="mt-4 grid gap-4">
          <input className="field-input" placeholder="Label, e.g. Main Store or Prep Kitchen" value={label} onChange={(event) => setLabel(event.target.value)} />
          <input className="field-input" placeholder="Contact name" value={contactName} onChange={(event) => setContactName(event.target.value)} />
          <input className="field-input" placeholder="Contact phone" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} />
          <textarea className="field-input min-h-24" placeholder="Address line and landmark details" value={addressLine} onChange={(event) => setAddressLine(event.target.value)} />
          <select className="field-input" value={parish} onChange={(event) => { setParish(event.target.value); setTown(""); }}>
            <option value="">Select parish</option>
            {Object.keys(PARISH_TOWNS).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select className="field-input" value={town} onChange={(event) => setTown(event.target.value)} disabled={!parish}>
            <option value="">{parish ? "Select town" : "Select parish first"}</option>
            {townOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Button type="button" disabled={pending} onClick={submit}>
            {pending ? "Saving..." : "Save address"}
          </Button>
        </div>
      </div>
    </div>
  );
}
