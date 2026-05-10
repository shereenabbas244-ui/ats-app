import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { JobsClient } from "./JobsClient";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  await auth();

  const jobs = await prisma.job.findMany({
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    department: j.department,
    location: j.location,
    status: j.status,
    createdAt: j.createdAt.toISOString(),
    linkedinJobId: j.linkedinJobId,
    _count: j._count,
  }));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-theme-text">Job Postings</h1>
          <p className="text-sm text-theme-text50 mt-1">Manage your open positions and job listings</p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <PlusIcon className="h-4 w-4" />
            Create Job
          </Button>
        </Link>
      </div>

      <JobsClient jobs={serialized} />
    </div>
  );
}
