import { Navbar } from "@/components/Navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pb-16">{children}</main>
    </>
  );
}
