import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ModelRowCard, NewsCardSlim } from "@/components/cards";
import { BrandAvatar, Chip, Card, ExternalLink, SectionHeader, Stat } from "@/components/ui";
import { Icon } from "@/components/icons";
import { modelDetail } from "@/lib/data";
import { prisma } from "@/lib/db";
import { FollowButton, SaveButton } from "@/components/actions";
import { getSession } from "@/lib/auth";
import { asArray, asObject, asBool, fmtDate, formatPricePerM } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const m = await prisma.aIModel.findUnique({ where: { slug } });
  return { title: m?.name ?? "Model", description: m?.description };
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  const data = await modelDetail(slug);
  if (!data) notFound();
  const { model, siblings, relatedNews } = data;
  const caps = asObject<Record<string, boolean>>(model.capabilities);
  const pricing = asObject<{ inputPerM?: number; outputPerM?: number; cachedInputPerM?: number }>(model.pricing);
  const bench = asObject<Record<string, { score?: string | number; note?: string; link?: string }>>(model.benchmarks);
  const modalities = asArray<string>(model.modalities);

  const capList: Array<[string, boolean]> = [
    ["Reasoning", asBool(caps.reasoning)],
    ["Tool calling", asBool(caps.toolCalling)],
    ["Structured output", asBool(caps.structuredOutput)],
    ["Vision", asBool(caps.vision)],
    ["Audio", asBool(caps.audio)],
    ["Image generation", asBool(caps.imageGeneration)],
    ["Code", asBool(caps.code)],
    ["Web search", asBool(caps.webSearch)],
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start gap-4">
        <BrandAvatar name={model.name} accent={model.provider.accent} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">{model.name}</h1>
            {model.version && <Chip>v{model.version}</Chip>}
            {model.openSource ? <Chip tone="accent">Open weights</Chip> : <Chip>Proprietary</Chip>}
            {model.status !== "STABLE" && <Chip tone="accent">{model.status}</Chip>}
          </div>
          <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[color:var(--text-2)]">{model.description}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[color:var(--text-3)]">
            <Link href={`/companies/${model.provider.slug}`} className="inline-flex items-center gap-1.5 hover:text-cyan-500">
              <Icon name="building-2" size={12} /> {model.provider.name}
            </Link>
            {model.releasedOn && <span>Released {fmtDate(model.releasedOn)}</span>}
            {model.license && <span>{model.license}</span>}
            {model.docsUrl && <ExternalLink href={model.docsUrl}>Docs</ExternalLink>}
            {model.cardUrl && <ExternalLink href={model.cardUrl}>Model card</ExternalLink>}
          </div>
        </div>
        {session && (
          <div className="flex items-center gap-1.5">
            <FollowButton entityType="AIMODEL" entityId={model.slug} label={model.name} />
            <SaveButton entityType="AIMODEL" entityId={model.slug} label={model.name} />
          </div>
        )}
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Context window" value={model.contextWindow ? `${(model.contextWindow / 1000).toFixed(0)}K` : "—"} hint="tokens" />
        <Stat label="Max output" value={model.maxOutput ? `${(model.maxOutput / 1000).toFixed(0)}K` : "—"} hint="tokens" />
        <Stat label="Input price" value={formatPricePerM(pricing.inputPerM)} hint="per 1M tokens" />
        <Stat label="Output price" value={formatPricePerM(pricing.outputPerM)} hint="per 1M tokens" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold"><Icon name="zap" size={14} className="text-cyan-400" /> Capabilities</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {capList.map(([label, on]) => (
                <div key={label} className={`rounded-lg px-3 py-2.5 text-[12px] font-medium ring-1 ring-inset ${on ? "bg-emerald-400/8 text-emerald-500 ring-emerald-400/25 dark:text-emerald-300" : "bg-[color:var(--panel-2)] text-[color:var(--text-3)] ring-[color:var(--border)]"}`}>
                  {on ? <Icon name="check" size={12} className="mr-1 inline" /> : <Icon name="x" size={12} className="mr-1 inline" />}{label}
                </div>
              ))}
            </div>
            {modalities.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {modalities.map((m) => <Chip key={m}>{m}</Chip>)}
              </div>
            )}
          </Card>

          {Object.keys(bench).length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold"><Icon name="chart" size={14} className="text-violet-400" /> Benchmarks</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(bench).map(([name, b]) => (
                  <div key={name} className="flex items-center justify-between rounded-lg bg-[color:var(--panel-2)] px-3 py-2.5 ring-1 ring-inset ring-[color:var(--border)]">
                    <span className="text-[12px] text-[color:var(--text-2)]">{name}</span>
                    <span className="font-mono text-[13px] font-semibold">{String(b.score ?? "")}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {model.apiAvailable && (
            <Card className="p-5">
              <h2 className="mb-1 flex items-center gap-2 text-[13px] font-semibold"><Icon name="key" size={14} className="text-amber-400" /> API</h2>
              <p className="text-[12.5px] text-[color:var(--text-2)]">
                Available via {model.provider.name}&apos;s API. {pricing.cachedInputPerM != null && <>Cached input: {formatPricePerM(pricing.cachedInputPerM)} / 1M tokens. </>}
                {model.docsUrl && <ExternalLink href={model.docsUrl}>Read the docs →</ExternalLink>}
              </p>
            </Card>
          )}
        </div>

        <div className="space-y-4 lg:col-span-2">
          {siblings.length > 0 && (
            <div>
              <SectionHeader title="Same family" />
              <div className="space-y-2.5">
                {siblings.map((s) => <ModelRowCard key={s.id} m={s} />)}
              </div>
            </div>
          )}
          {relatedNews.length > 0 && (
            <div>
              <SectionHeader title="Related news" />
              <div className="panel divide-y divide-[color:var(--border)] px-4">
                {relatedNews.map((n) => <NewsCardSlim key={n.id} item={n} />)}
              </div>
            </div>
          )}
        </div>
      </div>

      <Card className="p-5">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold"><Icon name="sparkles" size={14} className="text-violet-400" /> Compare this model</h2>
        <p className="mt-1 text-[12.5px] text-[color:var(--text-2)]">Stack {model.name} against any other tracked model — context, pricing, capabilities side by side.</p>
        <Link href={`/compare?kind=MODELS&ids=${model.slug}`} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--panel-2)] px-3 py-2 text-[12.5px] font-medium ring-1 ring-inset ring-[color:var(--border)] hover:bg-[color:var(--hover)]">
          <Icon name="scale" size={14} /> Compare now
        </Link>
      </Card>
    </div>
  );
}