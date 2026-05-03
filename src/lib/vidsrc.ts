const BASE = process.env.VIDSRC_BASE_URL ?? "https://vidsrc-embed.ru";

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

export function vidsrcEmbedUrl(opts: EmbedOpts): string {
  const url = new URL(`${BASE}/embed/${opts.type}`);
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
