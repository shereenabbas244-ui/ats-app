import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApplicationStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as {
    stageId?: string;
    status?: ApplicationStatus;
    aiScore?: number;
    aiScoreBreakdown?: Record<string, number>;
    aiSummary?: string;
  };

  const prevApp = await prisma.application.findUnique({
    where: { id },
    select: { stageId: true, status: true },
  });

  const application = await prisma.application.update({
    where: { id },
    data: {
      ...(body.stageId !== undefined ? { stageId: body.stageId } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.aiScore !== undefined ? { aiScore: body.aiScore } : {}),
      ...(body.aiScoreBreakdown !== undefined ? { aiScoreBreakdown: body.aiScoreBreakdown } : {}),
      ...(body.aiSummary !== undefined ? { aiSummary: body.aiSummary } : {}),
    },
    include: { stage: true, candidate: true },
  });

  // Log activity
  const activities: Array<{
    applicationId: string;
    type: "STAGE_CHANGED" | "STATUS_CHANGED" | "AI_SCORED";
    description: string;
  }> = [];

  if (body.stageId && body.stageId !== prevApp?.stageId) {
    activities.push({
      applicationId: id,
      type: "STAGE_CHANGED",
      description: `Moved to ${application.stage?.name ?? "new stage"}`,
    });
  }
  if (body.status && body.status !== prevApp?.status) {
    activities.push({
      applicationId: id,
      type: "STATUS_CHANGED",
      description: `Status changed to ${body.status}`,
    });
  }
  if (body.aiScore !== undefined) {
    activities.push({
      applicationId: id,
      type: "AI_SCORED",
      description: `AI score: ${body.aiScore}/100`,
    });
  }

  if (activities.length > 0) {
    await prisma.activity.createMany({ data: activities });
  }

  return NextResponse.json(application);
}
