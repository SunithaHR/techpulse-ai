// Seed catalog of technology companies. This is *illustrative sample data*
// generated for local development/demo purposes, not live-fetched facts.
export interface CompanySeed {
  slug: string;
  name: string;
  description: string;
  accent: string;
  website?: string;
  blogUrl?: string;
  githubOrg?: string;
  hq?: string;
  founded?: number;
  details?: Record<string, string>;
  featured?: boolean;
}

const C = (
  slug: string,
  name: string,
  description: string,
  accent: string,
  extra: Partial<Omit<CompanySeed, "slug" | "name" | "description" | "accent">> = {},
): CompanySeed => ({ slug, name, description, accent, ...extra });

export const COMPANIES: CompanySeed[] = [
  C("openai", "OpenAI", "AI research & deployment lab behind GPT, the o-series reasoning models, Sora and the OpenAI API.", "#10a37f", {
    website: "https://openai.com", blogUrl: "https://openai.com/blog", githubOrg: "openai", hq: "San Francisco, CA", founded: 2015,
    details: { ceo: "Sam Altman", funding: "Raised $6.6B at a $157B valuation (Oct 2024)" }, featured: true,
  }),
  C("anthropic", "Anthropic", "AI safety company behind the Claude model family and the Claude Code developer platform.", "#d97757", {
    website: "https://anthropic.com", blogUrl: "https://anthropic.com/news", githubOrg: "anthropics", hq: "San Francisco, CA", founded: 2021,
    details: { ceo: "Dario Amodei", funding: "$8.7B announced Nov 2024" }, featured: true,
  }),
  C("google", "Google", "Search & cloud giant — builds Gemini, DeepMind research, Android, Chrome and Google Cloud.", "#4285f4", {
    website: "https://about.google", blogUrl: "https://blog.google", githubOrg: "google", hq: "Mountain View, CA", founded: 1998,
    details: { ceo: "Sundar Pichai" }, featured: true,
  }),
  C("deepmind", "DeepMind", "Google's AI research lab — AlphaFold, AlphaProof and frontier Gemini research.", "#7f7fff", {
    website: "https://deepmind.google", blogUrl: "https://deepmind.google/blog", githubOrg: "google-deepmind", hq: "London, UK", founded: 2010,
  }),
  C("microsoft", "Microsoft", "Windows, Azure, GitHub, VS Code and .NET — plus the largest strategic partner of OpenAI.", "#00a4ef", {
    website: "https://microsoft.com", blogUrl: "https://blogs.microsoft.com", githubOrg: "microsoft", hq: "Redmond, WA", founded: 1975,
    details: { ceo: "Satya Nadella" }, featured: true,
  }),
  C("meta", "Meta", "Facebook, Instagram and WhatsApp parent; creator of the open-weight Llama models and PyTorch steward.", "#0866ff", {
    website: "https://about.meta.com", blogUrl: "https://about.fb.com/news", githubOrg: "facebook", hq: "Menlo Park, CA", founded: 2004,
    details: { ceo: "Mark Zuckerberg" }, featured: true,
  }),
  C("amazon", "Amazon", "E-commerce and AWS — cloud infrastructure plus AI via Bedrock and Trainium chips.", "#ff9900", {
    website: "https://aws.amazon.com", blogUrl: "https://aws.amazon.com/blogs", githubOrg: "aws", hq: "Seattle, WA", founded: 1994,
    details: { ceo: "Andy Jassy" }, featured: true,
  }),
  C("apple", "Apple", "iPhone, macOS, and the Apple Intelligence platform across its devices.", "#a2aaad", {
    website: "https://apple.com", blogUrl: "https://developer.apple.com/news", hq: "Cupertino, CA", founded: 1976, featured: true,
  }),
  C("nvidia", "NVIDIA", "GPU & AI compute leader — CUDA, cuDNN, DGX and the AI chip supply backbone.", "#76b900", {
    website: "https://nvidia.com", blogUrl: "https://blogs.nvidia.com", githubOrg: "NVIDIA", hq: "Santa Clara, CA", founded: 1993,
    details: { ceo: "Jensen Huang", stock: "NVDA" }, featured: true,
  }),
  C("xai", "xAI", "Elon Musk's AI company behind the Grok model family and the Colossus supercomputer.", "#111111", {
    website: "https://x.ai", blogUrl: "https://x.ai/blog", githubOrg: "xai-org", hq: "Memphis, TN", founded: 2023, details: { ceo: "Elon Musk" },
  }),
  C("deepseek", "DeepSeek", "Chinese AI lab known for open-weight, highly efficient reasoning models.", "#4d6bfe", {
    website: "https://deepseek.com", blogUrl: "https://api-docs.deepseek.com", githubOrg: "deepseek-ai", hq: "Hangzhou, CN", founded: 2023,
  }),
  C("mistral", "Mistral AI", "European AI lab — open and commercial models, Le Chat and La Plateforme.", "#f7d046", {
    website: "https://mistral.ai", blogUrl: "https://mistral.ai/news", githubOrg: "mistralai", hq: "Paris, FR", founded: 2023,
  }),
  C("huggingface", "Hugging Face", "Home of open ML — Transformers, the Model Hub, datasets, Gradio, and now robotics.", "#ffd21e", {
    website: "https://huggingface.co", blogUrl: "https://huggingface.co/blog", githubOrg: "huggingface", hq: "New York, NY", founded: 2016, featured: true,
  }),
  C("cloudflare", "Cloudflare", "Edge network & developer platform — Workers, R2, D1, AI Gateway and Zero Trust.", "#f38020", {
    website: "https://cloudflare.com", blogUrl: "https://blog.cloudflare.com", githubOrg: "cloudflare", hq: "San Francisco, CA", founded: 2009, featured: true,
  }),
  C("vercel", "Vercel", "Frontend cloud — Next.js creator, v0 AI UI builder, Edge runtime and Turbopack.", "#ffffff", {
    website: "https://vercel.com", blogUrl: "https://vercel.com/blog", githubOrg: "vercel", hq: "San Francisco, CA", founded: 2015,
    details: { ceo: "Guillermo Rauch" }, featured: true,
  }),
  C("github", "GitHub", "Home of code and Copilot — the world's largest code hosting platform, a Microsoft company.", "#ffffff", {
    website: "https://github.com", blogUrl: "https://github.blog", githubOrg: "github", hq: "San Francisco, CA", founded: 2008,
    details: { ceo: "Thomas Dohmke" }, featured: true,
  }),
  C("docker", "Docker", "Container platform company — Docker Engine, Desktop, Hub and Compose.", "#1d63ed", {
    website: "https://docker.com", blogUrl: "https://docker.com/blog", githubOrg: "docker", hq: "Palo Alto, CA", founded: 2013,
  }),
  C("supabase", "Supabase", "Open-source Firebase alternative — Postgres, Auth, Storage and Edge Functions.", "#3ecf8e", {
    website: "https://supabase.com", blogUrl: "https://supabase.com/blog", githubOrg: "supabase", hq: "San Francisco, CA", founded: 2020,
  }),
  C("stripe", "Stripe", "Economic infrastructure for the internet — payments, billing, Connect and Atlas.", "#635bff", {
    website: "https://stripe.com", blogUrl: "https://stripe.com/blog", githubOrg: "stripe", hq: "San Francisco, CA", founded: 2010,
    details: { ceo: "Patrick Collison" },
  }),
  C("twilio", "Twilio", "Customer engagement & communications APIs — SMS, voice, video and WhatsApp.", "#f22f46", {
    website: "https://twilio.com", blogUrl: "https://twilio.com/blog", githubOrg: "twilio", hq: "San Francisco, CA", founded: 2008,
  }),
  C("datadog", "Datadog", "Monitoring & observability platform for cloud applications.", "#632ca6", {
    website: "https://datadoghq.com", blogUrl: "https://datadoghq.com/blog", githubOrg: "DataDog", hq: "New York, NY", founded: 2010,
  }),
  C("grafana", "Grafana Labs", "Open observability — Grafana, Loki, Tempo, Mimir and Grafana Cloud.", "#f46800", {
    website: "https://grafana.com", blogUrl: "https://grafana.com/blog", githubOrg: "grafana", hq: "New York, NY", founded: 2014,
  }),
  C("hashicorp", "HashiCorp", "Infrastructure automation — Terraform, Vault, Consul and Nomad; now part of IBM.", "#000000", {
    website: "https://hashicorp.com", blogUrl: "https://hashicorp.com/blog", githubOrg: "hashicorp", hq: "San Francisco, CA", founded: 2012,
  }),
  C("ibm", "IBM", "Enterprise IT & the watsonx AI platform; owner of Red Hat and HashiCorp.", "#054ada", {
    website: "https://ibm.com", blogUrl: "https://research.ibm.com/blog", githubOrg: "IBM", hq: "Armonk, NY", founded: 1911,
  }),
  C("oracle", "Oracle", "Enterprise database & cloud — OCI, Autonomous Database; steward of Java.", "#f80000", {
    website: "https://oracle.com", blogUrl: "https://blogs.oracle.com", githubOrg: "oracle", hq: "Austin, TX", founded: 1977,
  }),
  C("snowflake", "Snowflake", "Data cloud for warehousing, AI and data engineering.", "#29b5e8", {
    website: "https://snowflake.com", blogUrl: "https://snowflake.com/blog", githubOrg: "snowflake-labs", hq: "Bozeman, MT", founded: 2012,
  }),
  C("databricks", "Databricks", "Lakehouse and Mosaic AI — data engineering and AI on a unified platform.", "#ff3621", {
    website: "https://databricks.com", blogUrl: "https://databricks.com/blog", githubOrg: "databricks", hq: "San Francisco, CA", founded: 2013,
  }),
  C("elastic", "Elastic", "Search analytics — Elasticsearch, Kibana and Elastic Cloud.", "#00bfb3", {
    website: "https://elastic.co", blogUrl: "https://elastic.co/blog", githubOrg: "elastic", hq: "Mountain View, CA", founded: 2012,
  }),
  C("mongodb", "MongoDB", "Document database company behind MongoDB Atlas and its developer data platform.", "#47a248", {
    website: "https://mongodb.com", blogUrl: "https://mongodb.com/blog", githubOrg: "mongodb", hq: "New York, NY", founded: 2007,
  }),
  C("aws", "Amazon Web Services", "Amazon's cloud — 200+ services from EC2 and S3 to Bedrock and SageMaker.", "#ff9900", {
    website: "https://aws.amazon.com", blogUrl: "https://aws.amazon.com/blogs/aws", githubOrg: "aws", hq: "Seattle, WA", founded: 2006, featured: true,
  }),
  C("qwik", "Qwik", "Resumability-first framework by Builder.io.", "#ac7ef4", {
    website: "https://qwik.dev", blogUrl: "https://qwik.dev/blog", githubOrg: "QwikDev", hq: "San Francisco, CA", founded: 2021,
  }),
  C("svelte", "Svelte", "UI framework that compiles away — Svelte 5 and SvelteKit.", "#ff3e00", {
    website: "https://svelte.dev", blogUrl: "https://svelte.dev/blog", githubOrg: "sveltejs", hq: "Remote", founded: 2016,
  }),
  C("deno", "Deno", "The modern JavaScript/TypeScript runtime by the Node.js creator.", "#70ffaf", {
    website: "https://deno.com", blogUrl: "https://deno.com/blog", githubOrg: "denoland", hq: "San Francisco, CA", founded: 2020,
  }),
  C("bun", "Bun", "All-in-one JavaScript runtime & toolkit — fast native TS execution.", "#fbf0df", {
    website: "https://bun.sh", blogUrl: "https://bun.sh/blog", githubOrg: "oven-sh", hq: "Remote", founded: 2022,
  }),
  C("netlify", "Netlify", "Web platform for modern sites and deploy previews.", "#00c7b7", {
    website: "https://netlify.com", blogUrl: "https://netlify.com/blog", githubOrg: "netlify", hq: "San Francisco, CA", founded: 2014,
  }),
  C("railway", "Railway", "Instant cloud platform for deploying full-stack apps.", "#0b0808", {
    website: "https://railway.com", blogUrl: "https://railway.com/blog", hq: "San Francisco, CA", founded: 2020,
  }),
  C("neon", "Neon", "Serverless Postgres with branching and autoscaling.", "#00e599", {
    website: "https://neon.tech", blogUrl: "https://neon.tech/blog", githubOrg: "neondatabase", hq: "San Francisco, CA", founded: 2021,
  }),
  C("planetscale", "PlanetScale", "Serverless MySQL platform built on Vitess.", "#000000", {
    website: "https://planetscale.com", blogUrl: "https://planetscale.com/blog", githubOrg: "planetscale", hq: "San Francisco, CA", founded: 2018,
  }),
  C("linear", "Linear", "Issue tracking & product development tool used by modern software teams.", "#5e6ad2", {
    website: "https://linear.app", blogUrl: "https://linear.app/blog", githubOrg: "linearapp", hq: "San Francisco, CA", founded: 2019,
  }),
  C("notion", "Notion", "All-in-one workspace — docs, wikis, projects, and now Notion AI.", "#ffffff", {
    website: "https://notion.so", blogUrl: "https://notion.so/blog", githubOrg: "makenotion", hq: "San Francisco, CA", founded: 2013,
  }),
  C("figma", "Figma", "Collaborative interface design tool (an Adobe acquisition that fell through).", "#f24e1e", {
    website: "https://figma.com", blogUrl: "https://figma.com/blog", githubOrg: "figma", hq: "San Francisco, CA", founded: 2012,
  }),
  C("canva", "Canva", "Visual design platform used by hundreds of millions.", "#00c4cc", {
    website: "https://canva.com", blogUrl: "https://canva.com/newsroom", hq: "Sydney, AU", founded: 2013,
  }),
  C("cursor", "Cursor", "AI-first code editor (Anysphere) known for agentic editing.", "#0f0f0f", {
    website: "https://cursor.com", blogUrl: "https://cursor.com/blog", githubOrg: "anysphere", hq: "San Francisco, CA", founded: 2022,
  }),
  C("replit", "Replit", "Browser-based IDE and agentic development platform.", "#f26207", {
    website: "https://replit.com", blogUrl: "https://replit.com/blog", hq: "San Francisco, CA", founded: 2016,
  }),
  C("sentry", "Sentry", "Error monitoring and performance tracking for developers.", "#362d59", {
    website: "https://sentry.io", blogUrl: "https://sentry.io/changelog", githubOrg: "getsentry", hq: "San Francisco, CA", founded: 2012,
  }),
  C("postman", "Postman", "API platform for building and testing APIs; Postman AI and Flows.", "#ff6c37", {
    website: "https://postman.com", blogUrl: "https://blog.postman.com", githubOrg: "postmanlabs", hq: "San Francisco, CA", founded: 2014,
  }),
  C("jetbrains", "JetBrains", "Developer tools — IntelliJ IDEA, PyCharm, WebStorm and the AI Assistant.", "#000000", {
    website: "https://jetbrains.com", blogUrl: "https://blog.jetbrains.com", githubOrg: "JetBrains", hq: "Prague, CZ", founded: 2000,
  }),
  C("loom", "Loom", "Async video messaging for work (an Atlassian company).", "#625df5", {
    website: "https://loom.com", blogUrl: "https://loom.com/blog", hq: "San Francisco, CA", founded: 2015,
  }),
  C("atlassian", "Atlassian", "Jira, Confluence, Bitbucket, Rovo AI — team software for developers.", "#0052cc", {
    website: "https://atlassian.com", blogUrl: "https://atlassian.com/blog", githubOrg: "atlassian", hq: "Sydney, AU", founded: 2002,
  }),
  C("jetpack", "Jetpack", "WordPress performance & security company (Automattic).", "#0087be", {
    website: "https://jetpack.com", blogUrl: "https://jetpack.com/blog", hq: "San Francisco, CA", founded: 2011,
  }),
  C("wordpress", "WordPress", "Open-source CMS powering a large share of the web.", "#21759b", {
    website: "https://wordpress.org", blogUrl: "https://wordpress.org/news", githubOrg: "WordPress", hq: "San Francisco, CA", founded: 2003,
  }),
  C("godaddy", "GoDaddy", "Domains, hosting and small-business SaaS.", "#1dbde6", {
    website: "https://godaddy.com", hq: "Tempe, AZ", founded: 1997,
  }),
  C("pinecone", "Pinecone", "Vector database & retrieval platform for AI applications.", "#c8f169", {
    website: "https://pinecone.io", blogUrl: "https://pinecone.io/blog", hq: "San Francisco, CA", founded: 2019,
  }),
  C("weaviate", "Weaviate", "Open-source vector database with hybrid search.", "#18c6c6", {
    website: "https://weaviate.io", blogUrl: "https://weaviate.io/blog", githubOrg: "weaviate", hq: "Amsterdam, NL", founded: 2019,
  }),
  C("qdrant", "Qdrant", "Vector similarity search engine, written in Rust.", "#d42f5d", {
    website: "https://qdrant.tech", blogUrl: "https://qdrant.tech/blog", githubOrg: "qdrant", hq: "Berlin, DE", founded: 2021,
  }),
  C("chroma", "Chroma", "AI-native open-source embedding database.", "#7c3aed", {
    website: "https://trychroma.com", blogUrl: "https://www.trychroma.com/blog", githubOrg: "chroma-core", hq: "San Francisco, CA", founded: 2022,
  }),
  C("mux", "Mux", "APIs for video — encoding, playback and live streaming.", "#e85da9", {
    website: "https://mux.com", blogUrl: "https://mux.com/blog", githubOrg: "muxinc", hq: "San Francisco, CA", founded: 2018,
  }),
  C("fly", "Fly.io", "Global app deployment on Firecracker microVMs.", "#7433ff", {
    website: "https://fly.io", blogUrl: "https://fly.io/blog", githubOrg: "superfly", hq: "Remote", founded: 2017,
  }),
  C("render", "Render", "Unified cloud to build and run apps and websites.", "#1da4bf", {
    website: "https://render.com", blogUrl: "https://render.com/blog", hq: "San Francisco, CA", founded: 2018,
  }),
  C("mapbox", "Mapbox", "Maps & location platform for developers.", "#4264fb", {
    website: "https://mapbox.com", blogUrl: "https://mapbox.com/blog", githubOrg: "mapbox", hq: "Washington, DC", founded: 2010,
  }),
  C("confluent", "Confluent", "Kafka-native streaming data platform.", "#ff0037", {
    website: "https://confluent.io", blogUrl: "https://confluent.io/blog", githubOrg: "confluentinc", hq: "Mountain View, CA", founded: 2014,
  }),
  C("pulumi", "Pulumi", "Infrastructure as code in real programming languages.", "#f26d21", {
    website: "https://pulumi.com", blogUrl: "https://pulumi.com/blog", githubOrg: "pulumi", hq: "Seattle, WA", founded: 2017,
  }),
  C("openai-codex", "Codex", "OpenAI's coding agent family — Codex CLI and cloud agents.", "#10a37f", {
    website: "https://openai.com/codex", githubOrg: "openai", hq: "San Francisco, CA", founded: 2025,
  }),
  C("alibaba", "Alibaba Cloud", "Chinese tech giant — Qwen open models, Tongyi Qianwen and Alibaba Cloud AI services.", "#ff6a00", {
    website: "https://alibabacloud.com", blogUrl: "https://alibabacloud.com/blog", githubOrg: "QwenLM", hq: "Hangzhou, CN", founded: 1999,
    details: { ceo: "Eddie Wu" },
  }),
  C("cohere", "Cohere", "Enterprise AI platform — Command & Embed models plus North retrieval.", "#39594d", {
    website: "https://cohere.com", blogUrl: "https://cohere.com/blog", githubOrg: "cohere-ai", hq: "Toronto, CA", founded: 2019,
    details: { ceo: "Aidan Gomez" },
  }),
];
