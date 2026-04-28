"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Tab = "login" | "register";

type FieldProps = {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
};

function Field({ label, id, type = "text", placeholder, value, onChange, autoComplete }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[0.875rem] border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
      />
    </div>
  );
}

export function UserAuthForm({ defaultTab = "login" }: { defaultTab?: Tab }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/user/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Sign in failed"); return; }
        router.push(data.nextPath ?? "/account");
        router.refresh();
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/user/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email: regEmail, phone, password: regPassword }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Registration failed"); return; }
        router.push(data.nextPath ?? "/account");
        router.refresh();
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      {/* Tabs */}
      <div className="mb-6 flex rounded-[1.1rem] bg-slate-100 p-1">
        {(["login", "register"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setError(""); }}
            className={`flex-1 rounded-[0.85rem] py-2 text-sm font-semibold transition ${
              tab === t
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      {tab === "login" ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <Field label="Email address" id="login-email" type="email" placeholder="you@example.com" value={loginEmail} onChange={setLoginEmail} autoComplete="email" />
          <Field label="Password" id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={setLoginPassword} autoComplete="current-password" />

          {error && <p className="rounded-[0.75rem] bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="mt-1 w-full rounded-[0.875rem] bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isPending ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <button type="button" onClick={() => setTab("register")} className="font-semibold text-slate-800 underline-offset-2 hover:underline">
              Create one
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <Field label="Full name" id="reg-name" placeholder="Your full name" value={fullName} onChange={setFullName} autoComplete="name" />
          <Field label="Email address" id="reg-email" type="email" placeholder="you@example.com" value={regEmail} onChange={setRegEmail} autoComplete="email" />
          <Field label="Phone number" id="reg-phone" type="tel" placeholder="+1 876 000 0000" value={phone} onChange={setPhone} autoComplete="tel" />
          <Field label="Password" id="reg-password" type="password" placeholder="At least 8 characters" value={regPassword} onChange={setRegPassword} autoComplete="new-password" />

          {error && <p className="rounded-[0.75rem] bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="mt-1 w-full rounded-[0.875rem] bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isPending ? "Creating account…" : "Create account"}
          </button>

          <p className="text-center text-xs text-slate-500">
            Already have an account?{" "}
            <button type="button" onClick={() => setTab("login")} className="font-semibold text-slate-800 underline-offset-2 hover:underline">
              Sign in
            </button>
          </p>
        </form>
      )}
    </div>
  );
}
