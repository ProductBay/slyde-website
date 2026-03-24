import { getLegalRegistryItem, legalCategories, merchantLegalCheckboxes, slyderLegalCheckboxes } from "@/content/legal";
import { withStoreTransaction, readStore } from "@/server/persistence/store";
import type { OnboardingStore } from "@/types/backend/onboarding";
import type {
  AcceptanceSource,
  LegalAcceptance,
  LegalActorType,
  LegalDocument,
  LegalDocumentPublishHistory,
  LegalDocumentStatus,
  LegalDocumentType,
} from "@/types/backend/onboarding";

export type LegalContextKey =
  | "slyder_application"
  | "merchant_interest"
  | "slyder_activation"
  | "merchant_onboarding"
  | "public_signup"
  | "policy_reacceptance";

const contextRequirements: Record<LegalContextKey, LegalDocumentType[]> = {
  slyder_application: ["slyder_privacy_notice", "slyder_onboarding_terms"],
  merchant_interest: ["merchant_privacy_notice", "merchant_interest_terms"],
  slyder_activation: ["slyder_activation_terms"],
  merchant_onboarding: ["merchant_privacy_notice", "merchant_interest_terms", "merchant_platform_terms"],
  public_signup: [],
  policy_reacceptance: [],
};

function nowIso() {
  return new Date().toISOString();
}

function buildCheckboxSnapshot(documentType: LegalDocumentType) {
  if (documentType === "merchant_interest_terms") return merchantLegalCheckboxes.onboardingTerms;
  if (documentType === "merchant_privacy_notice") return merchantLegalCheckboxes.privacyNotice;
  if (documentType === "slyder_privacy_notice") return slyderLegalCheckboxes.privacyNotice;
  if (documentType === "slyder_onboarding_terms") return slyderLegalCheckboxes.onboardingTerms;
  if (documentType === "slyder_activation_terms") return slyderLegalCheckboxes.activationTerms;
  return undefined;
}

function getActorTypesForContext(context: LegalContextKey): LegalActorType[] {
  if (context === "slyder_application") return ["slyder_applicant"];
  if (context === "slyder_activation") return ["slyder_user"];
  if (context === "merchant_interest") return ["merchant_interest"];
  if (context === "merchant_onboarding") return ["merchant_user"];
  return ["public_user"];
}

export async function listLegalDocuments(filters?: {
  category?: string;
  documentType?: string;
  status?: LegalDocumentStatus | "";
  active?: string;
  actorScope?: string;
}) {
  const store = await readStore();
  let items = store.legalDocuments.map((document) => {
    const acceptanceCount = store.legalAcceptances.filter(
      (acceptance) => acceptance.documentType === document.documentType && acceptance.documentVersion === document.version,
    ).length;
    return { ...document, acceptanceCount };
  });

  if (filters?.category) items = items.filter((item) => item.categoryKey === filters.category);
  if (filters?.documentType) items = items.filter((item) => item.documentType === filters.documentType);
  if (filters?.status) items = items.filter((item) => item.status === filters.status);
  if (filters?.active) items = items.filter((item) => String(item.isActive) === filters.active);
  if (filters?.actorScope) items = items.filter((item) => item.actorScopes.includes(filters.actorScope as LegalActorType));

  items.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  return items;
}

