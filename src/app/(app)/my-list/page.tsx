export const metadata = { title: "Mi lista" };

export default function MyListPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Mi lista</h1>
      <p className="mt-2 text-sm text-muted">
        Aún no has guardado nada. Añade contenido desde la ficha de cualquier
        película o serie.
      </p>
    </div>
  );
}
