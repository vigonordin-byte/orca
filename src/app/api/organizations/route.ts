import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClaudeProvider } from "@/lib/get-claude-provider";

export async function GET() {
  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    organizations.map((org) => ({ id: org.id, name: org.name })),
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = (body?.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const org = await prisma.organization.create({
    data: { name, ownerId: "vigo" },
  });

  const claude = await getClaudeProvider();
  await prisma.agent.create({
    data: {
      orgId: org.id,
      providerId: claude.id,
      name: "Orchestrator",
      role: "Routes your requests to the right specialist agent",
      isOrchestrator: true,
    },
  });

  return NextResponse.json({ id: org.id, name: org.name }, { status: 201 });
}
