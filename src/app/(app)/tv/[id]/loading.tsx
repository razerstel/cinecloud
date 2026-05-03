export default function Loading() {
  return (
    <div>
      <div className="-mt-14 h-[55svh] min-h-[360px] w-full animate-pulse bg-surface-2/40" />
      <div className="mx-auto -mt-32 max-w-screen-xl px-4 sm:px-6">
        <div className="h-9 w-2/3 animate-pulse rounded bg-surface-2/70" />
        <div className="mt-4 h-20 max-w-3xl animate-pulse rounded bg-surface-2/50" />
      </div>
    </div>
  );
}
