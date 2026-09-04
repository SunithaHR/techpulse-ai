import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ChatUI, type ChatListItem, type ChatMessage } from "@/components/chat/chat-ui";

export const metadata: Metadata = { title: "AI Chat" };
export const dynamic = "force-dynamic";

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ chatId?: string; q?: string }> }) {
  const sp = await searchParams;
  const session = await getSession();

  let chats: ChatListItem[] = [];
  let messages: ChatMessage[] = [];
  let activeId: string | null = null;

  if (session) {
    chats = (await prisma.chat.findMany({
      where: { userId: session.sub },
      select: { id: true, title: true, updatedAt: true, _count: { select: { messages: true } } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    })) as unknown as ChatListItem[];

    const openId = sp.chatId && chats.some((c) => c.id === sp.chatId) ? sp.chatId : null;
    if (openId) {
      activeId = openId;
      const chat = await prisma.chat.findFirst({
        where: { id: openId, userId: session.sub },
        include: { messages: { orderBy: { createdAt: "asc" }, select: { id: true, role: true, content: true, sources: true } } },
      });
      messages = (chat?.messages ?? []).map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        sources: Array.isArray(m.sources) ? m.sources : null,
      })) as unknown as ChatMessage[];
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 top-14 z-20 lg:left-[232px]">
      <ChatUI
        initialChats={chats}
        initialMessages={messages}
        initialChatId={activeId}
        initialQuery={sp.q ?? null}
        user={session ? { id: session.sub, name: session.name, email: session.email } : null}
      />
    </div>
  );
}