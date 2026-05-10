import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon, LinkedinIcon } from "lucide-react";
import { CandidatesClient } from "./CandidatesClient";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  const candidates = await prisma.candidate.findMany({
    include: {
      _count: { select: { applications: true } },
      applications: {
        take: 2,
        orderBy: { appliedAt: "desc" },
        include: {
          job: { select: { title: true } },
          stage: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const serialized = candidates.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    applications: c.applications.map((a) => ({
      job: a.job,
      stage: a.stage,
      status: a.status,
    })),
  }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Candidates</h1>
          <p className="text-sm text-white/50 mt-1">{candidates.length} total in talent pool</p>
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

      <CandidatesClient candidates={serialized} />
    </div>
  );
}
