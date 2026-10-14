import { prisma } from "@/lib/prisma";

export async function getClaudeProvider() {
  return prisma.provider.upsert({
    where: { name: "claude" },
    update: {},
    create: { name: "claude", authType: "api_key" },
  });
}
