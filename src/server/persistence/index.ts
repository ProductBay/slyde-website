import type { OnboardingStore } from "@/types/backend/onboarding";
import { fileStoreRepository } from "@/server/persistence/file-store-repository";
import { prismaRepository } from "@/server/persistence/prisma-repository";
import { getPersistenceDriver } from "@/server/persistence/repository";

export function getPersistenceRepository() {
  return getPersistenceDriver() === "prisma" ? prismaRepository : fileStoreRepository;
}

export async function readPersistenceStore(): Promise<OnboardingStore> {
  return getPersistenceRepository().readSnapshot();
}

export async function withPersistenceTransaction<T>(mutator: (store: OnboardingStore) => Promise<T> | T): Promise<T> {
  return getPersistenceRepository().transaction(mutator);
}
