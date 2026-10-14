import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClaudeProvider } from "@/lib/get-claude-provider";
import { relativeTime } from "@/lib/time";

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get("orgId");

  const agents = await prisma.agent.findMany({
    where: orgId ? { orgId } : undefined,
    include: { provider: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    agents.map((agent) => ({
      id: agent.id,
      orgId: agent.orgId,
      name: agent.name,
      role: agent.role ?? "",
      status: agent.status === "error" ? "idle" : agent.status,
      lastActive: relativeTime(agent.updatedAt),
      provider:
        agent.provider.name.charAt(0).toUpperCase() +
        agent.provider.name.slice(1),
      isOrchestrator: agent.isOrchestrator,
    })),
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const orgId = body?.orgId;
  const name = (body?.name ?? "").trim();
  const role = (body?.role ?? "").trim();

  if (!orgId || !name || !role) {
    return NextResponse.json(
      { error: "orgId, name, and role are required" },
      { status: 400 },
    );
  }

  const claude = await getClaudeProvider();
  const agent = await prisma.agent.create({
    data: { orgId, providerId: claude.id, name, role },
  });

  return NextResponse.json(
    {
      id: agent.id,
      orgId: agent.orgId,
      name: agent.name,
      role: agent.role ?? "",
      status: agent.status,
      lastActive: relativeTime(agent.updatedAt),
      provider: "Claude",
      isOrchestrator: agent.isOrchestrator,
    },
    { status: 201 },
  );
}
