import { NextResponse } from "next/server";
import { getSessionContext } from "@/server/auth/session";
import {
  getResidentialWalletByUserId,
  listWalletTransactions,
} from "@/modules/residential-intake/repositories/residential-intake.repository";

export async function GET() {
  const session = await getSessionContext();
  if (!session?.user?.isEnabled) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const wallet = await getResidentialWalletByUserId(userId);

  if (!wallet) {
    return NextResponse.json({ wallet: null, transactions: [] });
  }

  const transactions = await listWalletTransactions(wallet.id, 30);

  return NextResponse.json({ wallet, transactions });
}
