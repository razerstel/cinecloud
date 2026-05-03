import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const itemSchema = z.object({
  mediaType: z.enum(["movie", "tv"]),
  tmdbId: z.number().int().positive(),
});

async function readBody(req: Request) {
  try {
    return itemSchema.safeParse(await req.json());
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const items = await prisma.watchlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { addedAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const parsed = await readBody(req);
  if (!parsed || !parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { mediaType, tmdbId } = parsed.data;
  await prisma.watchlistItem.upsert({
    where: { userId_mediaType_tmdbId: { userId: session.user.id, mediaType, tmdbId } },
    create: { userId: session.user.id, mediaType, tmdbId },
    update: {},
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const parsed = await readBody(req);
  if (!parsed || !parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { mediaType, tmdbId } = parsed.data;
  await prisma.watchlistItem
    .delete({
      where: { userId_mediaType_tmdbId: { userId: session.user.id, mediaType, tmdbId } },
    })
    .catch(() => null);
  return NextResponse.json({ ok: true });
}
