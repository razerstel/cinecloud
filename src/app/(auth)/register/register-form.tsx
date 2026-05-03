"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function RegisterForm({ className }: { className?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    const name = String(data.get("name") ?? "").trim() || undefined;

    startTransition(async () => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "No se pudo crear la cuenta");
        return;
      }

      const login = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!login || login.error) {
        setError("Cuenta creada pero el login falló. Prueba a iniciar sesión.");
        router.push("/login");
        return;
      }
      router.replace("/");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="space-y-3">
        <label className="block text-sm">
          Nombre <span className="text-muted">(opcional)</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            className="mt-1 w-full rounded-md border border-white/10 bg-surface-2 px-3 py-2 text-foreground placeholder-muted outline-none focus:border-accent"
          />
        </label>
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
          Contraseña <span className="text-muted">(mínimo 8 caracteres)</span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
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
        {pending ? "Creando..." : "Crear cuenta"}
      </button>
    </form>
  );
}
