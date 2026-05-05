import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeftIcon,
  MapPinIcon,
  BriefcaseIcon,
  UsersIcon,
  LinkedinIcon,
  SparklesIcon,
  PencilIcon,
} from "lucide-react";
import { formatDate, scoreToColor, scoreToLabel } from "@/lib/utils";

const statusVariant: Record<string, "default" | "success" | "warning" | "secondary" | "danger"> = {
  OPEN: "success",
  DRAFT: "secondary",
  PAUSED: "warning",
  CLOSED: "danger",
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      stages: { orderBy: { order: "asc" } },
      createdBy: { select: { name: true } },
      applications: {
        include: {
          candidate: true,
          stage: true,
        },
        where: { status: "ACTIVE" },
        orderBy: [{ aiScore: "desc" }, { appliedAt: "desc" }],
      },
    },
  });

  if (!job) notFound();

  const avgScore =
    job.applications.filter((a) => a.aiScore !== null).length > 0
      ? Math.round(
          job.applications
            .filter((a) => a.aiScore !== null)
            .reduce((sum, a) => sum + a.aiScore!, 0) /
            job.applications.filter((a) => a.aiScore !== null).length
        )
      : null;

  return (
    <div className="p-8">
      <div className="flex items-start gap-4 mb-8">
        <Link href="/jobs" className="text-gray-400 hover:text-gray-600 mt-1 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <Badge variant={statusVariant[job.status]}>{job.status}</Badge>
            {job.linkedinJobId && (
              <a
                href={job.linkedinPostUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <LinkedinIcon className="h-4 w-4" />
                View on LinkedIn
              </a>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
            {job.department && <span>{job.department}</span>}
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPinIcon className="h-3.5 w-3.5" />
                {job.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <BriefcaseIcon className="h-3.5 w-3.5" />
              {job.type.replace("_", " ")}
            </span>
            <span>Posted {formatDate(job.createdAt)}</span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href={`/jobs/${job.id}/edit`}>
            <Button variant="outline" size="sm">
              <PencilIcon className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Link href={`/pipeline?jobId=${job.id}`}>
            <Button variant="outline" size="sm">
              View Pipeline
            </Button>
          </Link>
          <Link href={`/ai?jobId=${job.id}`}>
            <Button variant="outline" size="sm">
              <SparklesIcon className="h-4 w-4" />
              AI Rank All
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Candidates */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              Candidates ({job.applications.length})
            </h2>
            {avgScore !== null && (
              <span className="text-sm text-gray-500">Avg AI Score: <strong>{avgScore}</strong></span>
            )}
          </div>

          {job.applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <UsersIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No candidates yet</p>
              </CardContent>
            </Card>
          ) : (
            job.applications.map((app) => (
              <Card key={app.id}>
                <CardContent className="py-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                      {app.candidate.firstName[0]}{app.candidate.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">
                        {app.candidate.firstName} {app.candidate.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {app.candidate.currentTitle ?? app.candidate.email}
                      </p>
                    </div>
                    {app.stage && (
                      <Badge variant="outline" className="shrink-0">
                        {app.stage.name}
                      </Badge>
                    )}
                    {app.aiScore !== null && (
                      <span
                        className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${scoreToColor(app.aiScore)}`}
                      >
                        {app.aiScore} · {scoreToLabel(app.aiScore)}
                      </span>
                    )}
                    <Link href={`/candidates/${app.candidate.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right: Job info */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Pipeline Stages</CardTitle></CardHeader>
            <CardContent className="py-2">
              {job.stages.map((stage) => (
                <div key={stage.id} className="flex items-center gap-2 py-1.5">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-sm text-gray-700">{stage.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {job.salaryMin && (
            <Card>
              <CardHeader><CardTitle>Compensation</CardTitle></CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-900">
                  ${job.salaryMin.toLocaleString()}
                  {job.salaryMax ? ` – $${job.salaryMax.toLocaleString()}` : "+"}
                </p>
                <p className="text-sm text-gray-500">{job.salaryCurrency} / year</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-6">
                {job.description}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
