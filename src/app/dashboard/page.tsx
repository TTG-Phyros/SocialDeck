import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";

import { DashboardClient } from "./dashboardClient";

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return <DashboardClient userName={user.displayName} />;
}
