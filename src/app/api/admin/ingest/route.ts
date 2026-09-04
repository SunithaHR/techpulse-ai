import { requireAdmin } from "@/lib/auth";
import { runIngestion } from "@/lib/ingest/runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  await requireAdmin();
  const { sourceId, kind } = await req.json().catch(() => ({}));
  try {
    const result = await runIngestion({ sourceId: sourceId ?? undefined, kind: kind ?? undefined });
    return Response.json({ ok: true, ...result });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}