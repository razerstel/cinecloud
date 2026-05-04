import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { NavLinks } from "@/components/NavLinks";
import { SearchInput } from "@/components/SearchInput";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-black/95 via-black/80 to-transparent backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-2xl items-center px-4 py-3 sm:px-8">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-accent"
        >
          CineCloud
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <SearchInput />
          <NavLinks />
          {session?.user && (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
              className="ml-2"
            >
              <button
                type="submit"
                className="rounded-full px-3 py-1.5 text-sm text-zinc-300 transition hover:text-white"
                title={session.user.email ?? "Salir"}
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
