import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const taskId = request.nextUrl.searchParams.get("taskId");
  if (!taskId) {
    return NextResponse.json({ error: "taskId is required" }, { status: 400 });
  }

  const runs = await prisma.run.findMany({
    where: { taskId },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json(runs);
}
