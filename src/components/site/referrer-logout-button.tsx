"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ReferrerLogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function logout() {
    await fetch("/api/auth/referrer/logout", {
      method: "POST",
    });
    router.push("/refer/login");
    router.refresh();
  }

  return (
    <Button type="button" variant="secondary" onClick={() => startTransition(() => void logout())} disabled={pending}>
      {pending ? "Signing out..." : "Sign Out"}
    </Button>
  );
}
