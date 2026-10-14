import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const org = await prisma.organization.upsert({
    where: { id: "org-vigo" },
    update: {},
    create: { id: "org-vigo", name: "Vigo", ownerId: "vigo" },
  });

  const claude = await prisma.provider.upsert({
    where: { name: "claude" },
    update: {},
    create: { name: "claude", authType: "api_key" },
  });

  const agent = await prisma.agent.upsert({
    where: { id: "agent-researcher" },
    update: {},
    create: {
      id: "agent-researcher",
      orgId: org.id,
      providerId: claude.id,
      name: "Researcher",
      role: "You are a research assistant.",
    },
  });

  const orchestrator = await prisma.agent.upsert({
    where: { id: "agent-orchestrator" },
    update: {},
    create: {
      id: "agent-orchestrator",
      orgId: org.id,
      providerId: claude.id,
      name: "Orchestrator",
      role: "You route requests to the right specialist agent.",
      isOrchestrator: true,
    },
  });

  console.log({ org, provider: claude, agent, orchestrator });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
