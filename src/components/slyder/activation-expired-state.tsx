import Link from "next/link";

export function ActivationExpiredState({ message }: { message: string }) {
  return (
    <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-rose-800">
      <h2 className="text-xl font-semibold">Activation link unavailable</h2>
      <p className="mt-3 text-sm leading-7">{message}</p>
      <p className="mt-3 text-sm leading-7">
        Use the Slyder sign-in page if your account is already active, or contact the SLYDE team if you need a fresh activation invite.
      </p>
      <div className="mt-4">
        <Link href="/slyder/login" className="text-sm font-semibold text-rose-700 underline underline-offset-4">
          Go to Slyder sign in
        </Link>
      </div>
    </div>
  );
}
