import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scoreCandidate, generateCandidateInsights } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { applicationId } = await req.json() as { applicationId: string };

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      candidate: true,
      job: true,
    },
  });

  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const resumeText = application.candidate.resumeText;
  if (!resumeText) {
    return NextResponse.json({ error: "No resume text available for scoring" }, { status: 400 });
  }

  const [scoreResult, insights] = await Promise.all([
    scoreCandidate(
      resumeText,
      application.job.title,
      application.job.description,
      application.job.requirements
    ),
    generateCandidateInsights(
      resumeText,
      application.job.title,
      application.job.description
    ),
  ]);

  const summary = `${scoreResult.summary}\n\n**Interview Questions:**\n${insights.interviewQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`;

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      aiScore: scoreResult.overall,
      aiScoreBreakdown: scoreResult.breakdown,
      aiSummary: summary,
      activities: {
        create: {
          type: "AI_SCORED",
          description: `AI score: ${scoreResult.overall}/100 (${scoreResult.recommendation.replace("_", " ")})`,
          metadata: { score: scoreResult.overall, recommendation: scoreResult.recommendation },
        },
      },
    },
  });

  return NextResponse.json({ score: scoreResult, insights });
}
