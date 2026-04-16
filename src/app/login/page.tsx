import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";

import { LoginForm } from "./loginForm";

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <section className="auth-layout">
      <LoginForm />
    </section>
  );
}
