import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowLeftIcon,
  MapPinIcon,
  BriefcaseIcon,
  MailIcon,
  PhoneIcon,
  LinkedinIcon,
  CalendarIcon,
  SparklesIcon,
} from "lucide-react";
import { formatDate, scoreToColor, scoreToLabel } from "@/lib/utils";
import { CandidateActions } from "./actions";

const statusVariant: Record<string, "default" | "success" | "warning" | "secondary" | "danger"> = {
  ACTIVE: "success",
  WITHDRAWN: "secondary",
  REJECTED: "danger",
  HIRED: "default",
  ON_HOLD: "warning",
};

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      applications: {
        include: {
          job: { select: { id: true, title: true, department: true } },
          stage: { select: { name: true, color: true } },
          notes: { orderBy: { createdAt: "desc" }, take: 3, include: { author: { select: { name: true } } } },
        },
        orderBy: { appliedAt: "desc" },
      },
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
    },
  });

  if (!candidate) notFound();

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/candidates" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {candidate.firstName} {candidate.lastName}
        </h1>
        <Badge variant="outline">{candidate.source.replace(/_/g, " ")}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Profile */}
        <div className="col-span-1 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xl font-bold mb-3">
                  {candidate.firstName[0]}{candidate.lastName[0]}
                </div>
                <h2 className="font-bold text-gray-900">{candidate.firstName} {candidate.lastName}</h2>
                {candidate.currentTitle && (
                  <p className="text-sm text-gray-500">{candidate.currentTitle}{candidate.currentCompany ? ` at ${candidate.currentCompany}` : ""}</p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <a href={`mailto:${candidate.email}`} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600">
                  <MailIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{candidate.email}</span>
                </a>
                {candidate.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <PhoneIcon className="h-4 w-4 shrink-0" />
                    <span>{candidate.phone}</span>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPinIcon className="h-4 w-4 shrink-0" />
                    <span>{candidate.location}</span>
                  </div>
                )}
                {candidate.linkedinUrl && (
                  <a
                    href={candidate.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <LinkedinIcon className="h-4 w-4 shrink-0" />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
                <div className="flex items-center gap-2 text-gray-400 text-xs pt-1">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>Added {formatDate(candidate.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {candidate.skills.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Skills</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-0.5 text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {candidate.summary && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Summary</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 leading-relaxed">{candidate.summary}</p>
              </CardContent>
            </Card>
          )}

          {candidate.resumeText?.startsWith("RESUME_FILE:") && (() => {
            const parts = candidate.resumeText.split(":");
            const filename = parts[1] ?? "resume";
            const base64 = parts.slice(2).join(":");
            const ext = filename.split(".").pop()?.toLowerCase();
            const mime = ext === "pdf" ? "application/pdf"
              : ext === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              : "application/msword";
            const href = `data:${mime};base64,${base64}`;
            return (
              <Card>
                <CardHeader><CardTitle className="text-sm">Resume / CV</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  <a
                    href={href}
                    download={filename}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    <BriefcaseIcon className="h-4 w-4" />
                    Download {filename}
                  </a>
                </CardContent>
              </Card>
            );
          })()}
        </div>

        {/* Right: Applications + Notes */}
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BriefcaseIcon className="h-4 w-4" />
                Applications ({candidate.applications.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {candidate.applications.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No applications yet.</p>
              ) : (
                <div className="space-y-3">
                  {candidate.applications.map((app) => (
                    <div key={app.id} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/jobs/${app.job.id}`} className="font-medium text-gray-900 hover:text-indigo-600 text-sm">
                            {app.job.title}
                          </Link>
                          {app.job.department && (
                            <span className="text-xs text-gray-500 ml-2">· {app.job.department}</span>
                          )}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <Badge variant={statusVariant[app.status]}>{app.status}</Badge>
                            {app.stage && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {app.stage.name}
                              </span>
                            )}
                            {app.aiScore !== null && (
                              <span className={`text-xs font-semibold flex items-center gap-1 ${scoreToColor(app.aiScore)}`}>
                                <SparklesIcon className="h-3 w-3" />
                                {app.aiScore}% {scoreToLabel(app.aiScore)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-400">{formatDate(app.appliedAt)}</p>
                          <CandidateActions applicationId={app.id} currentStatus={app.status} />
                        </div>
                      </div>
                      {app.coverLetter && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic">"{app.coverLetter}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
            <CardContent className="pt-0">
              {candidate.notes.length === 0 ? (
                <p className="text-sm text-gray-400 py-2 text-center">No notes yet.</p>
              ) : (
                <div className="space-y-3">
                  {candidate.notes.map((note) => (
                    <div key={note.id} className="border-l-2 border-indigo-200 pl-3">
                      <p className="text-sm text-gray-700">{note.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{note.author.name} · {formatDate(note.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
