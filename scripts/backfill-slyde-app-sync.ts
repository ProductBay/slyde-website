import { config as loadDotenv } from "dotenv";

loadDotenv({ path: ".env.production.local" });
loadDotenv({ path: ".env.local" });
loadDotenv({ path: ".env" });

type DocumentBucket = "nationalId" | "driversLicense" | "vehicleRegistration" | "insurance" | "fitness" | "profilePhoto" | "supporting";

type SyncDocument = {
  name: string;
  type: string;
  fileUrl?: string;
  storageKey?: string;
};

const DOCUMENT_BUCKETS: Record<string, DocumentBucket> = {
  national_id: "nationalId",
  drivers_license: "driversLicense",
  registration: "vehicleRegistration",
  insurance: "insurance",
  fitness: "fitness",
  profile_photo: "profilePhoto",
  other: "supporting",
};

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

function toDateInput(value: Date | string | null | undefined) {
  if (!value) return undefined;
  return new Date(value).toISOString().slice(0, 10);
}

function toIso(value: Date | string | null | undefined) {
  if (!value) return undefined;
  return new Date(value).toISOString();
}

function pushDocument(documents: Record<DocumentBucket, SyncDocument[]>, document: any) {
  const bucket = DOCUMENT_BUCKETS[String(document.type)] ?? "supporting";
  documents[bucket].push({
    name: document.fileName,
    type: document.mimeType,
    fileUrl: document.fileUrl || undefined,
    storageKey: document.storageKey || undefined,
  });
}

function buildPayload(record: any) {
  const documents: Record<DocumentBucket, SyncDocument[]> = {
    nationalId: [],
    driversLicense: [],
    vehicleRegistration: [],
    insurance: [],
    fitness: [],
    profilePhoto: [],
    supporting: [],
  };

  for (const document of record.documents ?? []) {
    pushDocument(documents, document);
  }

  const readinessAnswers = (record.readinessAnswers ?? {}) as Record<string, unknown>;
  const referral = readinessAnswers.referralAttribution && typeof readinessAnswers.referralAttribution === "object" ? readinessAnswers.referralAttribution : undefined;
  const vehicle = record.vehicle;

  return {
    fullName: record.fullName,
    email: record.email,
    phone: record.phone,
    dateOfBirth: toDateInput(record.dateOfBirth),
    parish: record.parish,
    address: record.address,
    trn: record.trn,
    emergencyContactName: record.emergencyContactName,
    emergencyContactPhone: record.emergencyContactPhone,
    courierType: record.courierType,
    vehicle: vehicle
      ? {
          make: vehicle.make || undefined,
          model: vehicle.model || undefined,
          year: vehicle.year || undefined,
          color: vehicle.color || undefined,
          plateNumber: vehicle.plateNumber || undefined,
          registrationExpiry: toDateInput(vehicle.registrationExpiry),
          insuranceExpiry: toDateInput(vehicle.insuranceExpiry),
          fitnessExpiry: toDateInput(vehicle.fitnessExpiry),
        }
      : {},
    workTypePreference: record.workTypePreference,
    availability: record.availability,
    preferredZones: record.preferredZones ?? [],
    deliveryTypePreferences: record.deliveryTypePreferences ?? [],
    maxTravelComfort: record.maxTravelComfort,
    peakHours: record.peakHours,
    smartphoneType: record.smartphoneType,
    whatsappNumber: record.whatsappNumber,
    gpsConfirmed: record.gpsConfirmed,
    internetConfirmed: record.internetConfirmed,
    readinessAnswers,
    agreementsAccepted: record.agreementsAccepted ?? {},
    ...(referral ? { referral } : {}),
    documents,
    submittedAt: toIso(record.submittedAt),
    applicationStatus: record.applicationStatus,
    accountStatus: record.accountStatus,
    operationalStatus: record.operationalStatus,
    readinessStatus: record.readinessStatus,
  };
}

async function main() {
  const apply = process.argv.includes("--apply");
  const includeLinked = process.argv.includes("--include-linked");
  const baseUrl = process.env.SLYDE_APP_SYNC_BASE_URL?.trim() ?? "";
  const secret = process.env.SLYDE_APP_SYNC_SECRET?.trim() ?? "";

  requiredEnv("DATABASE_URL");
  if (apply) {
    if (!baseUrl) throw new Error("Missing required environment variable SLYDE_APP_SYNC_BASE_URL");
    if (!secret) throw new Error("Missing required environment variable SLYDE_APP_SYNC_SECRET");
  }

  const { prisma } = await import("@/server/db/prisma");
  const where = includeLinked
    ? undefined
    : {
        OR: [{ linkedUserId: null }, { linkedSlyderProfileId: null }],
      };

  const records = await prisma.slyderApplication.findMany({
    where,
    include: {
      vehicle: true,
      documents: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!apply) {
    console.log(`Dry run: found ${records.length} website application(s) to backfill.`);
    for (const record of records) {
      console.log(`- ${record.applicationCode} ${record.email} (${record.applicationStatus})`);
    }
    await prisma.$disconnect();
    return;
  }

  let synced = 0;
  let failed = 0;

  for (const record of records) {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/internal/public-slyder-applications`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-slyde-integration-key": secret,
      },
      body: JSON.stringify(buildPayload(record)),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.userId || !body.slyderId) {
      failed += 1;
      console.error(`Failed ${record.applicationCode}: HTTP ${response.status} ${body.error ?? body.message ?? "unknown error"} ${body.issues ? JSON.stringify(body.issues) : ""}`);
      continue;
    }

    await prisma.slyderApplication.update({
      where: { id: record.id },
      data: {
        linkedUserId: body.userId,
        linkedSlyderProfileId: body.slyderId,
        updatedAt: new Date(),
      },
    });

    synced += 1;
    console.log(`Synced ${record.applicationCode} -> app user ${body.userId}`);
  }

  console.log(`Backfill complete: ${synced} synced, ${failed} failed.`);
  await prisma.$disconnect();

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});



