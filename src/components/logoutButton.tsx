"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import type { AuthLogoutResponse } from "@/lib/api-types";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      await apiFetch<AuthLogoutResponse>("/api/auth/logout", {
        method: "POST",
      });

      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="small"
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? "Deconnexion..." : "Se deconnecter"}
    </Button>
  );
}
