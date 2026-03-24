import type { OnboardingStore } from "@/types/backend/onboarding";
import type { PersistenceRepository } from "@/server/persistence/repository";
import { readStore, withStoreTransaction } from "@/server/persistence/store";

export class FileStoreRepository implements PersistenceRepository {
  readonly driver = "file" as const;

  async readSnapshot(): Promise<OnboardingStore> {
    return readStore();
  }

  async transaction<T>(mutator: (store: OnboardingStore) => Promise<T> | T): Promise<T> {
    return withStoreTransaction(mutator);
  }
}

export const fileStoreRepository = new FileStoreRepository();
