import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runOnClaude } from "@/lib/providers/claude";
import { relativeTime } from "@/lib/time";
import type { RunStatus } from "@/generated/prisma/client";

const runStatusToTaskStatus: Record<RunStatus, "In progress" | "Done" | "Error"> = {
  working: "In progress",
  done: "Done",
  error: "Error",
};

function shorten(instruction: string) {
  return instruction.length > 60
    ? `${instruction.slice(0, 60)}…`
    : instruction;
}

async function processRun(
  runId: string,
  agentId: string,
  agentName: string,
  instruction: string,
  rolePrompt: string | null,
) {
  const shortInstruction = shorten(instruction);

  try {
    const result = await runOnClaude(instruction, rolePrompt ?? undefined);

    await prisma.run.update({
      where: { id: runId },
      data: { status: "done", result, finishedAt: new Date() },
    });

    await prisma.agent.update({
      where: { id: agentId },
      data: { status: "idle" },
    });

    await prisma.event.create({
      data: {
        runId,
        type: "completed",
        payload: {
          agent: agentName,
          message: `finished "${shortInstruction}"`,
        },
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    await prisma.run.update({
      where: { id: runId },
      data: { status: "error", error: message, finishedAt: new Date() },
    });

    await prisma.agent.update({
      where: { id: agentId },
      data: { status: "idle" },
    });

    await prisma.event.create({
      data: {
        runId,
        type: "error",
        payload: {
          agent: agentName,
          message: `hit an error on "${shortInstruction}"`,
        },
      },
    });
  }
}

export async function GET(request: NextRequest) {
  const agentId = request.nextUrl.searchParams.get("agentId");
  const orgId = request.nextUrl.searchParams.get("orgId");

  const where = agentId ? { agentId } : orgId ? { orgId } : undefined;

  const tasks = await prisma.task.findMany({
    where,
    include: { runs: { orderBy: { startedAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    tasks.map((task) => {
      const latestRun = task.runs[0];
      return {
        id: task.id,
        orgId: task.orgId,
        agentId: task.agentId,
        instruction: task.instruction,
        status: latestRun ? runStatusToTaskStatus[latestRun.status] : "In progress",
        completed:
          latestRun?.finishedAt ? relativeTime(latestRun.finishedAt) : "–",
      };
    }),
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const agentId = body?.agentId;
  const instruction = (body?.instruction ?? "").trim();

  if (!agentId || !instruction) {
    return NextResponse.json(
      { error: "agentId and instruction are required" },
      { status: 400 },
    );
  }

  const requestedAgent = await prisma.agent.findUnique({
    where: { id: agentId },
  });

  if (!requestedAgent) {
    return NextResponse.json({ error: "agent not found" }, { status: 404 });
  }

  const orgId = requestedAgent.orgId;
  const shortInstruction = shorten(instruction);

  let executor = requestedAgent;
  let routedFromOrchestrator = false;

  if (requestedAgent.isOrchestrator) {
    const specialists = await prisma.agent.findMany({
      where: { orgId, isOrchestrator: false },
    });
    if (specialists.length > 0) {
      executor = specialists[Math.floor(Math.random() * specialists.length)];
      routedFromOrchestrator = true;
    }
  }

  const task = await prisma.task.create({
    data: { orgId, agentId: executor.id, instruction },
  });

  const run = await prisma.run.create({
    data: { taskId: task.id, status: "working" },
  });

  if (routedFromOrchestrator) {
    await prisma.event.create({
      data: {
        runId: run.id,
        type: "routed",
        payload: {
          agent: requestedAgent.name,
          message: `routed "${shortInstruction}" to ${executor.name}`,
        },
      },
    });
  }

  await prisma.event.create({
    data: {
      runId: run.id,
      type: "started",
      payload: {
        agent: executor.name,
        message: `started "${shortInstruction}"`,
      },
    },
  });

  await prisma.agent.update({
    where: { id: executor.id },
    data: { status: "working" },
  });

  void processRun(run.id, executor.id, executor.name, instruction, executor.role);

  return NextResponse.json(
    {
      id: task.id,
      orgId: task.orgId,
      agentId: task.agentId,
      instruction: task.instruction,
      status: "In progress",
      completed: "–",
    },
    { status: 201 },
  );
}
