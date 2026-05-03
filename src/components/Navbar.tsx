import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { SearchInput } from "@/components/SearchInput";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-black/90 via-black/70 to-transparent backdrop-blur-sm">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-accent">
          CineCloud
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-foreground/80 sm:flex">
          <Link href="/" className="hover:text-foreground">Inicio</Link>
          <Link href="/my-list" className="hover:text-foreground">Mi lista</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <SearchInput />
          {session?.user && (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-foreground/80 transition hover:border-white/30 hover:text-foreground"
              >
                Salir
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
