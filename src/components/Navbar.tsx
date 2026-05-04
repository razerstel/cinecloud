import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { NavLinks } from "@/components/NavLinks";
import { SearchInput } from "@/components/SearchInput";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-black via-black/85 to-transparent backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-screen-2xl items-center px-4 sm:px-10">
        <Link
          href="/"
          className="text-3xl font-extrabold tracking-tight text-accent transition hover:brightness-110"
        >
          CineCloud
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <SearchInput />
          <NavLinks />
          {session?.user && (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="ml-2 rounded-full px-4 py-2 text-base font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
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
