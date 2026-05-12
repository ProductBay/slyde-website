import { NextResponse } from "next/server";
import { findApplication } from "@/modules/onboarding/repositories/onboarding.repository";
import {
  sendSlydeAppActivationInvite,
  shouldSyncToExternalSlydeApp,
} from "@/modules/onboarding/services/slyde-app-sync.service";
import { requireAdminContext } from "@/server/auth/guards";
import { readPersistenceStore } from "@/server/persistence";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await context.params;
  const store = await readPersistenceStore();
  const application = findApplication(store, id);

  if (!application) {
    return NextResponse.json({ error: "Slyder application not found." }, { status: 404 });
  }

  if (application.applicationStatus !== "approved") {
    return NextResponse.json(
      { error: "Approve this application before sending the SLYDE app activation email." },
      { status: 409 },
    );
  }

  if (!shouldSyncToExternalSlydeApp()) {
    return NextResponse.json({ error: "SLYDE app sync is not enabled or configured." }, { status: 503 });
  }

  try {
    const result = await sendSlydeAppActivationInvite({ email: application.email });

    return NextResponse.json({
      ok: true,
      result,
      message: `SLYDE app activation email sent to ${result.email}.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send the SLYDE app activation email." },
      { status: 400 },
    );
  }
}
