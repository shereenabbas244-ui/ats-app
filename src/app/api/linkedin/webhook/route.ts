import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseLinkedInWebhook } from "@/lib/linkedin";

// LinkedIn sends Easy Apply notifications to this endpoint
// Configure this URL in your LinkedIn app dashboard
export async function POST(req: NextRequest) {
  const body = await req.json() as unknown;
  const payload = parseLinkedInWebhook(body);

  if (payload.type !== "EASY_APPLY" && payload.type !== "JOB_APPLICATION_UPDATE") {
    return NextResponse.json({ received: true });
  }

  // Find the internal job by LinkedIn job ID
  const job = await prisma.job.findUnique({
    where: { linkedinJobId: payload.jobId },
    include: { stages: { orderBy: { order: "asc" }, take: 1 } },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const email =
    payload.applicant.email ??
    `linkedin-${payload.applicationId}@placeholder.ats`;

  const candidate = await prisma.candidate.upsert({
    where: { email },
    create: {
      firstName: payload.applicant.firstName,
      lastName: payload.applicant.lastName,
      email,
      linkedinProfileId: payload.applicant.profileId,
      source: "LINKEDIN_EASY_APPLY",
    },
    update: {},
  });

  await prisma.application.upsert({
    where: { linkedinApplyId: payload.applicationId },
    create: {
      candidateId: candidate.id,
      jobId: job.id,
      stageId: job.stages[0]?.id,
      source: "LINKEDIN_EASY_APPLY",
      linkedinApplyId: payload.applicationId,
      appliedAt: new Date(payload.appliedAt),
      activities: {
        create: {
          type: "LINKEDIN_SYNCED",
          description: "Received via LinkedIn Easy Apply webhook",
        },
      },
    },
    update: {},
  });

  return NextResponse.json({ received: true });
}
