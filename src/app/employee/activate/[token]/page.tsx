import { EmployeeActivationForm } from "@/components/employee/employee-activation-form";
import { activateEmployee } from "@/modules/employee/services/employee-auth.service";

export default async function EmployeeActivateTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  try {
    const result = await activateEmployee(token);

    return (
      <section className="section-shell py-10 sm:py-12">
        <div className="employee-paper max-w-3xl p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Employee activation</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Complete your employee activation</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Your employee account has been prepared. Create your password first, then sign in and continue into onboarding.
          </p>
          <div className="mt-8">
            <EmployeeActivationForm token={token} passwordSet={result.passwordSet} />
          </div>
        </div>
      </section>
    );
  } catch (error) {
    return (
      <section className="section-shell py-10 sm:py-12">
        <div className="employee-paper max-w-3xl p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Employee activation</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Activation unavailable</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {error instanceof Error ? error.message : "This activation link is invalid or expired."}
          </p>
        </div>
      </section>
    );
  }
}
