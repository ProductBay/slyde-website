import type { OnboardingStore } from "@/types/backend/onboarding";

export type PersistenceDriver = "file" | "prisma";

export interface PersistenceRepository {
  readonly driver: PersistenceDriver;
  readSnapshot(): Promise<OnboardingStore>;
  transaction<T>(mutator: (store: OnboardingStore) => Promise<T> | T): Promise<T>;
}

export function getPersistenceDriver(): PersistenceDriver {
  return process.env.PERSISTENCE_DRIVER === "prisma" ? "prisma" : "file";
}
