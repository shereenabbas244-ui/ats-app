import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rankCandidates } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId } = await req.json() as { jobId: string };

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const applications = await prisma.application.findMany({
    where: { jobId, status: "ACTIVE" },
    include: { candidate: { select: { id: true, firstName: true, lastName: true, resumeText: true } } },
  });

  const withResumes = applications.filter((a) => a.candidate.resumeText);
  if (withResumes.length === 0) {
    return NextResponse.json({ error: "No candidates with resumes to rank" }, { status: 400 });
  }

  const rankings = await rankCandidates(
    withResumes.map((a) => ({
      id: a.id,
      resumeText: a.candidate.resumeText!,
      name: `${a.candidate.firstName} ${a.candidate.lastName}`,
    })),
    job.title,
    job.description,
    job.requirements
  );

  // Save scores back
  await Promise.all(
    rankings.map((r) =>
      prisma.application.update({
        where: { id: r.id },
        data: { aiScore: r.score },
      })
    )
  );

  return NextResponse.json({ rankings, jobId });
}
