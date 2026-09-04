import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { answer, buildContext, type ChatSource } from "@/lib/chat/engine";
import { streamGrounded, sleep } from "@/lib/chat/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatMeta {
  lastSubject?: string | null;
}

function sse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {
  const session = await getSession();
  let body: { message?: string; chatId?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
  const question = (body.message ?? "").trim();
  if (!question) return new Response(JSON.stringify({ error: "message is required" }), { status: 400, headers: { "Content-Type": "application/json" } });

  // ── Load prior conversation ──────────────────────────────────────────────
  let chatId: string | null = body.chatId ?? null;
  let history: { role: string; content: string }[] = [];
  let meta: ChatMeta = {};
  if (chatId && session) {
    const chat = await prisma.chat.findFirst({ where: { id: chatId, userId: session.sub } });
    if (chat) {
      meta = (chat.meta as ChatMeta) ?? {};
      const msgs = await prisma.message.findMany({ where: { chatId }, orderBy: { createdAt: "asc" }, select: { role: true, content: true } });
      history = msgs.map((m) => ({ role: m.role, content: m.content }));
    } else {
      chatId = null;
    }
  }

  // ── Grounded local answer (always available) ─────────────────────────────
  const local = await answer(question, { history, lastSubject: meta.lastSubject });
  const newSubject = local.subject ?? meta.lastSubject ?? null;

  // ── Optional LLM path ────────────────────────────────────────────────────
  const grounded = await buildContext(question, { history, lastSubject: meta.lastSubject });
  const llmStream = await streamGrounded({
    question,
    context: grounded.context,
    scopeSummary: grounded.scopeSummary,
    history,
  });

  if (llmStream) {
    // Stream the LLM, accumulate, then persist and emit the final event.
    const encoder = new TextEncoder();
    const reader = llmStream.getReader();
    let full = "";
    let done = false;
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          while (!done) {
            const { value } = await reader.read();
            if (value) {
              full += value;
              controller.enqueue(encoder.encode(sse({ delta: value })));
              await sleep(8);
            } else {
              done = true;
            }
          }
        } catch {
          // fall back to the local answer if the provider hiccups mid-stream
        }
        if (!full.trim()) full = local.text;
        const { chat, message, sources } = await persist(session?.sub, chatId, question, full, local.sources, newSubject);
        controller.enqueue(
          encoder.encode(
            sse({ done: true, chatId: chat.id, messageId: message.id, sources, followUps: local.followUps }),
          ),
        );
        controller.close();
      },
      cancel() {
        reader.cancel().catch(() => {});
      },
    });
    return new Response(readable, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
    });
  }

  // ── Local engine path: persist, then stream the grounded text ────────────
  const { chat, message, sources } = await persist(session?.sub, chatId, question, local.text, local.sources, newSubject);
  chatId = chat.id;
  const text = local.text;
  const encoder = new TextEncoder();
  const CHUNK = 40;
  let i = 0;
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      while (i < text.length) {
        const piece = text.slice(i, i + CHUNK);
        i += CHUNK;
        controller.enqueue(encoder.encode(sse({ delta: piece })));
        await sleep(14);
      }
      controller.enqueue(
        encoder.encode(sse({ done: true, chatId, messageId: message.id, sources, followUps: local.followUps })),
      );
      controller.close();
    },
  });
  return new Response(readable, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}

async function persist(
  userId: string | undefined,
  chatId: string | null,
  question: string,
  answerText: string,
  sources: ChatSource[],
  subject: string | null,
): Promise<{ chat: { id: string }; message: { id: string }; sources: ChatSource[] }> {
  if (!userId) {
    return { chat: { id: chatId ?? "" }, message: { id: "" }, sources };
  }
  const meta = JSON.parse(JSON.stringify({ lastSubject: subject ?? null }));
  const chat = chatId
    ? await prisma.chat.update({ where: { id: chatId }, data: { meta, updatedAt: new Date() }, select: { id: true } })
    : await prisma.chat.create({ data: { userId, title: question.slice(0, 70), meta }, select: { id: true } });
  const userMsg = await prisma.message.create({ data: { chatId: chat.id, role: "USER", content: question }, select: { id: true } });
  const asst = await prisma.message.create({
    data: {
      chatId: chat.id,
      role: "ASSISTANT",
      content: answerText,
      sources: sources.length ? (sources as unknown as object) : undefined,
    },
    select: { id: true },
  });
  void userMsg;
  return { chat, message: asst, sources };
}