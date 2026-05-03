// Espejos de vidsrc en orden de preferencia. Si uno está bloqueado en tu red,
// el reproductor permite saltar al siguiente sin recargar la página.
export const VIDSRC_BASES = [
  "https://vidsrc-embed.ru",
  "https://vidsrc-embed.su",
  "https://vidsrcme.ru",
  "https://vidsrcme.su",
  "https://vidsrc-me.ru",
  "https://vidsrc-me.su",
  "https://vsrc.su",
] as const;

export type VidsrcBase = (typeof VIDSRC_BASES)[number];

const ENV_BASE = process.env.VIDSRC_BASE_URL;

export type VidsrcIdKind = "tmdb" | "imdb";

export interface MovieEmbedOpts {
  type: "movie";
  idKind: VidsrcIdKind;
  id: string | number;
  autoplay?: boolean;
  dsLang?: string;
  subUrl?: string;
}

export interface TvEmbedOpts {
  type: "tv";
  idKind: VidsrcIdKind;
  id: string | number;
  season?: number;
  episode?: number;
  autoplay?: boolean;
  autonext?: boolean;
  dsLang?: string;
  subUrl?: string;
}

export type EmbedOpts = MovieEmbedOpts | TvEmbedOpts;

export function vidsrcEmbedUrl(opts: EmbedOpts, base?: string): string {
  const root = base ?? ENV_BASE ?? VIDSRC_BASES[0];
  const url = new URL(`${root}/embed/${opts.type}`);
  url.searchParams.set(opts.idKind, String(opts.id));

  if (opts.type === "tv") {
    if (opts.season != null) url.searchParams.set("season", String(opts.season));
    if (opts.episode != null) url.searchParams.set("episode", String(opts.episode));
    if (opts.autonext != null) url.searchParams.set("autonext", opts.autonext ? "1" : "0");
  }
  if (opts.autoplay != null) url.searchParams.set("autoplay", opts.autoplay ? "1" : "0");
  if (opts.dsLang) url.searchParams.set("ds_lang", opts.dsLang);
  if (opts.subUrl) url.searchParams.set("sub_url", opts.subUrl);

  return url.toString();
}
