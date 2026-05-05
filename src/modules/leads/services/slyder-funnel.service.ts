import * as repo from "@/modules/leads/repositories/slyder-lead.repository";

export async function getSlyderFunnelMetrics() {
  return repo.getFunnelMetrics();
}
