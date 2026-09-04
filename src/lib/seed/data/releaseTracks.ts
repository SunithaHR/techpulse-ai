// Flagship "tracked" technologies that get curated, always-consistent release
// rows + announcements in the timeline. Other technologies get procedural
// releases from the generic generator. Illustrative sample versions.
export interface ReleaseTrack {
  name: string; // must match a Technology catalog name
  current: string; // newest version
  cadenceDays: number; // approximate days between releases
  style: "patch" | "minor" | "mixed";
  blurb: string; // summary line used in the release announcement story
  releaseImportance?: string; // base importance for announcements
}

export const RELEASE_TRACKS: ReleaseTrack[] = [
  { name: "React", current: "19.3.0", cadenceDays: 9, style: "minor", blurb: "React 19.3 focuses on compiler-driven memoization and server-component ergonomics." },
  { name: "Next.js", current: "16.3.2", cadenceDays: 6, style: "mixed", blurb: "Next.js 16.x ships faster static exports, image improvements and Turbopack stability.", releaseImportance: "HIGH" },
  { name: "TypeScript", current: "6.0.1", cadenceDays: 10, style: "mixed", blurb: "TypeScript 6.0 brings the new type-checking architecture to general availability." },
  { name: "Vue", current: "3.6.4", cadenceDays: 11, style: "minor", blurb: "Vue 3.6 refines reactivity transforms and adds compiler warnings for common pitfalls." },
  { name: "Svelte", current: "5.35.0", cadenceDays: 8, style: "mixed", blurb: "Svelte 5.x runes continue to mature with better TypeScript inference." },
  { name: "Angular", current: "21.1.0", cadenceDays: 14, style: "minor", blurb: "Angular 21 keeps trimming bundle sizes and hardening the zoneless change detection default." },
  { name: "Astro", current: "5.12.1", cadenceDays: 9, style: "mixed", blurb: "Astro 5.x adds islands streaming and deeper content-layer integrations." },
  { name: "Vite", current: "7.3.0", cadenceDays: 12, style: "minor", blurb: "Vite 7 pushes the Rolldown-powered build forward with plugin compatibility fixes.", releaseImportance: "HIGH" },
  { name: "Tailwind CSS", current: "4.2.1", cadenceDays: 10, style: "patch", blurb: "Tailwind 4.2 hardens the CSS-first configuration and speeds up watch mode." },
  { name: "Node.js", current: "24.9.0", cadenceDays: 7, style: "mixed", blurb: "Node.js 24 LTS line gains performance work in the HTTP stack and better ESM interop." },
  { name: "Deno", current: "2.7.0", cadenceDays: 13, style: "mixed", blurb: "Deno 2.7 improves the npm compat layer and compiler plugin DX." },
  { name: "Bun", current: "1.4.2", cadenceDays: 8, style: "patch", blurb: "Bun 1.4 keeps pushing runtime speed and adds package-manager features." },
  { name: "Python", current: "3.14.3", cadenceDays: 12, style: "patch", blurb: "Python 3.14 patch releases stabilize the new free-threaded and JIT previews." },
  { name: "Go", current: "1.25.6", cadenceDays: 14, style: "patch", blurb: "Go 1.25 patch releases refine the new weak pointers and toolchain management." },
  { name: "Rust", current: "1.90.1", cadenceDays: 15, style: "minor", blurb: "Rust 1.90 stabilizes new trait and pattern capabilities for the 2024 edition." },
  { name: "PostgreSQL", current: "18.2.0", cadenceDays: 12, style: "patch", blurb: "PostgreSQL 18 minors add stability fixes and new JSON query performance work." },
  { name: "Redis", current: "8.2.1", cadenceDays: 10, style: "mixed", blurb: "Redis 8.2 introduces vector set improvements and faster cluster failover." },
  { name: "MongoDB", current: "8.2.1", cadenceDays: 16, style: "mixed", blurb: "MongoDB 8.x adds time-series refinements and vector search performance gains." },
  { name: "DuckDB", current: "1.6.1", cadenceDays: 11, style: "mixed", blurb: "DuckDB 1.6 expands the extension ecosystem and parquet performance." },
  { name: "Kubernetes", current: "1.35.2", cadenceDays: 13, style: "minor", blurb: "Kubernetes 1.35 stabilizes workload scheduling improvements and cleans up deprecated APIs.", releaseImportance: "HIGH" },
  { name: "Docker", current: "29.0.3", cadenceDays: 11, style: "mixed", blurb: "Docker Engine 29 improves buildkit caching and rootless networking." },
  { name: "Terraform", current: "1.14.1", cadenceDays: 14, style: "minor", blurb: "Terraform 1.14 refines provider-defined functions and state operations." },
  { name: "Grafana", current: "12.6.2", cadenceDays: 10, style: "mixed", blurb: "Grafana 12.x unifies dashboards and adds AI-assisted alert explanations." },
  { name: "Flutter", current: "3.33.1", cadenceDays: 12, style: "minor", blurb: "Flutter 3.33 improves Impeller shaders and web compile times.", releaseImportance: "HIGH" },
  { name: "React Native", current: "0.84.0", cadenceDays: 10, style: "minor", blurb: "React Native 0.84 continues the New Architecture rollout with fewer bridgeless gaps." },
  { name: "Prisma", current: "6.21.1", cadenceDays: 10, style: "patch", blurb: "Prisma 6.x adds query-planning improvements and driver adapter fixes." },
  { name: "FastAPI", current: "0.125.1", cadenceDays: 12, style: "patch", blurb: "FastAPI 0.125 sharpens Pydantic v2 integration and OpenAPI generation." },
  { name: "Django", current: "5.2.8", cadenceDays: 14, style: "patch", blurb: "Django 5.2 LTS patch releases backport security and bug fixes." },
  { name: "NestJS", current: "11.1.2", cadenceDays: 12, style: "patch", blurb: "NestJS 11 keeps maturing the modular architecture for TypeScript services." },
  { name: "Hono", current: "4.9.3", cadenceDays: 9, style: "patch", blurb: "Hono 4.9 adds middleware ecosystem polish for edge runtimes." },
  { name: "Express", current: "5.2.1", cadenceDays: 14, style: "patch", blurb: "Express 5.x patch releases harden the new router and middleware semantics." },
  { name: "Supabase", current: "1.9.0", cadenceDays: 10, style: "minor", blurb: "Supabase platform updates add branching and new Postgres feature support." },
  { name: "shadcn/ui", current: "2.6.0", cadenceDays: 11, style: "minor", blurb: "shadcn/ui 2.x adds new components and theme tokens for Tailwind v4." },
  { name: "Playwright", current: "1.60.0", cadenceDays: 12, style: "minor", blurb: "Playwright 1.60 expands the UI mode and mobile emulation coverage." },
  { name: "Fastify", current: "5.6.1", cadenceDays: 11, style: "patch", blurb: "Fastify 5 refines hooks and adds observability helpers." },
  { name: "ClickHouse", current: "25.9.1", cadenceDays: 14, style: "mixed", blurb: "ClickHouse quarterly releases bring new SQL features and query optimization." },
  { name: "OpenSearch", current: "3.4.2", cadenceDays: 12, style: "minor", blurb: "OpenSearch 3.x adds vector search and observability upgrades." },
  { name: "Drizzle ORM", current: "0.45.0", cadenceDays: 9, style: "patch", blurb: "Drizzle keeps tightening type inference for relational queries." },
  { name: "Zod", current: "4.1.2", cadenceDays: 14, style: "patch", blurb: "Zod 4 continues API polish from the major 4.0 rewrite." },
  { name: "Vitest", current: "4.0.8", cadenceDays: 9, style: "mixed", blurb: "Vitest 4 makes browser mode and workspace config the default path." },
  { name: "ESLint", current: "10.1.0", cadenceDays: 10, style: "minor", blurb: "ESLint 10 completes the unified-config migration story." },
  { name: "Helm", current: "4.0.3", cadenceDays: 14, style: "patch", blurb: "Helm 4 brings better OCI registry handling and simpler templating." },
  { name: "PyTorch", current: "2.10.1", cadenceDays: 13, style: "minor", blurb: "PyTorch 2.10 focuses on compile performance and new device backends." },
  { name: "Hugging Face Transformers", current: "5.1.0", cadenceDays: 10, style: "minor", blurb: "Transformers v5 streamlines the pipeline API and adds new architectures." },
];

export const TRACK_BY_NAME = new Map(RELEASE_TRACKS.map((t) => [t.name, t]));
