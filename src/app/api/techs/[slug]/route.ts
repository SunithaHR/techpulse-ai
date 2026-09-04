import { techDetail } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await techDetail(slug);
  if (!data) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(data);
}