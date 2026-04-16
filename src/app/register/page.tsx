import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";

import { RegisterForm } from "./registerForm";

export default async function RegisterPage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <section className="auth-layout">
      <RegisterForm />
    </section>
  );
}
