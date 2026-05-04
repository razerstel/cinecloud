export default function Loading() {
  return (
    <div className="mx-auto max-w-screen-2xl">
      <div className="-mt-14 h-[70svh] min-h-[420px] w-full animate-pulse bg-surface-2/40" />
      {[0, 1, 2, 3, 4].map((i) => (
        <section key={i} className="mt-10">
          <div className="mb-3 ml-4 h-5 w-48 animate-pulse rounded bg-surface-2/70 sm:ml-8" />
          <div className="flex gap-3 px-4 py-8 sm:px-8">
            {Array.from({ length: 6 }).map((_, j) => (
              <div
                key={j}
                className="aspect-video w-56 shrink-0 animate-pulse rounded-md bg-surface-2/70 sm:w-64 md:w-72"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
