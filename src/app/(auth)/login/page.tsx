import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      <p className="mt-1 text-sm text-muted">Accede a tu cuenta CineCloud.</p>
      <Suspense fallback={<div className="mt-6 h-44 animate-pulse rounded-md bg-surface-2" />}>
        <LoginForm className="mt-6" />
      </Suspense>
      <p className="mt-6 text-center text-sm text-muted">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-foreground underline">
          Regístrate
        </Link>
      </p>
    </>
  );
}
