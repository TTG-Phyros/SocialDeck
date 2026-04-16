import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";

import { SettingsClient } from "./settingsClient";

export default async function SettingsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return <SettingsClient />;
}
