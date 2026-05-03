import "dotenv/config";

const BASE = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
const KEY = process.env.TMDB_API_KEY ?? "";
const isV4 = KEY.split(".").length === 3;

const url = new URL(`${BASE}/trending/all/week`);
url.searchParams.set("language", "es-ES");
if (!isV4 && KEY) url.searchParams.set("api_key", KEY);

const res = await fetch(url, {
  headers: {
    accept: "application/json",
    ...(isV4 ? { authorization: `Bearer ${KEY}` } : {}),
  },
});

if (!res.ok) {
  console.error("HTTP", res.status, await res.text());
  process.exit(1);
}
const data = await res.json();
console.log("OK:", data.results.length, "items");
for (const r of data.results.slice(0, 3)) {
  console.log("-", r.media_type, r.id, r.title ?? r.name, "·", (r.poster_path ?? "no-poster"));
}
