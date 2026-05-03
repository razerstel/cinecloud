export default function Loading() {
  return (
    <div className="mx-auto max-w-screen-2xl">
      <div className="-mt-14 h-[70svh] min-h-[420px] w-full animate-pulse bg-surface-2/40" />
      {[0, 1, 2, 3, 4].map((i) => (
        <section key={i} className="mt-8">
          <div className="mb-2 ml-4 h-5 w-48 animate-pulse rounded bg-surface-2/70 sm:ml-6" />
          <div className="flex gap-3 px-4 pb-2 sm:px-6">
            {Array.from({ length: 8 }).map((_, j) => (
              <div
                key={j}
                className="aspect-[2/3] w-40 shrink-0 animate-pulse rounded-md bg-surface-2/70 sm:w-44 md:w-48"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
