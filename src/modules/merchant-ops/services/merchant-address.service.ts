import crypto from "node:crypto";
import type { MerchantAddress, MerchantAddressUpsertInput } from "@/types/backend/onboarding";
import {
  deleteMerchantAddress,
  findMerchantAddressForMerchant,
  listMerchantAddressesForMerchant,
  saveMerchantAddress,
  setMerchantDefaultAddress,
} from "@/modules/merchant-ops/repositories/merchant-ops.repository";

function nowIso() {
  return new Date().toISOString();
}

export async function listMerchantAddresses(merchantId: string) {
  return listMerchantAddressesForMerchant(merchantId);
}

export async function createMerchantAddress(merchantId: string, input: MerchantAddressUpsertInput) {
  const timestamp = nowIso();
  const address: MerchantAddress = {
    id: crypto.randomUUID(),
    merchantId,
    type: input.type,
    label: input.label,
    contactName: input.contactName,
    contactPhone: input.contactPhone,
    addressLine: input.addressLine,
    parish: input.parish,
    town: input.town,
    notes: input.notes,
    isDefault: input.isDefault ?? false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const saved = await saveMerchantAddress(address);
  if (saved.isDefault) {
    await setMerchantDefaultAddress(merchantId, saved.id);
  }
  return saved;
}

export async function updateMerchantAddressRecord(
  merchantId: string,
  addressId: string,
  input: MerchantAddressUpsertInput,
) {
  const existing = await findMerchantAddressForMerchant(addressId, merchantId);
  if (!existing) throw new Error("Address not found");

  const updated = await saveMerchantAddress({
    ...existing,
    ...input,
    updatedAt: nowIso(),
  });

  if (updated.isDefault) {
    await setMerchantDefaultAddress(merchantId, updated.id);
  }

  return updated;
}

export async function removeMerchantAddress(merchantId: string, addressId: string) {
  const existing = await findMerchantAddressForMerchant(addressId, merchantId);
  if (!existing) throw new Error("Address not found");
  await deleteMerchantAddress(addressId);
}

export async function markMerchantAddressAsDefault(merchantId: string, addressId: string) {
  const existing = await findMerchantAddressForMerchant(addressId, merchantId);
  if (!existing) throw new Error("Address not found");
  await setMerchantDefaultAddress(merchantId, addressId);
  return findMerchantAddressForMerchant(addressId, merchantId);
}
