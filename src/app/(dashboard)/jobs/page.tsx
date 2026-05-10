import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BriefcaseIcon,
  MapPinIcon,
  UsersIcon,
  PlusIcon,
  LinkedinIcon,
  ClockIcon,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusVariant: Record<string, "default" | "success" | "warning" | "secondary" | "danger"> = {
  OPEN: "success",
  DRAFT: "secondary",
  PAUSED: "warning",
  CLOSED: "danger",
};

export default async function JobsPage() {
  await auth();

  const jobs = await prisma.job.findMany({
    include: {
      _count: { select: { applications: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Jobs</h1>
          <p className="text-sm text-white/50 mt-1">{jobs.length} total positions</p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <PlusIcon className="h-4 w-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <BriefcaseIcon className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/50 font-medium">No jobs yet</p>
              <p className="text-sm text-white/40 mt-1">Create your first job posting to start hiring.</p>
              <Link href="/jobs/new" className="mt-4 inline-block">
                <Button>
                  <PlusIcon className="h-4 w-4" />
                  Create Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                        <BriefcaseIcon className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white">{job.title}</h3>
                          <Badge variant={statusVariant[job.status]}>{job.status}</Badge>
                          {job.linkedinJobId && (
                            <span title="Posted on LinkedIn">
                              <LinkedinIcon className="h-4 w-4 text-blue-400" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-white/50 flex-wrap">
                          {job.department && <span>{job.department}</span>}
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="h-3.5 w-3.5" />
                              {job.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-3.5 w-3.5" />
                            {formatDate(job.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 text-sm text-white/60">
                        <UsersIcon className="h-4 w-4" />
                        <span className="font-medium">{job._count.applications}</span>
                        <span className="text-white/40">applicants</span>
                      </div>
                      {job.salaryMin && (
                        <span className="text-sm text-white/50">
                          ${(job.salaryMin / 1000).toFixed(0)}k
                          {job.salaryMax ? `–$${(job.salaryMax / 1000).toFixed(0)}k` : "+"}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
