// Seed catalog of technologies. Illustrative sample data for local development.
// Slug is derived deterministically with slugify(name) — references in the
// seed (events, releases) always use the name and are resolved through this
// catalog, so spelling stays consistent.
import { slugify } from "@/lib/utils";

export interface TechSeed {
  slug: string;
  name: string;
  kind: string;
  domain: string; // matches DOMAIN_CATEGORIES key
  description: string;
  website?: string;
  github?: string; // owner/repo
  license?: string;
  stars?: number;
  accent?: string;
  featured?: boolean;
}

type Row = [name: string, kind: string, domain: string, description: string, website?: string, github?: string, license?: string, stars?: number, accent?: string, featured?: boolean];

const ROWS: Row[] = [
  // ── AI & Machine Learning ────────────────────────────────────────────────
  ["PyTorch", "LIBRARY", "ai-ml", "Open-source deep learning framework with dynamic computation graphs, used across research and production.", "https://pytorch.org", "pytorch/pytorch", "BSD-3", 90000, "#ee4c2c", true],
  ["TensorFlow", "LIBRARY", "ai-ml", "End-to-end open-source machine learning platform by Google.", "https://tensorflow.org", "tensorflow/tensorflow", "Apache-2.0", 190000, "#ff6f00"],
  ["JAX", "LIBRARY", "ai-ml", "Composable transformations of Python+NumPy programs — grad, jit, vmap — by Google.", "https://jax.readthedocs.io", "jax-ml/jax", "Apache-2.0", 32000, "#b3e7ff"],
  ["Transformers", "LIBRARY", "ai-ml", "Hugging Face state-of-the-art ML library for PyTorch, TensorFlow and JAX.", "https://huggingface.co/docs/transformers", "huggingface/transformers", "Apache-2.0", 145000, "#ffd21e"],
  ["LangChain", "LIBRARY", "ai-ml", "Framework for building context-aware LLM applications with composable chains and agents.", "https://langchain.com", "langchain-ai/langchain", "MIT", 105000, "#1c3c3c"],
  ["LlamaIndex", "LIBRARY", "ai-ml", "Data framework for RAG and agentic LLM applications.", "https://llamaindex.ai", "run-llama/llama_index", "MIT", 42000, "#d97c11"],
  ["Llama.cpp", "LIBRARY", "ai-ml", "Inference of Llama-family GGUF models in pure C/C++ for local and edge devices.", "https://github.com/ggml-org/llama.cpp", "ggml-org/llama.cpp", "MIT", 78000, "#5b8cff"],
  ["vLLM", "TOOL", "ai-ml", "High-throughput, memory-efficient inference and serving engine for LLMs.", "https://docs.vllm.ai", "vllm-project/vllm", "Apache-2.0", 47000, "#0065ff"],
  ["Ollama", "TOOL", "ai-ml", "Run open-source LLMs locally with a simple CLI and API.", "https://ollama.com", "ollama/ollama", "MIT", 140000, "#000000"],
  ["ONNX Runtime", "LIBRARY", "ai-ml", "Cross-platform inference engine for ONNX models.", "https://onnxruntime.ai", "microsoft/onnxruntime", "MIT", 16000, "#0059b3"],
  ["MLflow", "TOOL", "ai-ml", "Open-source platform for the machine learning lifecycle — tracking, models, registry.", "https://mlflow.org", "mlflow/mlflow", "Apache-2.0", 21000, "#0194e2"],
  ["Weights & Biases", "SERVICE", "ai-ml", "Experiment tracking and model registry for ML teams.", "https://wandb.ai", "wandb/wandb", "MIT", 9500, "#ffbe00"],
  ["Gradio", "LIBRARY", "ai-ml", "Build shareable UIs for ML models in Python, by Hugging Face.", "https://gradio.app", "gradio-app/gradio", "Apache-2.0", 38000, "#f97316"],
  ["CrewAI", "FRAMEWORK", "ai-ml", "Framework for orchestrating role-playing autonomous AI agents.", "https://crewai.com", "crewAIInc/crewAI", "MIT", 32000, "#f5c518"],
  ["AutoGen", "FRAMEWORK", "ai-ml", "Microsoft framework for building multi-agent AI applications.", "https://microsoft.github.io/autogen", "microsoft/autogen", "MIT", 45000, "#00a4ef"],
  ["AgentKit", "LIBRARY", "ai-ml", "OpenAI's framework for building agentic apps and MCP tools.", "https://openai.github.io/openai-agents-python", "openai/openai-agents-python", "MIT", 19000, "#10a37f"],
  ["Dify", "PLATFORM", "ai-ml", "Open-source LLM app development platform with visual workflows.", "https://dify.ai", "langgenius/dify", "Apache-2.0", 85000, "#1d4ed8"],
  ["n8n", "TOOL", "ai-ml", "Fair-code workflow automation with native AI agent nodes.", "https://n8n.io", "n8n-io/n8n", "Sustainable Use", 90000, "#ea4b71"],
  ["Hugging Face Hub", "PLATFORM", "ai-ml", "Model, dataset and Spaces hosting for the open ML community.", "https://huggingface.co", "huggingface/hub-docs", "Apache-2.0", 2000, "#ffd21e"],

  // ── Frontend ──────────────────────────────────────────────────────────────
  ["React", "FRAMEWORK", "frontend", "Library for building user interfaces with components; powers most of the modern web.", "https://react.dev", "facebook/react", "MIT", 240000, "#61dafb", true],
  ["Next.js", "FRAMEWORK", "frontend", "The React framework for production — App Router, RSC, Turbopack.", "https://nextjs.org", "vercel/next.js", "MIT", 140000, "#ffffff", true],
  ["Vue", "FRAMEWORK", "frontend", "Progressive framework for building UIs; approachable, performant, versatile.", "https://vuejs.org", "vuejs/core", "MIT", 480000, "#42b883"],
  ["Nuxt", "FRAMEWORK", "frontend", "Intuitive Vue framework with SSR, file-based routing and modules.", "https://nuxt.com", "nuxt/nuxt", "MIT", 58000, "#00dc82"],
  ["Svelte", "FRAMEWORK", "frontend", "Cybernetically enhanced web apps — compiles components away.", "https://svelte.dev", "sveltejs/svelte", "MIT", 83000, "#ff3e00"],
  ["Angular", "FRAMEWORK", "frontend", "Google's application framework for the web — batteries included.", "https://angular.dev", "angular/angular", "MIT", 98000, "#dd0031"],
  ["Solid", "FRAMEWORK", "frontend", "Reactive UI library with fine-grained updates compiled to the DOM.", "https://solidjs.com", "solidjs/solid", "MIT", 34000, "#2c4f7c"],
  ["Remix", "FRAMEWORK", "frontend", "Full-stack React framework with nested routing and web standards.", "https://remix.run", "remix-run/remix", "MIT", 31000, "#000000"],
  ["Astro", "FRAMEWORK", "frontend", "The web framework for content-driven websites — zero JS by default.", "https://astro.build", "withastro/astro", "MIT", 58000, "#ff5d01"],
  ["Vite", "TOOL", "frontend", "Next-generation frontend build tooling — instant dev server, fast builds.", "https://vite.dev", "vitejs/vite", "MIT", 75000, "#646cff", true],
  ["Turbopack", "TOOL", "frontend", "Incremental bundler written in Rust; the default bundler in Next.js.", "https://turbo.build/pack", "vercel/turbopack", "MIT", 28000, "#0091ff"],
  ["Webpack", "TOOL", "frontend", "The classic open-source module bundler for JavaScript.", "https://webpack.js.org", "webpack/webpack", "MIT", 65000, "#8dd6f9"],
  ["Tailwind CSS", "LIBRARY", "frontend", "Utility-first CSS framework for rapidly building custom UIs.", "https://tailwindcss.com", "tailwindlabs/tailwindcss", "MIT", 89000, "#38bdf8", true],
  ["shadcn/ui", "LIBRARY", "frontend", "Reusable React components built with Radix and Tailwind, copy-paste style.", "https://ui.shadcn.com", "shadcn-ui/ui", "MIT", 90000, "#ffffff"],
  ["Playwright", "TOOL", "frontend", "Reliable cross-browser end-to-end testing for modern web apps.", "https://playwright.dev", "microsoft/playwright", "Apache-2.0", 72000, "#2ead33"],
  ["Vitest", "TOOL", "frontend", "Blazing-fast unit test framework powered by Vite.", "https://vitest.dev", "vitest-dev/vitest", "MIT", 14000, "#fcc72b"],
  ["Storybook", "TOOL", "frontend", "Frontend workshop for building UI components in isolation.", "https://storybook.js.org", "storybookjs/storybook", "MIT", 86000, "#ff4785"],
  ["ESLint", "TOOL", "frontend", "Find and fix problems in JavaScript code; the linter of the ecosystem.", "https://eslint.org", "eslint/eslint", "MIT", 26000, "#4b32c3"],
  ["Framer Motion", "LIBRARY", "frontend", "Production-ready motion library for React.", "https://motion.dev", "motiondivision/motion", "MIT", 27000, "#0055ff"],

  // ── Backend / frameworks ──────────────────────────────────────────────────
  ["Express", "FRAMEWORK", "backend", "Minimal, unopinionated web framework for Node.js.", "https://expressjs.com", "expressjs/express", "MIT", 68000, "#000000"],
  ["Fastify", "FRAMEWORK", "backend", "Fast and low-overhead web framework for Node.js.", "https://fastify.dev", "fastify/fastify", "MIT", 34000, "#000000"],
  ["NestJS", "FRAMEWORK", "backend", "Progressive Node.js framework built with TypeScript.", "https://nestjs.com", "nestjs/nest", "MIT", 72000, "#ea2845"],
  ["Hono", "FRAMEWORK", "backend", "Small, fast, standards-based web framework that runs anywhere JS runs.", "https://hono.dev", "honojs/hono", "MIT", 26000, "#e36049"],
  ["Django", "FRAMEWORK", "backend", "High-level Python web framework that encourages rapid development.", "https://djangoproject.com", "django/django", "BSD-3", 85000, "#092e20"],
  ["Flask", "FRAMEWORK", "backend", "Lightweight WSGI web application framework for Python.", "https://flask.palletsprojects.com", "pallets/flask", "BSD-3", 70000, "#000000"],
  ["FastAPI", "FRAMEWORK", "backend", "Modern, fast web framework for Python APIs with automatic OpenAPI docs.", "https://fastapi.tiangolo.com", "fastapi/fastapi", "MIT", 86000, "#009688", true],
  ["Laravel", "FRAMEWORK", "backend", "Expressive PHP web framework with an elegant ecosystem.", "https://laravel.com", "laravel/framework", "MIT", 83000, "#ff2d20"],
  ["Ruby on Rails", "FRAMEWORK", "backend", "Full-stack web framework emphasizing convention over configuration.", "https://rubyonrails.org", "rails/rails", "MIT", 56000, "#d30001"],
  ["Spring Boot", "FRAMEWORK", "backend", "Production-grade Java framework for microservices and web apps.", "https://spring.io/projects/spring-boot", "spring-projects/spring-boot", "Apache-2.0", 77000, "#6db33f"],
  ["ASP.NET Core", "FRAMEWORK", "backend", "Microsoft's cross-platform framework for modern web apps and APIs.", "https://dotnet.microsoft.com", "dotnet/aspnetcore", "MIT", 36000, "#512bd4"],
  ["GraphQL", "PROTOCOL", "backend", "Query language for APIs with a type system, now under the GraphQL Foundation.", "https://graphql.org", "graphql/graphql-spec", "MIT", 14300, "#e10098"],
  ["gRPC", "PROTOCOL", "backend", "High-performance RPC framework by Google, powered by HTTP/2 and protobufs.", "https://grpc.io", "grpc/grpc", "Apache-2.0", 43000, "#244c5a"],
  ["Prisma", "LIBRARY", "backend", "Next-generation Node.js & TypeScript ORM.", "https://prisma.io", "prisma/prisma", "Apache-2.0", 43000, "#2d3748"],
  ["Drizzle ORM", "LIBRARY", "backend", "Headless TypeScript ORM with a SQL-like API, tree-shakeable.", "https://orm.drizzle.team", "drizzle-team/drizzle-orm", "Apache-2.0", 29000, "#c5f74f"],
  ["Zod", "LIBRARY", "backend", "TypeScript-first schema validation with static type inference.", "https://zod.dev", "colinhacks/zod", "MIT", 37000, "#3068b7"],
  ["tRPC", "LIBRARY", "backend", "End-to-end typesafe APIs built on TypeScript inference.", "https://trpc.io", "trpc/trpc", "MIT", 36000, "#398ccb"],

  // ── Languages & runtimes ──────────────────────────────────────────────────
  ["JavaScript", "LANGUAGE", "lang", "The language of the web platform and the largest developer ecosystem.", "https://tc39.es", "tc39/ecma262", "MIT", 15000, "#f7df1e"],
  ["TypeScript", "LANGUAGE", "lang", "JavaScript with syntax for types, compiled by the tsc compiler.", "https://typescriptlang.org", "microsoft/TypeScript", "Apache-2.0", 106000, "#3178c6", true],
  ["Python", "LANGUAGE", "lang", "High-level general-purpose language — the default for AI and data work.", "https://python.org", "python/cpython", "PSF", 68000, "#3776ab", true],
  ["Go", "LANGUAGE", "lang", "Statically typed, compiled language designed at Google for cloud software.", "https://go.dev", "golang/go", "BSD-3", 128000, "#00add8"],
  ["Rust", "LANGUAGE", "lang", "Systems language focused on safety and performance, without a garbage collector.", "https://rust-lang.org", "rust-lang/rust", "MIT/Apache-2.0", 102000, "#dea584"],
  ["Java", "LANGUAGE", "lang", "Object-oriented language and runtime; LTS releases every two years.", "https://openjdk.org", "openjdk/jdk", "GPL-2.0", 21000, "#e76f00"],
  ["Kotlin", "LANGUAGE", "lang", "Modern, concise JVM language — first-class for Android.", "https://kotlinlang.org", "JetBrains/kotlin", "Apache-2.0", 50000, "#7f52ff"],
  ["Swift", "LANGUAGE", "lang", "Apple's modern language for iOS, macOS, server and more.", "https://swift.org", "swiftlang/swift", "Apache-2.0", 69000, "#f05138"],
  ["PHP", "LANGUAGE", "lang", "Server-side scripting language powering much of the web.", "https://php.net", "php/php-src", "PHP-3.01", 39000, "#777bb4"],
  ["Ruby", "LANGUAGE", "lang", "A dynamic, open-source language focused on simplicity and productivity.", "https://ruby-lang.org", "ruby/ruby", "BSD-2", 22000, "#cc342d"],
  ["Node.js", "RUNTIME", "lang", "JavaScript runtime built on V8 — the backbone of the JS server ecosystem.", "https://nodejs.org", "nodejs/node", "MIT", 112000, "#5fa04e", true],
  ["Deno", "RUNTIME", "lang", "Modern JavaScript & TypeScript runtime with native TS and permissions.", "https://deno.com", "denoland/deno", "MIT", 102000, "#70ffaf"],
  ["Bun", "RUNTIME", "lang", "All-in-one JavaScript runtime, bundler and package manager.", "https://bun.sh", "oven-sh/bun", "MIT", 80000, "#fbf0df"],
  [".NET", "PLATFORM", "lang", "Microsoft's managed development platform — C#, F#, ASP.NET Core.", "https://dotnet.microsoft.com", "dotnet/runtime", "MIT", 17000, "#512bd4"],
  ["C / C++", "LANGUAGE", "lang", "The systems languages of kernels, browsers, game engines and databases.", "https://isocpp.org", "llvm/llvm-project", "Apache-2.0", 32000, "#00599c"],

  // ── Data & databases ──────────────────────────────────────────────────────
  ["PostgreSQL", "DATABASE", "data", "The world's most advanced open-source relational database.", "https://postgresql.org", "postgres/postgres", "PostgreSQL", 19000, "#336791", true],
  ["MySQL", "DATABASE", "data", "The world's most popular open-source relational database.", "https://mysql.com", "mysql/mysql-server", "GPL-2.0", 11000, "#00758f"],
  ["SQLite", "DATABASE", "data", "Embedded SQL database engine — a library, not a server.", "https://sqlite.org", "sqlite/sqlite", "Public Domain", 9000, "#003b57"],
  ["MongoDB", "DATABASE", "data", "Document-oriented NoSQL database with a developer-first platform.", "https://mongodb.com", "mongodb/mongo", "SSPL", 27000, "#47a248"],
  ["Redis", "DATABASE", "data", "In-memory data store used as cache, message broker and database.", "https://redis.io", "redis/redis", "RSALv2/SSPL", 70000, "#dc382d", true],
  ["Elasticsearch", "DATABASE", "data", "Distributed search and analytics engine built on Apache Lucene.", "https://elastic.co", "elastic/elasticsearch", "Elastic License", 73000, "#00bfb3"],
  ["OpenSearch", "DATABASE", "data", "Community-driven, Apache-2.0 search suite forked from Elasticsearch.", "https://opensearch.org", "opensearch-project/OpenSearch", "Apache-2.0", 11000, "#005eb8"],
  ["ClickHouse", "DATABASE", "data", "Fast open-source OLAP database for real-time analytics.", "https://clickhouse.com", "ClickHouse/ClickHouse", "Apache-2.0", 41000, "#ffcc01"],
  ["DuckDB", "DATABASE", "data", "In-process analytical database — 'SQLite for analytics'.", "https://duckdb.org", "duckdb/duckdb", "MIT", 34000, "#fff100"],
  ["Apache Kafka", "PLATFORM", "data", "Distributed event streaming platform for high-scale data pipelines.", "https://kafka.apache.org", "apache/kafka", "Apache-2.0", 31000, "#231f20"],
  ["Apache Spark", "PLATFORM", "data", "Unified engine for large-scale data analytics and ML.", "https://spark.apache.org", "apache/spark", "Apache-2.0", 41000, "#e25a1c"],
  ["Apache Airflow", "TOOL", "data", "Platform to programmatically author, schedule and monitor workflows.", "https://airflow.apache.org", "apache/airflow", "Apache-2.0", 39000, "#017cee"],
  ["Neo4j", "DATABASE", "data", "Leading graph database — Cypher query language.", "https://neo4j.com", "neo4j/neo4j", "GPL-3.0", 14000, "#4581c3"],
  ["TimescaleDB", "DATABASE", "data", "Time-series database built as a PostgreSQL extension.", "https://timescale.com", "timescale/timescaledb", "TSL/Apache-2.0", 19000, "#fdb515"],
  ["Supabase", "PLATFORM", "data", "Open-source Firebase alternative — hosted Postgres with auth, storage and edge functions.", "https://supabase.com", "supabase/supabase", "Apache-2.0", 83000, "#3ecf8e", true],
  ["Pinecone", "SERVICE", "data", "Managed vector database for retrieval and RAG.", "https://pinecone.io", undefined, undefined, undefined, "#c8f169"],
  ["Qdrant", "DATABASE", "data", "Vector similarity search engine written in Rust.", "https://qdrant.tech", "qdrant/qdrant", "Apache-2.0", 25000, "#d42f5d"],
  ["Weaviate", "DATABASE", "data", "Open-source vector database with hybrid search and generative features.", "https://weaviate.io", "weaviate/weaviate", "BSD-3", 13000, "#18c6c6"],
  ["Milvus", "DATABASE", "data", "High-scale vector database for AI applications (LF AI & Data).", "https://milvus.io", "milvus-io/milvus", "Apache-2.0", 34000, "#00a1e9"],

  // ── Cloud ─────────────────────────────────────────────────────────────────
  ["AWS", "CLOUD", "cloud", "Amazon Web Services — the largest public cloud with 200+ services.", "https://aws.amazon.com", undefined, undefined, undefined, "#ff9900", true],
  ["Microsoft Azure", "CLOUD", "cloud", "Microsoft's cloud platform — compute, data, AI and developer services.", "https://azure.microsoft.com", undefined, undefined, undefined, "#0078d4", true],
  ["Google Cloud", "CLOUD", "cloud", "Google's cloud platform — GKE, BigQuery, Vertex AI and more.", "https://cloud.google.com", undefined, undefined, undefined, "#4285f4", true],
  ["Cloudflare", "PLATFORM", "cloud", "Edge network and developer platform: Workers, R2, D1, AI Gateway.", "https://cloudflare.com", "cloudflare/workers-sdk", "Apache-2.0", 29000, "#f38020", true],
  ["Vercel", "PLATFORM", "cloud", "Frontend deployment platform — hosts the majority of Next.js sites.", "https://vercel.com", undefined, undefined, undefined, "#ffffff", true],
  ["Netlify", "PLATFORM", "cloud", "Web platform for static sites and deploy previews.", "https://netlify.com", undefined, undefined, undefined, "#00c7b7"],
  ["AWS Lambda", "SERVICE", "cloud", "AWS serverless compute — functions as a service.", "https://aws.amazon.com/lambda", undefined, undefined, undefined, "#ff9900"],
  ["Terraform", "TOOL", "cloud", "Infrastructure as code tool by HashiCorp (now IBM).", "https://terraform.io", "hashicorp/terraform", "BUSL", 45000, "#7b42bc", true],
  ["Pulumi", "TOOL", "cloud", "IaC in real languages — Python, TypeScript, Go and more.", "https://pulumi.com", "pulumi/pulumi", "Apache-2.0", 23000, "#f26d21"],
  ["OpenTofu", "TOOL", "cloud", "Open-source Terraform fork under Linux Foundation stewardship.", "https://opentofu.org", "opentofu/opentofu", "MPL-2.0", 24000, "#ffda18"],
  ["Firebase", "PLATFORM", "cloud", "Google's app development platform — auth, database, hosting, ML.", "https://firebase.google.com", "firebase/firebase-js-sdk", "Apache-2.0", 49000, "#ffca28"],
  ["Stripe", "SERVICE", "cloud", "Payments and financial infrastructure APIs.", "https://stripe.com", "stripe/stripe-node", "MIT", 41000, "#635bff"],
  ["Twilio", "SERVICE", "cloud", "Communications APIs — SMS, voice, video and WhatsApp.", "https://twilio.com", "twilio/twilio-node", "MIT", 4700, "#f22f46"],

  // ── DevOps & infra ────────────────────────────────────────────────────────
  ["Docker", "TOOL", "devops", "The industry-standard container runtime and platform.", "https://docker.com", "moby/moby", "Apache-2.0", 70000, "#1d63ed", true],
  ["Kubernetes", "PLATFORM", "devops", "Open-source container orchestration — the cloud operating system.", "https://kubernetes.io", "kubernetes/kubernetes", "Apache-2.0", 115000, "#326ce5", true],
  ["Helm", "TOOL", "devops", "The package manager for Kubernetes.", "https://helm.sh", "helm/helm", "Apache-2.0", 28000, "#0f1689"],
  ["Argo CD", "TOOL", "devops", "Declarative GitOps continuous delivery for Kubernetes.", "https://argoproj.github.io", "argoproj/argo-cd", "Apache-2.0", 19000, "#ef7b4d"],
  ["GitHub Actions", "SERVICE", "devops", "GitHub's CI/CD automation built into repositories.", "https://github.com/features/actions", "actions/runner", "MIT", 5200, "#2088ff"],
  ["Jenkins", "TOOL", "devops", "The original open-source automation server.", "https://jenkins.io", "jenkinsci/jenkins", "MIT", 23000, "#d24939"],
  ["Ansible", "TOOL", "devops", "Simple IT automation — configuration management and provisioning.", "https://ansible.com", "ansible/ansible", "GPL-3.0", 64000, "#ee0000"],
  ["Prometheus", "TOOL", "devops", "Open-source monitoring and alerting toolkit, CNCF graduated.", "https://prometheus.io", "prometheus/prometheus", "Apache-2.0", 58000, "#e6522c"],
  ["Grafana", "TOOL", "devops", "Observability dashboards for metrics, logs and traces.", "https://grafana.com", "grafana/grafana", "AGPL-3.0", 68000, "#f46800"],
  ["OpenTelemetry", "LIBRARY", "devops", "Vendor-neutral observability framework — traces, metrics, logs.", "https://opentelemetry.io", "open-telemetry/opentelemetry-specification", "Apache-2.0", 4000, "#425cc7"],
  ["Nginx", "SERVICE", "devops", "High-performance web server and reverse proxy.", "https://nginx.org", "nginx/nginx", "BSD-2", 25000, "#009639"],
  ["Envoy", "PLATFORM", "devops", "Cloud-native edge and service proxy, CNCF graduated.", "https://envoyproxy.io", "envoyproxy/envoy", "Apache-2.0", 26000, "#ac6199"],
  ["Istio", "PLATFORM", "devops", "Service mesh for Kubernetes — traffic, security, observability.", "https://istio.io", "istio/istio", "Apache-2.0", 37000, "#466bb0"],
  ["Traefik", "TOOL", "devops", "Cloud-native application proxy and ingress controller.", "https://traefik.io", "traefik/traefik", "MIT", 54000, "#24a1c1"],
  ["Cloud Native Computing Foundation", "PLATFORM", "devops", "The foundation that hosts Kubernetes, Prometheus, Envoy and 180+ projects.", "https://cncf.io", undefined, undefined, undefined, "#0a5f9e"],

  // ── Mobile ────────────────────────────────────────────────────────────────
  ["Flutter", "FRAMEWORK", "mobile", "Google's UI toolkit for building natively compiled apps from one codebase.", "https://flutter.dev", "flutter/flutter", "BSD-3", 170000, "#02569b"],
  ["React Native", "FRAMEWORK", "mobile", "Build native mobile apps with React.", "https://reactnative.dev", "facebook/react-native", "MIT", 122000, "#61dafb"],
  ["Expo", "PLATFORM", "mobile", "Framework and platform for universal React applications.", "https://expo.dev", "expo/expo", "MIT", 40000, "#000020"],
  ["SwiftUI", "FRAMEWORK", "mobile", "Apple's declarative UI framework across its platforms.", "https://developer.apple.com/xcode/swiftui", undefined, undefined, undefined, "#f05138"],
  ["Jetpack Compose", "FRAMEWORK", "mobile", "Android's modern toolkit for building native UI.", "https://developer.android.com/jetpack/compose", "androidx/androidx", "Apache-2.0", 6000, "#3ddc84"],
  ["Android", "OS", "mobile", "Google's mobile operating system — billions of devices.", "https://android.com", "aosp-mirror/platform_frameworks_base", "Apache-2.0", 22000, "#3ddc84"],
  ["iOS", "OS", "mobile", "Apple's mobile operating system.", "https://apple.com/ios", undefined, undefined, undefined, "#0c1f3f"],
  ["Ionic", "FRAMEWORK", "mobile", "Cross-platform mobile UI toolkit built on web technologies.", "https://ionicframework.com", "ionic-team/ionic-framework", "MIT", 51000, "#3880ff"],

  // ── Security ──────────────────────────────────────────────────────────────
  ["Semgrep", "TOOL", "security", "Lightweight static analysis for finding bugs and enforcing standards.", "https://semgrep.dev", "semgrep/semgrep", "LGPL-2.1", 12000, "#93cee9"],
  ["Trivy", "TOOL", "security", "Comprehensive, fast vulnerability scanner for containers and repos.", "https://trivy.dev", "aquasecurity/trivy", "Apache-2.0", 26000, "#1904da"],
  ["Snyk", "SERVICE", "security", "Developer security platform — find and fix vulnerabilities in dependencies.", "https://snyk.io", "snyk/cli", "Apache-2.0", 5400, "#8a2be2"],
  ["OWASP ZAP", "TOOL", "security", "Free, open-source web app security scanner maintained by the ZAP community.", "https://zaproxy.org", "zaproxy/zaproxy", "Apache-2.0", 14000, "#326ce5"],
  ["Keycloak", "PLATFORM", "security", "Open-source identity and access management (now part of Red Hat).", "https://keycloak.org", "keycloak/keycloak", "Apache-2.0", 27000, "#33a0ff"],
  ["1Password", "SERVICE", "security", "Password manager and secrets management for teams.", "https://1password.com", undefined, undefined, undefined, "#0094f5"],
  ["HashiCorp Vault", "TOOL", "security", "Manage secrets and protect sensitive data.", "https://vaultproject.io", "hashicorp/vault", "BUSL", 31000, "#ffd814"],
  ["Certbot", "TOOL", "security", "Automatically obtain and renew Let's Encrypt TLS certificates.", "https://certbot.eff.org", "certbot/certbot", "Apache-2.0", 32000, "#fbb034"],
  ["OpenSSL", "LIBRARY", "security", "The industry-standard toolkit for TLS and cryptography.", "https://openssl.org", "openssl/openssl", "Apache-2.0", 28000, "#721412"],
  ["curl", "TOOL", "devops", "Command-line tool and library for transferring data with URLs.", "https://curl.se", "curl/curl", "curl License", 38000, "#073551"],
  ["WordPress", "PLATFORM", "platforms", "Open-source CMS powering a large share of the web.", "https://wordpress.org", "WordPress/wordpress-develop", "GPL-2.0", 2800, "#21759b"],

  // ── Operating systems ─────────────────────────────────────────────────────
  ["Linux", "OS", "os", "The open-source kernel and operating system family powering most of the cloud.", "https://kernel.org", "torvalds/linux", "GPL-2.0", 200000, "#fcc624"],
  ["Ubuntu", "OS", "os", "Canonical's popular Linux distribution with LTS releases.", "https://ubuntu.com", "canonical/ubuntu-server", "GPL-2.0", 500, "#e95420"],
  ["Debian", "OS", "os", "The universal operating system — the base of Ubuntu and many others.", "https://debian.org", "Debian/debootstrap", "GPL-2.0", 100, "#a80030"],
  ["Fedora", "OS", "os", "Community-driven Linux distribution sponsored by Red Hat.", "https://fedoraproject.org", "fedora-infra", "GPL-2.0", 50, "#51a2da"],
  ["Windows", "OS", "os", "Microsoft's desktop and server operating system.", "https://microsoft.com/windows", undefined, undefined, undefined, "#0078d6"],
  ["macOS", "OS", "os", "Apple's desktop operating system with annual releases.", "https://apple.com/macos", undefined, undefined, undefined, "#999999"],
  ["ChromeOS", "OS", "os", "Google's cloud-first operating system for laptops.", "https://chromeos.google", undefined, undefined, undefined, "#4285f4"],

  // ── Platforms & services ──────────────────────────────────────────────────
  ["GitHub", "PLATFORM", "platforms", "The home of software development — code hosting and Copilot.", "https://github.com", undefined, undefined, undefined, "#ffffff", true],
  ["GitLab", "PLATFORM", "platforms", "DevSecOps platform — source management, CI/CD, and more.", "https://gitlab.com", "gitlabhq/gitlabhq", "MIT", 24000, "#fc6d26"],
  ["GitHub Copilot", "SERVICE", "platforms", "The AI pair programmer — now with agent mode and Code Review.", "https://github.com/features/copilot", undefined, undefined, undefined, "#2088ff", true],
  ["Linear", "SERVICE", "platforms", "Issue tracking and product development tool.", "https://linear.app", undefined, undefined, undefined, "#5e6ad2"],
  ["Notion", "SERVICE", "platforms", "All-in-one workspace — docs, wikis, projects and AI.", "https://notion.so", undefined, undefined, undefined, "#ffffff"],
  ["Figma", "SERVICE", "platforms", "Collaborative interface design and prototyping.", "https://figma.com", undefined, undefined, undefined, "#f24e1e"],
  ["OpenAI API", "SERVICE", "platforms", "APIs for OpenAI models — chat completions, assistants, embeddings.", "https://platform.openai.com", undefined, undefined, undefined, "#10a37f"],
  ["Anthropic API", "SERVICE", "platforms", "APIs for Claude models — Messages, Agent SDK, MCP support.", "https://docs.anthropic.com", undefined, undefined, undefined, "#d97757"],
  ["Model Context Protocol", "PROTOCOL", "platforms", "Open standard connecting AI assistants to tools and data.", "https://modelcontextprotocol.io", "modelcontextprotocol", "MIT", 12000, "#000000"],
  ["Llama (model family)", "MODEL_FAMILY", "ai-ml", "Meta's family of open-weight foundation models.", "https://llama.com", "meta-llama/llama-models", "Llama License", 32000, "#0866ff"],
  ["Claude (model family)", "MODEL_FAMILY", "ai-ml", "Anthropic's Claude model family.", "https://anthropic.com/claude", undefined, undefined, undefined, "#d97757"],
  ["GPT (model family)", "MODEL_FAMILY", "ai-ml", "OpenAI's GPT model family.", "https://openai.com", undefined, undefined, undefined, "#10a37f"],
  ["Gemini (model family)", "MODEL_FAMILY", "ai-ml", "Google's Gemini model family.", "https://deepmind.google/technologies/gemini", undefined, undefined, undefined, "#4285f4"],

  // ── Hardware & chips ──────────────────────────────────────────────────────
  ["NVIDIA CUDA", "LIBRARY", "hardware", "Parallel computing platform and API for NVIDIA GPUs.", "https://developer.nvidia.com/cuda", "NVIDIA/cuda-samples", "BSD-3", 7000, "#76b900"],
  ["ROCm", "LIBRARY", "hardware", "AMD's open software platform for GPU compute.", "https://rocm.docs.amd.com", "ROCm/ROCm", "MIT", 5000, "#ed1c24"],
  ["Raspberry Pi", "HARDWARE", "hardware", "Low-cost single-board computers beloved by makers.", "https://raspberrypi.com", "raspberrypi/linux", "GPL-2.0", 12000, "#c7053d"],
  ["Arduino", "HARDWARE", "hardware", "Open-source electronics platform for prototyping.", "https://arduino.cc", "arduino/Arduino", "LGPL-2.1", 15000, "#00979d"],
  ["RISC-V", "HARDWARE", "hardware", "Open instruction set architecture shaking up chip design.", "https://riscv.org", "riscv-software-src", "CC-BY", 3000, "#a02440"],
  ["Apple Silicon", "HARDWARE", "hardware", "Apple's ARM-based chips for Macs and iPads.", "https://apple.com", undefined, undefined, undefined, "#a2aaad"],
];

function build(rows: Row[]): TechSeed[] {
  return rows.map(([name, kind, domain, description, website, github, license, stars, accent, featured]) => ({
    slug: slugify(name),
    name,
    kind,
    domain,
    description,
    website,
    github,
    license,
    stars,
    accent: accent ?? "#22d3ee",
    featured: featured ?? false,
  }));
}

export const TECH_SEEDS: TechSeed[] = build(ROWS);

const byName = new Map<string, TechSeed>();
const bySlug = new Map<string, TechSeed>();
for (const t of TECH_SEEDS) {
  byName.set(t.name.toLowerCase(), t);
  bySlug.set(t.slug, t);
}

export function techByName(name: string): TechSeed | undefined {
  return byName.get(name.toLowerCase());
}

export function techBySlug(slug: string): TechSeed | undefined {
  return bySlug.get(slug);
}

export function techSlugOf(name: string): string {
  return techByName(name)?.slug ?? slugify(name);
}

export function allTechNames(): string[] {
  return TECH_SEEDS.map((t) => t.name);
}
