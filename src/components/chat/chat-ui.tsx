"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn, timeAgo } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { Markdown } from "@/components/chat/markdown";
import type { ChatSource } from "@/lib/chat/engine";

export interface ChatListItem {
  id: string;
  title: string;
  updatedAt: string | Date;
  _count?: { messages: number };
}

export interface ChatMessage {
  id?: string;
  role: string;
  content: string;
  sources?: ChatSource[] | null;
  followUps?: string[];
  streaming?: boolean;
  error?: boolean;
}

interface UiUser {
  id: string;
  name: string | null;
  email: string;
}

const SUGGESTIONS = [
  "What are the most important AI releases this week?",
  "Compare GPT vs Claude",
  "What changed recently in React?",
  "Are there any critical security advisories right now?",
  "What happened in technology yesterday?",
];

export function ChatUI({
  initialChats,
  initialMessages,
  initialChatId,
  initialQuery,
  user,
}: {
  initialChats: ChatListItem[];
  initialMessages: ChatMessage[];
  initialChatId: string | null;
  initialQuery: string | null;
  user: UiUser | null;
}) {
  const [chats, setChats] = useState<ChatListItem[]>(initialChats);
  const [activeId, setActiveId] = useState<string | null>(initialChatId);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [mobileList, setMobileList] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const refreshChats = useCallback(async (afterId?: string | null) => {
    if (!user) return;
    try {
      const res = await fetch("/api/chats");
      if (res.ok) {
        const list = (await res.json()) as ChatListItem[];
        setChats(list);
        if (afterId && !list.some((c) => c.id === afterId)) setActiveId(null);
      }
    } catch {
      // ignore
    }
  }, [user]);

  // Auto-send a deep-linked question once.
  useEffect(() => {
    if (!hydrated || !initialQuery || messages.length > 0) return;
    void send(initialQuery, { appendUser: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  async function send(text: string, opts: { appendUser?: boolean } = {}) {
    const q = text.trim();
    if (!q || busy) return;
    setBusy(true);
    if (opts.appendUser !== false) {
      setMessages((m) => [...m, { role: "USER", content: q }]);
    }
    setMessages((m) => [...m, { role: "ASSISTANT", content: "", streaming: true }]);
    setInput("");
    setMobileList(false);

    const controller = new AbortController();
    abortRef.current = controller;
    let finalChatId: string | null = null;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, chatId: activeId }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error(`chat failed (${res.status})`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let sources: ChatSource[] | null = null;
      let followUps: string[] = [];

      const appendDelta = (delta: string) => {
        setMessages((m) => {
          const copy = [...m];
          for (let i = copy.length - 1; i >= 0; i--) {
            if (copy[i].role === "ASSISTANT" && copy[i].streaming) {
              copy[i] = { ...copy[i], content: copy[i].content + delta };
              break;
            }
          }
          return copy;
        });
      };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          try {
            const evt = JSON.parse(trimmed.slice(5).trim());
            if (typeof evt.delta === "string") {
              appendDelta(evt.delta);
            } else if (evt.done) {
              finalChatId = evt.chatId ?? null;
              sources = evt.sources ?? null;
              followUps = evt.followUps ?? [];
            }
          } catch {
            // skip partial frames
          }
        }
      }

      setMessages((m) => {
        const copy = [...m];
        for (let i = copy.length - 1; i >= 0; i--) {
          if (copy[i].role === "ASSISTANT" && copy[i].streaming) {
            copy[i] = { ...copy[i], streaming: false, id: undefined, sources, followUps, error: copy[i].content.length === 0 };
            break;
          }
        }
        return copy;
      });
      if (finalChatId) setActiveId(finalChatId);
      await refreshChats(finalChatId);
    } catch (e: unknown) {
      if ((e as Error)?.name === "AbortError") {
        setMessages((m) => {
          const copy = [...m];
          for (let i = copy.length - 1; i >= 0; i--) {
            if (copy[i].role === "ASSISTANT" && copy[i].streaming) {
              copy[i] = { ...copy[i], streaming: false, error: copy[i].content.length === 0 };
              break;
            }
          }
          return copy;
        });
      } else {
        setMessages((m) => {
          const copy = [...m];
          for (let i = copy.length - 1; i >= 0; i--) {
            if (copy[i].role === "ASSISTANT" && copy[i].streaming) {
              copy[i] = { ...copy[i], streaming: false, error: true, content: "⚠️ Something went wrong generating a response. Please try again." };
              break;
            }
          }
          return copy;
        });
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }

  const stop = () => abortRef.current?.abort();

  function regenerate() {
    const lastUser = [...messages].reverse().find((m) => m.role === "USER");
    if (!lastUser || busy) return;
    setMessages((m) => m.slice(0, -1));
    void send(lastUser.content, { appendUser: false });
  }

  async function openChat(id: string) {
    if (!user) return;
    try {
      const res = await fetch(`/api/chats/${id}`);
      if (!res.ok) return;
      const chat = await res.json();
      setMessages(
        chat.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          sources: Array.isArray(m.sources) ? m.sources : null,
        })),
      );
      setActiveId(id);
      setMobileList(false);
    } catch {
      // ignore
    }
  }

  function newChat() {
    if (busy) return;
    setActiveId(null);
    setMessages([]);
    setMobileList(false);
    inputRef.current?.focus();
  }

  async function deleteChat(id: string) {
    if (!user) return;
    await fetch(`/api/chats/${id}`, { method: "DELETE" }).catch(() => {});
    setChats((list) => list.filter((c) => c.id !== id));
    if (activeId === id) newChat();
  }

  const filteredChats = chats.filter((c) => c.title.toLowerCase().includes(chatSearch.toLowerCase()));

  return (
    <div className="flex h-full bg-[color:var(--bg)]">
      {/* Sidebar */}
      <aside className={cn("z-30 flex w-72 shrink-0 flex-col border-r border-[color:var(--border)] bg-[color:var(--panel)]", mobileList ? "absolute inset-y-0 left-0 md:static" : "hidden md:flex")}>
        <div className="flex items-center gap-2 p-3">
          <button
            onClick={newChat}
            disabled={busy}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-b from-cyan-500 to-cyan-600 text-[13px] font-medium text-white shadow-sm shadow-cyan-500/25 hover:from-cyan-400 disabled:opacity-50"
          >
            <Icon name="plus" size={14} /> New chat
          </button>
        </div>
        <div className="px-3 pb-2">
          <div className="flex h-8 items-center gap-2 rounded-lg bg-[color:var(--panel-2)] px-2.5 ring-1 ring-inset ring-[color:var(--border)]">
            <Icon name="search" size={13} className="text-[color:var(--text-3)]" />
            <input
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Search conversations…"
              className="h-full w-full bg-transparent text-[12.5px] outline-none placeholder:text-[color:var(--text-3)]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {!user && (
            <div className="mx-1 mb-2 rounded-lg bg-violet-400/8 p-2.5 text-[11.5px] leading-relaxed text-[color:var(--text-2)] ring-1 ring-inset ring-violet-400/20">
              <Icon name="key" size={12} className="mr-1 inline text-violet-400" />
              <Link href="/login" className="font-semibold text-violet-400 hover:underline">Sign in</Link> to keep conversations across sessions.
            </div>
          )}
          {filteredChats.length === 0 && (
            <div className="px-2 py-6 text-center text-[11.5px] text-[color:var(--text-3)]">No conversations yet</div>
          )}
          {filteredChats.map((c) => (
            <div key={c.id} className={cn("group flex items-center gap-1 rounded-lg pr-1", activeId === c.id ? "bg-cyan-400/10" : "hover:bg-[color:var(--hover)]")}>
              <button
                onClick={() => openChat(c.id)}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2.5 py-2 text-left"
              >
                <Icon name="message" size={13} className={cn("shrink-0", activeId === c.id ? "text-cyan-500" : "text-[color:var(--text-3)]")} />
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] font-medium text-[color:var(--text)]">{c.title}</span>
                  <span className="block text-[10.5px] text-[color:var(--text-3)]">{timeAgo(c.updatedAt)}</span>
                </span>
              </button>
              <button onClick={() => deleteChat(c.id)} aria-label="Delete chat" className="hidden h-6 w-6 shrink-0 items-center justify-center rounded text-[color:var(--text-3)] hover:text-red-400 group-hover:flex">
                <Icon name="trash" size={12} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[color:var(--border)] px-3">
          <button onClick={() => setMobileList(true)} className="rounded-lg p-1.5 text-[color:var(--text-2)] hover:bg-[color:var(--hover)] md:hidden" aria-label="Conversations">
            <Icon name="menu" size={17} />
          </button>
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[color:var(--text)]">
            <Icon name="bot" size={15} className="text-violet-400" /> TechPulse AI
          </div>
          <span className="hidden rounded bg-[color:var(--panel-2)] px-1.5 py-px text-[10px] font-medium text-[color:var(--text-3)] ring-1 ring-inset ring-[color:var(--border)] sm:inline">technology-only assistant</span>
          {busy && (
            <button onClick={stop} className="ml-auto flex items-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-[11.5px] font-medium text-red-400 ring-1 ring-inset ring-red-400/30 hover:bg-red-500/20">
              <Icon name="stop-circle" size={13} /> Stop
            </button>
          )}
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-6">
            {messages.length === 0 && (
              <div className="pt-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 ring-1 ring-inset ring-white/10">
                  <Icon name="bot" size={26} className="text-cyan-400" />
                </div>
                <h2 className="text-lg font-bold tracking-tight text-[color:var(--text)]">Ask TechPulse AI</h2>
                <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-[color:var(--text-2)]">
                  Grounded in the TechPulse knowledge base — releases, models, tools, security and news. Technology questions only.
                </p>
                <div className="mx-auto mt-6 grid max-w-xl gap-2 sm:grid-cols-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => void send(s)} disabled={busy}
                      className="rounded-xl bg-[color:var(--panel-2)] px-3.5 py-3 text-left text-[12.5px] text-[color:var(--text-2)] ring-1 ring-inset ring-[color:var(--border)] transition hover:bg-[color:var(--hover)] hover:text-[color:var(--text)] disabled:opacity-50">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-5">
              {messages.map((m, i) =>
                m.role === "USER" ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-b from-cyan-500 to-cyan-600 px-4 py-2.5 text-[13.5px] leading-relaxed text-white shadow-sm shadow-cyan-500/20">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 text-white">
                      <Icon name="sparkles" size={13} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="rounded-2xl rounded-tl-md bg-[color:var(--panel)] px-4 py-3 ring-1 ring-inset ring-[color:var(--border)]">
                        {m.streaming && !m.content ? (
                          <span className="flex items-center gap-1.5 py-1 text-[12.5px] text-[color:var(--text-3)]">
                            <Icon name="loader" size={13} className="animate-spin text-cyan-400" /> Thinking…
                          </span>
                        ) : m.error && !m.content ? (
                          <span className="text-[13px] text-red-400">Response interrupted.</span>
                        ) : (
                          <Markdown content={m.content} sources={m.sources} />
                        )}
                      </div>
                      {!m.streaming && m.followUps && m.followUps.length > 0 && !m.error && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {m.followUps.map((f) => (
                            <button key={f} onClick={() => void send(f)} disabled={busy}
                              className="rounded-full bg-[color:var(--panel-2)] px-3 py-1.5 text-[11.5px] font-medium text-[color:var(--text-2)] ring-1 ring-inset ring-[color:var(--border)] transition hover:bg-cyan-400/10 hover:text-cyan-500 disabled:opacity-50">
                              {f}
                            </button>
                          ))}
                          <button onClick={regenerate} disabled={busy} title="Regenerate response"
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--panel-2)] text-[color:var(--text-3)] ring-1 ring-inset ring-[color:var(--border)] transition hover:text-[color:var(--text)] disabled:opacity-50">
                            <Icon name="refresh" size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ),
              )}
              {busy && !messages.some((m) => m.streaming) && (
                <div className="flex items-center gap-2 px-1 text-[12px] text-[color:var(--text-3)]">
                  <Icon name="loader" size={12} className="animate-spin" /> working…
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t border-[color:var(--border)] bg-[color:var(--panel)]/70 p-3 backdrop-blur">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 rounded-2xl bg-[color:var(--panel-2)] p-2 ring-1 ring-inset ring-[color:var(--border)] focus-within:ring-2 focus-within:ring-cyan-400/50">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                rows={1}
                placeholder="Ask about releases, models, security, companies… (Enter to send, Shift+Enter for newline)"
                className="max-h-40 min-h-[38px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[13.5px] text-[color:var(--text)] outline-none placeholder:text-[color:var(--text-3)]"
              />
              <button
                onClick={() => void send(input)}
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-cyan-500 to-cyan-600 text-white shadow-sm shadow-cyan-500/25 transition hover:from-cyan-400 disabled:opacity-40"
              >
                <Icon name="send" size={15} />
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10.5px] text-[color:var(--text-3)]">
              TechPulse AI may make mistakes — answers are grounded in tracked data and cite their sources.
            </p>
          </div>
        </div>
      </main>

      {/* Mobile list overlay */}
      {mobileList && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileList(false)}>
          <div className="absolute inset-y-0 left-0 w-72 bg-[color:var(--panel)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-12 items-center justify-between px-3">
              <span className="text-[13px] font-semibold">Conversations</span>
              <button onClick={() => setMobileList(false)} className="rounded-lg p-1.5 text-[color:var(--text-3)] hover:bg-[color:var(--hover)]"><Icon name="x" size={16} /></button>
            </div>
            <div className="space-y-1 px-2">
              {chats.map((c) => (
                <button key={c.id} onClick={() => openChat(c.id)} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left">
                  <span className="truncate text-[12.5px] font-medium text-[color:var(--text)]">{c.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}