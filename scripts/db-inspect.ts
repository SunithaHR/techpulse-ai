import { prisma } from "../src/lib/db";

async function main() {
  const rows = await prisma.news.findMany({ select: { publishedAt: true }, orderBy: { publishedAt: "desc" } });
  const byDay = new Map<string, number>();
  for (const r of rows) {
    const k = r.publishedAt.toISOString().slice(0, 10);
    byDay.set(k, (byDay.get(k) ?? 0) + 1);
  }
  console.log("total news:", rows.length);
  console.log([...byDay.entries()].slice(0, 40).map(([d, c]) => `${d}: ${c}`).join("\n"));
  const counts = {
    categories: await prisma.category.count(),
    sources: await prisma.source.count(),
    companies: await prisma.company.count(),
    technologies: await prisma.technology.count(),
    models: await prisma.aIModel.count(),
    tools: await prisma.aITool.count(),
    repos: await prisma.repository.count(),
    releases: await prisma.release.count(),
    news: await prisma.news.count(),
    advisories: await prisma.securityAdvisory.count(),
    users: await prisma.user.count(),
  };
  console.log("counts:", JSON.stringify(counts));
  await prisma.$disconnect();
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
