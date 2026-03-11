import { prisma } from "@/lib/db";
import { PipelineBoard } from "./pipeline-board";

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { jobId } = await searchParams;

  const jobs = await prisma.job.findMany({
    where: { status: { in: ["OPEN", "PAUSED"] } },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });

  const selectedJobId = jobId ?? jobs[0]?.id;

  let stages: Array<{
    id: string;
    name: string;
    color: string;
    order: number;
    applications: Array<{
      id: string;
      aiScore: number | null;
      appliedAt: Date;
      source: string;
      candidate: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        currentTitle: string | null;
        currentCompany: string | null;
        skills: string[];
        linkedinUrl: string | null;
      };
    }>;
  }> = [];

  if (selectedJobId) {
    const rawStages = await prisma.pipelineStage.findMany({
      where: { jobId: selectedJobId },
      orderBy: { order: "asc" },
      include: {
        applications: {
          where: { status: "ACTIVE" },
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                currentTitle: true,
                currentCompany: true,
                skills: true,
                linkedinUrl: true,
              },
            },
          },
          orderBy: [{ aiScore: "desc" }, { appliedAt: "desc" }],
        },
      },
    });
    stages = rawStages;
  }

  return (
    <PipelineBoard
      jobs={jobs}
      selectedJobId={selectedJobId}
      stages={stages}
    />
  );
}
