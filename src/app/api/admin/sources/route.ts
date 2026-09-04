import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();
  const sources = await prisma.source.findMany({ orderBy: { reliability: "desc" }, include: { _count: { select: { news: true, ingestionJobs: true } } } });
  return Response.json({ items: sources });
}

export async function POST(req: Request) {
  await requireAdmin();
  const body = await req.json().catch(() => ({}));
  const { name, type, url, feedUrl, reliability, homepage, description } = body;
  if (!name || !type || !url) {
    return Response.json({ error: "name, type and url are required" }, { status: 400 });
  }
  const source = await prisma.source.create({
    data: {
      slug: slugify(String(name)),
      name: String(name),
      type: String(type),
      url: String(url),
      homepage: homepage ? String(homepage) : null,
      description: description ? String(description) : null,
      feedUrl: feedUrl ? String(feedUrl) : null,
      reliability: Math.min(10, Math.max(1, parseInt(reliability, 10) || 5)),
    },
  });
  return Response.json({ item: source });
}