export async function getLegalDocumentById(documentId: string) {
  const store = await readStore();
  const document = store.legalDocuments.find((item) => item.id === documentId) ?? null;
  const history = store.legalPublishHistory.filter((item) => item.legalDocumentId === documentId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { document, history };
}

export async function getPublishedLegalDocumentVersions(typeKey: LegalDocumentType) {
  const store = await readStore();
  return store.legalDocuments
    .filter((item) => item.documentType === typeKey && item.status !== "draft")
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function getActiveLegalDocumentByType(typeKey: LegalDocumentType) {
  const store = await readStore();
  return store.legalDocuments.find((item) => item.documentType === typeKey && item.isActive && item.status === "published") ?? null;
}

export async function getActiveLegalDocumentBySlug(slug: string) {
  const store = await readStore();
  return store.legalDocuments.find((item) => item.slug === slug && item.status === "published" && item.isActive) ?? null;
}

export async function getLegalIndex() {
  const store = await readStore();
  return legalCategories.map((category) => ({
    ...category,
    documents: store.legalDocuments
      .filter((item) => item.categoryKey === category.key && item.status === "published" && item.isActive)
      .sort((left, right) => left.title.localeCompare(right.title)),
  }));
}

export async function getRequiredLegalDocumentsForContext(context: LegalContextKey) {
  const typeKeys = contextRequirements[context] ?? [];
  const documents = await Promise.all(typeKeys.map((typeKey) => getActiveLegalDocumentByType(typeKey)));
  return documents.filter(Boolean) as LegalDocument[];
}

export async function validateRequiredAcceptances(
  context: LegalContextKey,
  submittedFlags: { acceptedDocumentTypes: LegalDocumentType[] },
) {
  const requiredDocs = await getRequiredLegalDocumentsForContext(context);
  const missing = requiredDocs.filter((document) => !submittedFlags.acceptedDocumentTypes.includes(document.documentType));
  if (missing.length) {
    throw new Error(`Required legal documents not accepted: ${missing.map((item) => item.documentType).join(", ")}`);
  }
  return requiredDocs;
}

export async function recordLegalAcceptance(input: {
  actorType: LegalActorType;
  actorId: string;
  document: LegalDocument;
  acceptanceSource: AcceptanceSource;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}) {
  return withStoreTransaction(async (store) => {
    const existing = store.legalAcceptances.find(
      (acceptance) =>
        acceptance.actorType === input.actorType &&
        acceptance.actorId === input.actorId &&
        acceptance.documentId === input.document.id &&
        acceptance.documentVersion === input.document.version,
    );
    if (existing) return existing;

    const acceptance: LegalAcceptance = {
      id: crypto.randomUUID(),
      actorType: input.actorType,
      actorId: input.actorId,
      documentId: input.document.id,
      documentType: input.document.documentType,
      documentTitleSnapshot: input.document.title,
      documentVersion: input.document.version,
      acceptedAt: nowIso(),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      acceptanceSource: input.acceptanceSource,
      checkboxLabelSnapshot: buildCheckboxSnapshot(input.document.documentType),
      metadata: input.metadata,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    store.legalAcceptances.push(acceptance);
    return acceptance;
  });
}

export async function recordMultipleLegalAcceptances(input: {
  actorType: LegalActorType;
  actorId: string;
  context: LegalContextKey;
  acceptedDocumentTypes: LegalDocumentType[];
  acceptanceSource: AcceptanceSource;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}) {
  const requiredDocs = await validateRequiredAcceptances(input.context, {
    acceptedDocumentTypes: input.acceptedDocumentTypes,
  });

  const relevantDocs = requiredDocs.filter((doc) => input.acceptedDocumentTypes.includes(doc.documentType));
  const created: LegalAcceptance[] = [];
  for (const document of relevantDocs) {
    created.push(
      await recordLegalAcceptance({
        actorType: input.actorType,
        actorId: input.actorId,
        document,
        acceptanceSource: input.acceptanceSource,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        metadata: input.metadata,
      }),
    );
  }
  return created;
}

export async function recordMultipleLegalAcceptancesInStore(
  store: OnboardingStore,
  input: {
    actorType: LegalActorType;
    actorId: string;
    context: LegalContextKey;
    acceptedDocumentTypes: LegalDocumentType[];
    acceptanceSource: AcceptanceSource;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  },
) {
  const requiredDocs = contextRequirements[input.context]
    .map((typeKey) => store.legalDocuments.find((item) => item.documentType === typeKey && item.isActive && item.status === "published"))
    .filter(Boolean) as LegalDocument[];

  const missing = requiredDocs.filter((document) => !input.acceptedDocumentTypes.includes(document.documentType));
  if (missing.length) {
    throw new Error(`Required legal documents not accepted: ${missing.map((item) => item.documentType).join(", ")}`);
  }

  const created: LegalAcceptance[] = [];
  for (const document of requiredDocs) {
    const existing = store.legalAcceptances.find(
      (acceptance) =>
        acceptance.actorType === input.actorType &&
        acceptance.actorId === input.actorId &&
        acceptance.documentId === document.id &&
        acceptance.documentVersion === document.version,
    );
    if (existing) {
      created.push(existing);
      continue;
    }

    const acceptance: LegalAcceptance = {
      id: crypto.randomUUID(),
      actorType: input.actorType,
      actorId: input.actorId,
      documentId: document.id,
      documentType: document.documentType,
      documentTitleSnapshot: document.title,
      documentVersion: document.version,
      acceptedAt: nowIso(),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      acceptanceSource: input.acceptanceSource,
      checkboxLabelSnapshot: buildCheckboxSnapshot(document.documentType),
      metadata: input.metadata,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    store.legalAcceptances.push(acceptance);
    created.push(acceptance);
  }

  return created;
}

export async function hasAcceptedCurrentVersion(actorType: LegalActorType, actorId: string, typeKey: LegalDocumentType) {
  const [document, store] = await Promise.all([getActiveLegalDocumentByType(typeKey), readStore()]);
  if (!document) return true;
  return store.legalAcceptances.some(
    (acceptance) =>
      acceptance.actorType === actorType &&
      acceptance.actorId === actorId &&
      acceptance.documentType === typeKey &&
      acceptance.documentVersion === document.version,
  );
}

export async function getPendingLegalRequirements(actorType: LegalActorType, actorId: string, context: LegalContextKey) {
  const required = await getRequiredLegalDocumentsForContext(context);
  const store = await readStore();
  return required.filter(
    (document) =>
      !store.legalAcceptances.some(
        (acceptance) =>
          acceptance.actorType === actorType &&
          acceptance.actorId === actorId &&
          acceptance.documentType === document.documentType &&
          acceptance.documentVersion === document.version,
      ),
  );
}

export async function actorNeedsReacceptance(actorType: LegalActorType, actorId: string, typeKey: LegalDocumentType) {
  return !(await hasAcceptedCurrentVersion(actorType, actorId, typeKey));
}

export async function getPendingUpdatedLegalDocs(actorType: LegalActorType, actorId: string) {
  const store = await readStore();
  const relevantTypes = store.legalDocuments
    .filter((document) => document.isActive && document.status === "published" && document.actorScopes.includes(actorType))
    .map((document) => document.documentType);
  const uniqueTypes = Array.from(new Set(relevantTypes));

  const pending = await Promise.all(
    uniqueTypes.map(async (typeKey) => ((await actorNeedsReacceptance(actorType, actorId, typeKey)) ? getActiveLegalDocumentByType(typeKey) : null)),
  );
  return pending.filter(Boolean) as LegalDocument[];
}

export async function enforceLegalReacceptanceBeforeAction(actorType: LegalActorType, actorId: string, context: LegalContextKey) {
  const pending = await getPendingLegalRequirements(actorType, actorId, context);
  if (pending.length) {
    throw new Error(`Updated legal acceptance required for: ${pending.map((item) => item.title).join(", ")}`);
  }
}

function appendHistory(history: LegalDocumentPublishHistory[], record: Omit<LegalDocumentPublishHistory, "id" | "createdAt">) {
  history.push({
    id: crypto.randomUUID(),
    createdAt: nowIso(),
    ...record,
  });
}

export async function createLegalDocumentDraft(input: {
  documentType: LegalDocumentType;
  title?: string;
  slug?: string;
  version: string;
  summary?: string;
  excerpt?: string;
  contentMarkdown: string;
  createdBy?: string;
}) {
  const registry = getLegalRegistryItem(input.documentType);
  if (!registry) throw new Error("Unknown legal document type");

  return withStoreTransaction(async (store) => {
    const document: LegalDocument = {
      id: crypto.randomUUID(),
      documentType: input.documentType,
      categoryKey: registry.categoryKey,
      actorScopes: registry.actorScopes,
      requiresAcceptance: registry.requiresAcceptance,
      version: input.version,
      title: input.title || registry.title,
      slug: input.slug || registry.slug,
      summary: input.summary || registry.summary,
      excerpt: input.excerpt || registry.excerpt,
      contentMarkdown: input.contentMarkdown,
      status: "draft",
      isActive: false,
      createdBy: input.createdBy,
      updatedBy: input.createdBy,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    store.legalDocuments.push(document);
    appendHistory(store.legalPublishHistory, {
      legalDocumentId: document.id,
      action: "created",
      actedBy: input.createdBy,
    });
    return document;
  });
}

export async function updateLegalDocument(documentId: string, input: Partial<Pick<LegalDocument, "title" | "slug" | "version" | "summary" | "excerpt" | "contentMarkdown" | "effectiveFrom">> & { updatedBy?: string }) {
  return withStoreTransaction(async (store) => {
    const document = store.legalDocuments.find((item) => item.id === documentId);
    if (!document) throw new Error("Legal document not found");
    if (document.status !== "draft") throw new Error("Only draft documents can be edited directly.");

    Object.assign(document, {
      ...input,
      updatedBy: input.updatedBy,
      updatedAt: nowIso(),
    });

    appendHistory(store.legalPublishHistory, {
      legalDocumentId: document.id,
      action: "updated",
      actedBy: input.updatedBy,
    });
    return document;
  });
}

export async function publishLegalDocument(documentId: string, actedBy?: string) {
  return withStoreTransaction(async (store) => {
    const document = store.legalDocuments.find((item) => item.id === documentId);
    if (!document) throw new Error("Legal document not found");
    document.status = "published";
    document.publishedAt = document.publishedAt || nowIso();
    document.updatedBy = actedBy;
    document.updatedAt = nowIso();
    appendHistory(store.legalPublishHistory, {
      legalDocumentId: document.id,
      action: "published",
      actedBy,
    });
    return document;
  });
}

export async function activateLegalDocumentVersion(documentId: string, actedBy?: string) {
  return withStoreTransaction(async (store) => {
    const document = store.legalDocuments.find((item) => item.id === documentId);
    if (!document) throw new Error("Legal document not found");
    if (document.status !== "published") throw new Error("Only published documents can be activated.");

    for (const item of store.legalDocuments) {
      if (item.documentType === document.documentType && item.isActive && item.id !== document.id) {
        item.isActive = false;
        item.updatedAt = nowIso();
        item.updatedBy = actedBy;
        appendHistory(store.legalPublishHistory, {
          legalDocumentId: item.id,
          action: "deactivated",
          actedBy,
          note: `Replaced by ${document.version}`,
        });
      }
    }

    document.isActive = true;
    document.effectiveFrom = nowIso();
    document.updatedAt = nowIso();
    document.updatedBy = actedBy;
    appendHistory(store.legalPublishHistory, {
      legalDocumentId: document.id,
      action: "activated",
      actedBy,
    });
    return document;
  });
}

export async function archiveLegalDocument(documentId: string, actedBy?: string) {
  return withStoreTransaction(async (store) => {
    const document = store.legalDocuments.find((item) => item.id === documentId);
    if (!document) throw new Error("Legal document not found");
    document.status = "archived";
    document.isActive = false;
    document.archivedAt = nowIso();
    document.updatedAt = nowIso();
    document.updatedBy = actedBy;
    appendHistory(store.legalPublishHistory, {
      legalDocumentId: document.id,
      action: "archived",
      actedBy,
    });
    return document;
  });
}

export async function duplicateLegalDocumentAsNewVersion(documentId: string, nextVersion: string, actedBy?: string) {
  const { document } = await getLegalDocumentById(documentId);
  if (!document) throw new Error("Legal document not found");

  return createLegalDocumentDraft({
    documentType: document.documentType,
    title: document.title,
    slug: document.slug,
    version: nextVersion,
    summary: document.summary,
    excerpt: document.excerpt,
    contentMarkdown: document.contentMarkdown,
    createdBy: actedBy,
  });
}

export async function listLegalAcceptances(filters?: {
  actorType?: string;
  documentType?: string;
  version?: string;
  source?: string;
}) {
  const store = await readStore();
  let items = [...store.legalAcceptances];
  if (filters?.actorType) items = items.filter((item) => item.actorType === filters.actorType);
  if (filters?.documentType) items = items.filter((item) => item.documentType === filters.documentType);
  if (filters?.version) items = items.filter((item) => item.documentVersion === filters.version);
  if (filters?.source) items = items.filter((item) => item.acceptanceSource === filters.source);
  return items.sort((left, right) => right.acceptedAt.localeCompare(left.acceptedAt));
}
