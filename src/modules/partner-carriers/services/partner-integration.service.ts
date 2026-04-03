import type { DeliveryLeg, PartnerCarrier } from "@/types/backend/onboarding";

export async function requestPartnerShipment(input: {
  carrier: PartnerCarrier;
  leg: DeliveryLeg;
}) {
  return {
    integrated: false,
    mode: input.carrier.supportsApi ? "api_ready" : "manual_assisted",
    trackingReference: input.leg.partnerTrackingReference,
    notes: "Partner shipment creation remains behind the integration seam until live carrier API credentials are configured.",
  };
}

export async function fetchPartnerTracking(input: {
  carrier: PartnerCarrier;
  trackingReference: string;
}) {
  return {
    integrated: false,
    mode: input.carrier.supportsApi ? "api_ready" : "manual_assisted",
    trackingReference: input.trackingReference,
    events: [],
  };
}
