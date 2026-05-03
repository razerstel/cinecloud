"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm({ className }: { className?: string }) {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") ?? "/";
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    startTransition(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!res || res.error) {
        setError("Email o contraseña incorrectos");
        return;
      }
      router.replace(callbackUrl);
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="space-y-3">
        <label className="block text-sm">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 w-full rounded-md border border-white/10 bg-surface-2 px-3 py-2 text-foreground placeholder-muted outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          Contraseña
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
            className="mt-1 w-full rounded-md border border-white/10 bg-surface-2 px-3 py-2 text-foreground placeholder-muted outline-none focus:border-accent"
          />
        </label>
      </div>
      {error && <p className="mt-3 text-sm text-accent">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-5 w-full rounded-md bg-accent py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
