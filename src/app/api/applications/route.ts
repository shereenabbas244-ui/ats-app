import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createApplicationSchema = z.object({
  candidateId: z.string(),
  jobId: z.string(),
  stageId: z.string().optional(),
  source: z.enum(["MANUAL", "LINKEDIN", "LINKEDIN_EASY_APPLY", "RESUME_UPLOAD", "REFERRAL", "JOB_BOARD"]).optional().default("MANUAL"),
  coverLetter: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");
  const stageId = searchParams.get("stageId");
  const status = searchParams.get("status");

  const applications = await prisma.application.findMany({
    where: {
      ...(jobId ? { jobId } : {}),
      ...(stageId ? { stageId } : {}),
      ...(status ? { status: status as "ACTIVE" | "WITHDRAWN" | "REJECTED" | "HIRED" | "ON_HOLD" } : {}),
    },
    include: {
      candidate: true,
      job: { select: { title: true, department: true } },
      stage: true,
    },
    orderBy: [{ aiScore: "desc" }, { appliedAt: "desc" }],
  });

  return NextResponse.json(applications);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as unknown;
  const data = createApplicationSchema.parse(body);

  // Get the first stage for this job if no stage specified
  let stageId = data.stageId;
  if (!stageId) {
    const firstStage = await prisma.pipelineStage.findFirst({
      where: { jobId: data.jobId },
      orderBy: { order: "asc" },
    });
    stageId = firstStage?.id;
  }

  const application = await prisma.application.create({
    data: {
      candidateId: data.candidateId,
      jobId: data.jobId,
      stageId,
      source: data.source,
      coverLetter: data.coverLetter,
      activities: {
        create: {
          type: "APPLIED",
          description: "Application created",
        },
      },
    },
    include: {
      candidate: true,
      job: { select: { title: true } },
      stage: true,
    },
  });

  return NextResponse.json(application, { status: 201 });
}
