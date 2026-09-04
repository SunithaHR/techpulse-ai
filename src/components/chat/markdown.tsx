"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import Link from "next/link";
import { CopyButton } from "@/components/actions";
import { Icon } from "@/components/icons";
import type { ChatSource } from "@/lib/chat/engine";

export function Markdown({ content, sources }: { content: string; sources?: ChatSource[] | null }) {
  return (
    <div className="tp-md text-[13.5px] leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ href, children }) => {
            if (!href) return <span>{children}</span>;
            const isInternal = href.startsWith("/");
            if (isInternal) {
              return <Link href={href} className="text-cyan-600 underline-offset-2 hover:underline dark:text-cyan-300">{children}</Link>;
            }
            return <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-600 underline-offset-2 hover:underline dark:text-cyan-300">{children}</a>;
          },
          pre: ({ children }) => <pre className="!my-3 overflow-x-auto rounded-xl bg-[#0b0f17] p-4 text-[12.5px] leading-relaxed text-slate-200 ring-1 ring-inset ring-white/10">{children}</pre>,
          code: (props) => {
            const { className, children, ...rest } = props as any;
            const match = /language-(\w+)/.exec(className ?? "");
            if (match) {
              return (
                <code className={`${className ?? ""} block font-mono`} {...rest}>{children}</code>
              );
            }
            return <code className="rounded bg-[color:var(--panel-2)] px-1 py-0.5 font-mono text-[12px] text-cyan-500 ring-1 ring-inset ring-[color:var(--border)]" {...rest}>{children}</code>;
          },
          table: ({ children }) => <div className="my-3 overflow-x-auto"><table className="w-full border-collapse text-[12.5px]">{children}</table></div>,
          th: ({ children }) => <th className="border-b border-[color:var(--border)] px-3 py-2 text-left font-semibold text-[color:var(--text)]">{children}</th>,
          td: ({ children }) => <td className="border-b border-[color:var(--border)] px-3 py-2 text-[color:var(--text-2)]">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
      {sources && sources.length > 0 && (
        <div className="mt-4 rounded-xl bg-[color:var(--panel-2)] p-3 ring-1 ring-inset ring-[color:var(--border)]">
          <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-[color:var(--text-3)]">Sources</div>
          <ol className="space-y-1">
            {sources.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px]">
                <span className="mt-px inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-cyan-400/15 font-mono text-[10px] font-bold text-cyan-500">{i + 1}</span>
                <span className="min-w-0">
                  {s.href ? (
                    <Link href={s.href} className="font-medium text-[color:var(--text)] hover:text-cyan-500">{s.title}</Link>
                  ) : (
                    <span className="font-medium text-[color:var(--text)]">{s.title}</span>
                  )}
                  {s.label && <span className="ml-1.5 text-[10.5px] uppercase tracking-wide text-[color:var(--text-3)]">· {s.label}</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export function CodeBlockHeader({ code }: { code: string }) {
  return (
    <div className="flex items-center justify-between rounded-t-xl bg-[#0b0f17] px-3 py-1.5 ring-1 ring-inset ring-white/10">
      <span className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-400"><Icon name="code2" size={11} /> code</span>
      <CopyButton text={code} />
    </div>
  );
}