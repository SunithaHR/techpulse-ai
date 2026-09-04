// CLI: npm run db:seed   → wipes and reseeds the database with sample data.
import { runSeed } from "../src/lib/seed";

async function main() {
  const keep = process.argv.includes("--keep");
  console.log("TechPulse AI · seeding database…");
  const counts = await runSeed({ wipe: !keep });
  console.log(`Seeding complete: ${JSON.stringify(counts)}`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Seeding failed:", e);
  process.exit(1);
});
