export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg bg-surface/80 p-8 shadow-xl backdrop-blur">
        {children}
      </div>
    </div>
  );
}
