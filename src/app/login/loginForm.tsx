"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button, Card, FormField, Input, SectionHeader, Text } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import type { AuthLoginResponse } from "@/lib/api-types";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiFetch<AuthLoginResponse>("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Une erreur reseau est survenue.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card as="form" className="auth-card" onSubmit={onSubmit}>
      <SectionHeader
        level={1}
        title="Connexion"
        subtitle="Accede a SocialDeck et publie sur plusieurs plateformes en un clic."
      />

      <FormField label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </FormField>

      <FormField label="Mot de passe" htmlFor="password">
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </FormField>

      {error ? <Text tone="error">{error}</Text> : null}

      <Button type="submit" fullWidth disabled={submitting}>
        {submitting ? "Connexion en cours..." : "Se connecter"}
      </Button>

      <Text tone="muted" as="p">
        Pas encore de compte ? <Link href="/register">Inscription</Link>
      </Text>
    </Card>
  );
}
