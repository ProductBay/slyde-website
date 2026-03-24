import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = (process.env.E2E_BASE_URL || process.env.SLYDE_WEBSITE_BASE_URL || "http://127.0.0.1:3002").replace(/\/$/, "");
const adminKey = process.env.SLYDE_ADMIN_DEV_KEY || "dev-admin-key";
const storePath = path.join(process.cwd(), ".data", "slyde-onboarding-store.json");

function fakePngBuffer() {
  return Buffer.from(
    "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C6360000002000154A24F5A0000000049454E44AE426082",
    "hex",
  );
}

async function readStore() {
  const raw = await readFile(storePath, "utf8");
  return JSON.parse(raw);
}

async function approveAllDocumentsForApplication(applicationId) {
  const store = await readStore();
  const documents = store.documents.filter((entry) => entry.applicationId === applicationId);

  for (const document of documents) {
    const result = await fetchJson(`/api/admin/slyder-applications/${applicationId}/documents/${document.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-slyde-admin-key": adminKey,
      },
      body: JSON.stringify({
        documentId: document.id,
        verificationStatus: "approved",
      }),
    });
    assertOk(result.response, result.json, [200]);
  }

  return documents.length;
}

function extractActivationToken(body) {
  return (
    body?.match(/\/slyder\/activate\/([a-f0-9]+)/i)?.[1] ||
    body?.match(/activation token[:\s]+([a-f0-9]+)/i)?.[1] ||
    null
  );
}

function extractOtpCode(body) {
  return body?.match(/\b(\d{6})\b/)?.[1] || null;
}

async function fetchJson(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    redirect: "manual",
    ...options,
  });

  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return { response, json, text };
}

function assertOk(response, json, allowedStatuses = [200, 201]) {
  if (!allowedStatuses.includes(response.status)) {
    throw new Error(`Unexpected status ${response.status}: ${JSON.stringify(json)}`);
  }
}

async function uploadDocument(name) {
  const form = new FormData();
  form.append("files", new File([fakePngBuffer()], name, { type: "image/png" }));

  const { response, json } = await fetchJson("/api/public/uploads/slyder-documents", {
    method: "POST",
    body: form,
  });
  assertOk(response, json, [201]);
  return json.files[0];
}

async function createSlyderApplication(email, phone, suffix) {
  const nationalId = await uploadDocument(`national-id-${suffix}.png`);
  const profilePhoto = await uploadDocument(`profile-photo-${suffix}.png`);

  const payload = {
    personal: {
      fullName: `Smoke Slyder ${suffix}`,
      email,
      phone,
      dateOfBirth: "1997-04-12",
      parishTown: "Kingston",
      address: "12 Smoke Test Avenue, Kingston",
      trn: `12345678${suffix.slice(-1)}`,
      emergencyContact: `Smoke Contact | ${phone}`,
    },
    courier: {
      courierType: "walker",
    },
    vehicle: {
      make: "",
      model: "",
      year: "",
      color: "",
      plateNumber: "",
      registrationExpiry: "",
      insuranceExpiry: "",
      fitnessExpiry: "",
    },
    documents: {
      nationalId: [nationalId],
      driversLicense: [],
      vehicleRegistration: [],
      insurance: [],
      fitness: [],
      profilePhoto: [profilePhoto],
      supporting: [],
    },
    preferences: {
      zones: ["Kingston"],
      availability: "Weekdays and evenings",
      commitment: "part-time",
      peakHours: "Lunch and evening",
      maxTravelComfort: "8 km",
      deliveryTypes: ["food", "documents"],
    },
    readiness: {
      smartphoneType: "Android",
      whatsappNumber: phone,
      gpsEnabled: true,
      dataAccess: true,
      safetyGear: true,
      insulatedBag: true,
      helmetReady: false,
      readinessNotes: "Smoke test intake",
    },
    agreements: {
      privacyConsent: true,
      onboardingConsent: true,
      documentReviewConsent: true,
      contractorAcknowledgement: true,
      platformTermsAcceptance: true,
    },
    referral: {
      referralCode: "",
      inviteToken: "",
      referralSource: "none",
      capturedAt: "",
      landingPage: "/become-a-slyder/apply",
    },
  };

  const { response, json } = await fetchJson("/api/public/slyder-applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  assertOk(response, json, [201]);
  return json;
}

async function main() {
  const runId = Date.now();
  const approvedEmail = `smoke-approved-${runId}@example.com`;
  const rejectedEmail = `smoke-rejected-${runId}@example.com`;
  const approvedPhone = `876${String(runId).slice(-7)}`;
  const rejectedPhone = `876${String(runId + 1).slice(-7)}`;

  const summary = {
    baseUrl,
    merchantInquiry: null,
    approvedFlow: {},
    rejectedFlow: {},
  };

  const merchant = await fetchJson("/api/public/business-inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      companyName: `Smoke Merchant ${runId}`,
      contactName: "Merchant Smoke",
      email: `merchant-${runId}@example.com`,
      phone: "8765552000",
      businessType: "merchant",
      deliveryVolume: "50 per week",
      coverageNeeds: "Kingston",
      goals: "Production readiness smoke flow",
      legal: {
        accuracyConfirmed: true,
        contactConsent: true,
        noGuaranteeAcknowledgement: true,
        acceptedDocumentTypes: ["merchant_interest_terms", "merchant_privacy_notice"],
      },
    }),
  });
  assertOk(merchant.response, merchant.json, [201]);
  summary.merchantInquiry = { status: merchant.response.status, id: merchant.json?.merchantInterest?.id ?? null };

  const approvedApplication = await createSlyderApplication(approvedEmail, approvedPhone, String(runId));
  const rejectedApplication = await createSlyderApplication(rejectedEmail, rejectedPhone, `${runId}r`);

  summary.approvedFlow.applicationId = approvedApplication.applicationId;
  summary.rejectedFlow.applicationId = rejectedApplication.applicationId;
  summary.approvedFlow.documentsApproved = await approveAllDocumentsForApplication(approvedApplication.applicationId);

  const rejectResult = await fetchJson(`/api/admin/slyder-applications/${rejectedApplication.applicationId}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-slyde-admin-key": adminKey,
    },
    body: JSON.stringify({ reason: "Smoke test rejection path" }),
  });
  assertOk(rejectResult.response, rejectResult.json, [200]);
  summary.rejectedFlow.review = {
    status: rejectResult.response.status,
    appSync: rejectResult.json?.appSync?.status ?? null,
  };

  const approveResult = await fetchJson(`/api/admin/slyder-applications/${approvedApplication.applicationId}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-slyde-admin-key": adminKey,
    },
    body: JSON.stringify({ activationChannel: "email", reviewNotes: "Smoke test approval path" }),
  });
  assertOk(approveResult.response, approveResult.json, [200]);
  summary.approvedFlow.review = {
    status: approveResult.response.status,
    appSync: approveResult.json?.appSync?.status ?? null,
  };

  const storeAfterApproval = await readStore();
  const activationNotification = [...storeAfterApproval.notifications]
    .reverse()
    .find((entry) => entry.applicationId === approvedApplication.applicationId && entry.templateKey === "slyder_activation_ready_email");

  if (!activationNotification) {
    throw new Error("Could not find activation email notification for approved Slyder.");
  }

  const activationToken = extractActivationToken(activationNotification.bodySnapshot);
  if (!activationToken) {
    throw new Error("Could not extract activation token from activation email snapshot.");
  }

  summary.approvedFlow.activationEmail = {
    provider: activationNotification.providerName,
    notificationId: activationNotification.id,
  };

  const activateResult = await fetchJson("/api/auth/slyder/activate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: activationToken }),
  });
  assertOk(activateResult.response, activateResult.json, [200]);

  const setPasswordResult = await fetchJson("/api/auth/slyder/set-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: activationToken, password: "SmokePass123!" }),
  });
  assertOk(setPasswordResult.response, setPasswordResult.json, [200]);

  const loginResult = await fetchJson("/api/auth/slyder/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: approvedEmail, password: "SmokePass123!" }),
  });
  assertOk(loginResult.response, loginResult.json, [200]);

  const challengeId = loginResult.json?.result?.challengeId;
  if (!challengeId) {
    throw new Error("Login did not return an OTP challenge id.");
  }

  const storeAfterLogin = await readStore();
  const otpNotification = [...storeAfterLogin.notifications]
    .reverse()
    .find((entry) => entry.templateKey === "slyder_login_otp_email" && entry.recipient === approvedEmail);

  if (!otpNotification) {
    throw new Error("Could not find OTP email notification.");
  }

  const otpCode = extractOtpCode(otpNotification.bodySnapshot);
  if (!otpCode) {
    throw new Error("Could not extract OTP code from notification snapshot.");
  }

  const verifyOtpResult = await fetchJson("/api/auth/slyder/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeId, code: otpCode }),
  });
  assertOk(verifyOtpResult.response, verifyOtpResult.json, [200]);

  const sessionCookie = verifyOtpResult.response.headers.get("set-cookie");
  if (!sessionCookie) {
    throw new Error("OTP verification did not issue a session cookie.");
  }

  const authHeaders = {
    "Content-Type": "application/json",
    Cookie: sessionCookie.split(",")[0],
  };

  const acceptLegalResult = await fetchJson("/api/slyder/onboarding/accept-legal", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      acceptedDocumentTypes: ["slyder_activation_terms"],
      understandZoneDependency: true,
      understandSetupRequired: true,
    }),
  });
  assertOk(acceptLegalResult.response, acceptLegalResult.json, [200]);

  const setupResult = await fetchJson("/api/slyder/onboarding/complete-setup", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({}),
  });
  assertOk(setupResult.response, setupResult.json, [200]);

  const readinessResult = await fetchJson("/api/slyder/onboarding/complete-readiness", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({}),
  });
  assertOk(readinessResult.response, readinessResult.json, [200]);

  const finalStatus = await fetchJson("/api/slyder/onboarding/status", {
    method: "GET",
    headers: {
      Cookie: sessionCookie.split(",")[0],
    },
  });
  assertOk(finalStatus.response, finalStatus.json, [200]);

  summary.approvedFlow.activation = { activated: true, passwordSet: true };
  summary.approvedFlow.login = { challengeId, otpDelivery: loginResult.json?.result?.delivery ?? null };
  summary.approvedFlow.onboarding = {
    setupStatus: setupResult.json?.result?.eligibilityState ?? null,
    readinessStatus: readinessResult.json?.result?.eligibilityState ?? null,
    finalEligibility: finalStatus.json?.result?.eligibilityState ?? null,
    zoneStatus: finalStatus.json?.result?.zoneStatus ?? null,
  };

  console.log(JSON.stringify({ ok: true, summary }, null, 2));
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        baseUrl,
        error: error instanceof Error ? error.message : "Full onboarding E2E failed.",
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
