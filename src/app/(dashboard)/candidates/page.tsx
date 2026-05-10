import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon, LinkedinIcon } from "lucide-react";
import { CandidatesClient } from "./CandidatesClient";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  const [candidates, jobs] = await Promise.all([
    prisma.candidate.findMany({
      include: {
        _count: { select: { applications: true } },
        applications: {
          take: 1,
          orderBy: { appliedAt: "desc" },
          select: {
            id: true,
            aiScore: true,
            status: true,
            job: { select: { id: true, title: true } },
            stage: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.job.findMany({
      where: { status: { in: ["OPEN", "PAUSED"] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  const serialized = candidates.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone,
    location: c.location,
    currentTitle: c.currentTitle,
    currentCompany: c.currentCompany,
    source: c.source,
    skills: c.skills,
    linkedinUrl: c.linkedinUrl,
    createdAt: c.createdAt.toISOString(),
    _count: c._count,
    applications: c.applications.map((a) => ({
      id: a.id,
      aiScore: a.aiScore,
      job: a.job,
      stage: a.stage,
      status: a.status,
    })),
  }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-theme-text">Candidates</h1>
          <p className="text-sm text-theme-text50 mt-1">Track and manage candidates through your hiring pipeline</p>
        </div>
        <div className="flex gap-2">
          <Link href="/candidates/import">
            <Button variant="outline">
              <LinkedinIcon className="h-4 w-4 text-blue-400" />
              Import from LinkedIn
            </Button>
          </Link>
          <Link href="/candidates/new">
            <Button>
              <PlusIcon className="h-4 w-4" />
              Add Candidate
            </Button>
          </Link>
        </div>
      </div>

      <CandidatesClient candidates={serialized} jobs={jobs} />
    </div>
  );
}
