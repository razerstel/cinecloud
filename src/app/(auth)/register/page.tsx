import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Crear cuenta</h1>
      <p className="mt-1 text-sm text-muted">Tu cuenta para CineCloud.</p>
      <RegisterForm className="mt-6" />
      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-foreground underline">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
