import { prisma } from "@/server/db/prisma";
import type { OnboardingStore } from "@/types/backend/onboarding";
import type { PersistenceRepository } from "@/server/persistence/repository";

function notImplemented(method: string): never {
  throw new Error(`PrismaRepository.${method} is not implemented yet. Complete the store-to-relational mapping before enabling PERSISTENCE_DRIVER=prisma.`);
}

export class PrismaRepository implements PersistenceRepository {
  readonly driver = "prisma" as const;

  async readSnapshot(): Promise<OnboardingStore> {
    void prisma;
    return notImplemented("readSnapshot");
  }

  async transaction<T>(_mutator: (store: OnboardingStore) => Promise<T> | T): Promise<T> {
    void prisma;
    return notImplemented("transaction");
  }
}

export const prismaRepository = new PrismaRepository();
