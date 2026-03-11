import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { postJobToLinkedIn } from "@/lib/linkedin";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId, companyId } = await req.json() as { jobId: string; companyId: string };

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "linkedin" },
  });

  if (!account?.access_token) {
    return NextResponse.json(
      { error: "LinkedIn account not connected." },
      { status: 400 }
    );
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  try {
    const result = await postJobToLinkedIn(account.access_token, {
      title: job.title,
      description: `${job.description}\n\nRequirements:\n${job.requirements}`,
      location: job.location ?? "Remote",
      companyId,
      jobType: job.type,
      externalJobPostingId: job.id,
    });

    await prisma.job.update({
      where: { id: jobId },
      data: {
        linkedinJobId: result.linkedinJobId,
        linkedinPostUrl: result.postUrl,
        linkedinPostedAt: new Date(),
        status: "OPEN",
        postedAt: new Date(),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
