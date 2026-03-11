import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  UsersIcon,
  PlusIcon,
  LinkedinIcon,
  MapPinIcon,
  BriefcaseIcon,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

const sourceVariant: Record<string, "default" | "secondary" | "outline"> = {
  LINKEDIN: "default",
  LINKEDIN_EASY_APPLY: "default",
  RESUME_UPLOAD: "secondary",
  MANUAL: "outline",
  REFERRAL: "secondary",
  JOB_BOARD: "outline",
};

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
    take: 100,
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-sm text-gray-500 mt-1">{candidates.length} total in talent pool</p>
        </div>
        <div className="flex gap-2">
          <Link href="/candidates/import">
            <Button variant="outline">
              <LinkedinIcon className="h-4 w-4 text-blue-600" />
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

      <div className="grid gap-3">
        {candidates.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No candidates yet</p>
              <p className="text-sm text-gray-400 mt-1">Add candidates manually or import from LinkedIn.</p>
            </CardContent>
          </Card>
        ) : (
          candidates.map((candidate) => (
            <Link key={candidate.id} href={`/candidates/${candidate.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="py-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-sm font-semibold">
                      {candidate.firstName[0]}{candidate.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm">
                          {candidate.firstName} {candidate.lastName}
                        </p>
                        <Badge variant={sourceVariant[candidate.source] ?? "outline"} className="text-xs">
                          {candidate.source.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
                        {candidate.currentTitle && (
                          <span className="flex items-center gap-1">
                            <BriefcaseIcon className="h-3 w-3" />
                            {candidate.currentTitle}
                            {candidate.currentCompany ? ` at ${candidate.currentCompany}` : ""}
                          </span>
                        )}
                        {candidate.location && (
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="h-3 w-3" />
                            {candidate.location}
                          </span>
                        )}
                      </div>
                      {candidate.skills.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {candidate.skills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                            >
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 5 && (
                            <span className="text-xs text-gray-400">+{candidate.skills.length - 5}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <BriefcaseIcon className="h-3.5 w-3.5" />
                        <span>{candidate._count.applications} jobs</span>
                      </div>
                      {candidate.applications.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {candidate.applications[0].job.title}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">{formatRelativeTime(candidate.createdAt)}</p>
                    </div>
                    {candidate.linkedinUrl && (
                      <a
                        href={candidate.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 text-blue-500 hover:text-blue-700"
                      >
                        <LinkedinIcon className="h-4 w-4" />
                      </a>
                    )}
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
