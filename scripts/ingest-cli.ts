// TechPulse AI — ingestion CLI. Usage:
//   npm run ingest            # all active sources
//   npm run ingest -- --source <slug>
//   npm run ingest -- --kind GITHUB|RSS
import { runIngestion } from "@/lib/ingest/runner";

async function main() {
  const args = process.argv.slice(2);
  const sourceFlag = args.indexOf("--source");
  const kindFlag = args.indexOf("--kind");
  const sourceId = sourceFlag >= 0 ? args[sourceFlag + 1] : undefined;
  const kind = kindFlag >= 0 ? args[kindFlag + 1] : undefined;

  console.log(`▶ Ingestion started ${sourceId ? `for source ${sourceId}` : "(all active sources)"} …`);
  const t0 = Date.now();
  const result = await runIngestion({ sourceId, kind });
  const seconds = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`✓ Done in ${seconds}s — ${result.jobs} job(s), ${result.added} added, ${result.skipped} skipped`);
  for (const e of result.errors) console.error(`✗ ${e}`);
  if (result.errors.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});