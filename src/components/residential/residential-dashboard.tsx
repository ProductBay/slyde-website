import type {
  ResidentialDispatchRequest,
  ResidentialWallet,
  ResidentialWalletTransaction,
} from "@prisma/client";

function formatMoney(minor: number, currency = "JMD") {
  return new Intl.NumberFormat("en-JM", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(minor / 100);
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-JM", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const statusLabels: Record<ResidentialDispatchRequest["status"], string> = {
  submitted: "Submitted",
  payment_pending: "Payment Pending",
  confirmed: "Confirmed",
  rider_assigned: "Rider Assigned",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  delivered: "Delivered",
  failed: "Failed",
  cancelled: "Cancelled",
};

const statusColors: Record<ResidentialDispatchRequest["status"], string> = {
  submitted: "bg-slate-100 text-slate-700",
  payment_pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  rider_assigned: "bg-indigo-100 text-indigo-800",
  picked_up: "bg-violet-100 text-violet-800",
  in_transit: "bg-cyan-100 text-cyan-800",
  delivered: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-slate-200 text-slate-600",
};

const paymentLabels: Record<ResidentialDispatchRequest["paymentMethod"], string> = {
  wallet: "SLYDE Wallet",
  card: "Debit/Credit Card",
  slyde_gift_card: "SLYDE Gift Card",
  adash_scan_to_pay: "A'Dash Scan-to-Pay",
};

const txTypeLabels: Record<ResidentialWalletTransaction["type"], string> = {
  top_up: "Top-Up",
  dispatch_hold: "Hold Placed",
  dispatch_charge: "Dispatch Charge",
  hold_release: "Hold Released",
  refund: "Refund",
  gift_card_redemption: "Gift Card Redemption",
  scan_pay_charge: "Scan-to-Pay Charge",
  adjustment: "Adjustment",
};

export function ResidentialDashboard({
  wallet,
  requests,
  transactions,
}: {
  wallet: ResidentialWallet;
  requests: ResidentialDispatchRequest[];
  transactions: ResidentialWalletTransaction[];
}) {
  return (
    <div className="space-y-6">
      {/* Wallet summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Available Wallet Balance</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{formatMoney(wallet.availableBalance, wallet.currency)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Held Balance</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{formatMoney(wallet.heldBalance, wallet.currency)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lifetime Top-Up</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{formatMoney(wallet.totalLifetimeTopUp, wallet.currency)}</p>
        </div>
      </div>

      {/* Wallet transaction ledger */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Wallet Transactions</h2>
        {transactions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            No wallet transactions yet. Your ledger will appear here after your first top-up or dispatch payment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Balance After</th>
                  <th className="py-2 pr-4">Description</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isCredit = tx.amountJMD >= 0;
                  return (
                    <tr key={tx.id} className="border-b border-slate-50 align-top text-slate-700">
                      <td className="py-3 pr-4 text-slate-500">{formatDate(tx.createdAt)}</td>
                      <td className="py-3 pr-4">{txTypeLabels[tx.type]}</td>
                      <td className={`py-3 pr-4 font-semibold ${isCredit ? "text-emerald-700" : "text-red-600"}`}>
                        {isCredit ? "+" : ""}{formatMoney(tx.amountJMD, wallet.currency)}
                      </td>
                      <td className="py-3 pr-4">{formatMoney(tx.balanceAfterJMD, wallet.currency)}</td>
                      <td className="py-3 pr-4 text-slate-500">{tx.description ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispatch requests */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-950">Residential Dispatch Requests</h2>
          <a
            href="/dispatch-from-home/start"
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
          >
            New request
          </a>
        </div>

        {requests.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            No residential requests yet. Start your first request and track every stage here.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="py-2 pr-4">Reference</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Payment</th>
                  <th className="py-2 pr-4">Route</th>
                  <th className="py-2 pr-4">Submitted</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b border-slate-50 align-top text-slate-700">
                    <td className="py-3 pr-4 font-medium text-slate-900">{request.referenceCode}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[request.status]}`}>
                        {statusLabels[request.status]}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{paymentLabels[request.paymentMethod]}</td>
                    <td className="py-3 pr-4">{request.pickupParish} → {request.dropoffParish}</td>
                    <td className="py-3 pr-4">{formatDate(request.submittedAt)}</td>
                    <td className="py-3">
                      <a
                        href={`/account/residential/${request.referenceCode}`}
                        className="text-xs font-medium text-slate-600 underline-offset-2 hover:underline"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
