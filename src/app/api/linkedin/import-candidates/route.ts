import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { importLinkedInApplicants } from "@/lib/linkedin";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId, linkedinJobId } = await req.json() as {
    jobId: string;
    linkedinJobId: string;
  };

  // Get the LinkedIn access token from the user's account
  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "linkedin" },
  });

  if (!account?.access_token) {
    return NextResponse.json(
      { error: "LinkedIn account not connected. Please sign in with LinkedIn." },
      { status: 400 }
    );
  }

  // Get first stage for this job
  const firstStage = await prisma.pipelineStage.findFirst({
    where: { jobId },
    orderBy: { order: "asc" },
  });

  let applicants;
  try {
    applicants = await importLinkedInApplicants(account.access_token, linkedinJobId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const imported: string[] = [];
  const skipped: string[] = [];

  for (const applicant of applicants) {
    const email = applicant.email ?? `linkedin-${applicant.applicantId}@placeholder.ats`;

    try {
      const candidate = await prisma.candidate.upsert({
        where: { email },
        create: {
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          email,
          linkedinUrl: applicant.linkedinUrl,
          linkedinProfileId: applicant.profileId,
          source: "LINKEDIN_EASY_APPLY",
        },
        update: {
          linkedinUrl: applicant.linkedinUrl ?? undefined,
          linkedinProfileId: applicant.profileId ?? undefined,
        },
      });

      // Create application if it doesn't exist
      await prisma.application.upsert({
        where: { linkedinApplyId: applicant.applicantId },
        create: {
          candidateId: candidate.id,
          jobId,
          stageId: firstStage?.id,
          source: "LINKEDIN_EASY_APPLY",
          linkedinApplyId: applicant.applicantId,
          appliedAt: new Date(applicant.appliedAt),
          activities: {
            create: {
              type: "LINKEDIN_SYNCED",
              description: "Imported from LinkedIn Easy Apply",
            },
          },
        },
        update: {},
      });

      imported.push(applicant.applicantId);
    } catch {
      skipped.push(applicant.applicantId);
    }
  }

  return NextResponse.json({
    imported: imported.length,
    skipped: skipped.length,
    total: applicants.length,
  });
}
