import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const upsertSchema = z.object({
  mediaType: z.enum(["movie", "tv"]),
  tmdbId: z.number().int().positive(),
  season: z.number().int().positive().nullable().optional(),
  episode: z.number().int().positive().nullable().optional(),
  positionPct: z.number().min(0).max(100),
  durationSec: z.number().int().positive().nullable().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  // 0 = sentinel "no aplica" (películas o episodio sin especificar)
  const season = data.mediaType === "tv" ? data.season ?? 0 : 0;
  const episode = data.mediaType === "tv" ? data.episode ?? 0 : 0;

  const item = await prisma.watchProgress.upsert({
    where: {
      userId_mediaType_tmdbId_season_episode: {
        userId: session.user.id,
        mediaType: data.mediaType,
        tmdbId: data.tmdbId,
        season,
        episode,
      },
    },
    update: {
      positionPct: data.positionPct,
      durationSec: data.durationSec ?? undefined,
    },
    create: {
      userId: session.user.id,
      mediaType: data.mediaType,
      tmdbId: data.tmdbId,
      season,
      episode,
      positionPct: data.positionPct,
      durationSec: data.durationSec ?? null,
    },
  });

  return NextResponse.json({ ok: true, id: item.id });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? 12)));

  const items = await prisma.watchProgress.findMany({
    where: { userId: session.user.id, positionPct: { lt: 95 } },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ items });
}
