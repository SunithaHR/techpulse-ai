// CLI: npm run db:reset → wipes all data and reseeds.
import { prisma } from "../src/lib/db";

async function main() {
  console.log("Wiping database…");
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.savedItem.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.newsCompany.deleteMany();
  await prisma.newsTechnology.deleteMany();
  await prisma.news.deleteMany();
  await prisma.release.deleteMany();
  await prisma.securityAdvisory.deleteMany();
  await prisma.aITool.deleteMany();
  await prisma.aIModel.deleteMany();
  await prisma.repository.deleteMany();
  await prisma.technology.deleteMany();
  await prisma.company.deleteMany();
  await prisma.sourceItem.deleteMany();
  await prisma.ingestionJob.deleteMany();
  await prisma.source.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log("Database wiped.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
