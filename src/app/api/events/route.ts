import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { relativeTime } from "@/lib/time";

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get("orgId");

  const events = await prisma.event.findMany({
    where: orgId ? { run: { task: { orgId } } } : undefined,
    include: { run: { include: { task: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json(
    events.map((event) => {
      const payload = (event.payload ?? {}) as {
        agent?: string;
        message?: string;
      };
      return {
        id: event.id,
        orgId: event.run.task.orgId,
        agent: payload.agent ?? "",
        action: payload.message ?? event.type,
        time: relativeTime(event.createdAt),
      };
    }),
  );
}
