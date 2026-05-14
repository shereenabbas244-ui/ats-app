import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  ArrowLeftIcon,
  MailIcon,
  PhoneIcon,
  FileTextIcon,
  CalendarIcon,
  BriefcaseIcon,
  LinkedinIcon,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { CandidateDetailClient } from "./CandidateDetailClient";

const PIPELINE_STEPS = ["Applied", "Screening", "Interview", "Offer", "Hired"];

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
          job: {
            select: {
              id: true,
              title: true,
              department: true,
              location: true,
              stages: { orderBy: { order: "asc" }, select: { id: true, name: true } },
            },
          },
          stage: { select: { id: true, name: true, color: true } },
        },
        orderBy: { appliedAt: "desc" },
        take: 1,
      },
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
    },
  });

  if (!candidate) notFound();

  const app = candidate.applications[0] ?? null;
  const stageName = app?.stage?.name ?? "Applied";
  const stepIndex = PIPELINE_STEPS.findIndex(
    (s) => s.toLowerCase() === stageName.toLowerCase()
  );
  const currentStep = stepIndex >= 0 ? stepIndex : 0;

  // Resume download URL
  let resumeHref: string | null = null;
  let resumeFilename: string | null = null;
  if (candidate.resumeText?.startsWith("RESUME_FILE:")) {
    const parts = candidate.resumeText.split(":");
    resumeFilename = parts[1] ?? "resume";
    const base64 = parts.slice(2).join(":");
    const ext = resumeFilename.split(".").pop()?.toLowerCase();
    const mime =
      ext === "pdf"
        ? "application/pdf"
        : ext === "docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/msword";
    resumeHref = `data:${mime};base64,${base64}`;
  }

  const existingNotes = candidate.notes.map((n) => ({
    id: n.id,
    content: n.content,
    authorName: n.author.name ?? "Unknown",
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-theme-bg">
      {/* Back link */}
      <div className="px-8 pt-6 pb-0">
        <Link
          href="/candidates"
          className="inline-flex items-center gap-1.5 text-sm text-theme-text50 hover:text-theme-text transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Candidates
        </Link>
      </div>

      {/* Header */}
      <div className="px-8 pt-6 pb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xl font-bold">
            {candidate.firstName[0]}{candidate.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-theme-text">
              {candidate.firstName} {candidate.lastName}
            </h1>
            <p className="text-sm text-theme-text50 mt-0.5">
              {candidate.currentTitle ?? app?.job.title ?? "Candidate"}
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className="h-4 w-4 text-theme-text20"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>

        {/* Stage dropdown + status actions */}
        {app && (
          <div className="shrink-0 flex items-center gap-2">
            <CandidateDetailClient
              applicationId={app.id}
              currentStageName={stageName}
              currentStatus={app.status}
              candidateId={id}
              existingNotes={existingNotes}
              stageOptions={app.job.stages}
              renderOnly="stage-select"
            />
          </div>
        )}
      </div>

      {/* Pipeline progress */}
      <div className="mx-8 mb-6 rounded-xl border border-theme-border bg-theme-surface px-8 py-5">
        <div className="flex items-center">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              {/* Circle */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold border-2 transition-colors ${
                    i < currentStep
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : i === currentStep
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-theme-border3 text-theme-text40 bg-theme-surface"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-xs font-medium ${
                    i <= currentStep ? "text-indigo-400" : "text-theme-text40"
                  }`}
                >
                  {step}
                </span>
              </div>
              {/* Connector */}
              {i < PIPELINE_STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 rounded transition-colors ${
                    i < currentStep ? "bg-indigo-600" : "bg-theme-border3"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-6 px-8 pb-8">
        {/* Contact Information */}
        <div className="rounded-xl border border-theme-border bg-theme-surface p-6">
          <h2 className="text-sm font-semibold text-theme-text mb-5">Contact Information</h2>
          <div className="space-y-4">
            {candidate.email && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <MailIcon className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-theme-text40">Email</p>
                  <a href={`mailto:${candidate.email}`} className="text-sm text-theme-text hover:text-indigo-400 transition-colors">
                    {candidate.email}
                  </a>
                </div>
              </div>
            )}
            {candidate.phone && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                  <PhoneIcon className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-theme-text40">Phone</p>
                  <p className="text-sm text-theme-text">{candidate.phone}</p>
                </div>
              </div>
            )}
            {resumeHref && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                  <FileTextIcon className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-theme-text40">Resume</p>
                  <a
                    href={resumeHref}
                    download={resumeFilename ?? "resume"}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    View Resume
                  </a>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <CalendarIcon className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-theme-text40">Applied Date</p>
                <p className="text-sm text-theme-text">
                  {app ? formatDate(app.appliedAt) : formatDate(candidate.createdAt)}
                </p>
              </div>
            </div>
            {app && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                  <BriefcaseIcon className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-theme-text40">Applied For</p>
                  <Link href={`/jobs/${app.job.id}`} className="text-sm text-theme-text hover:text-indigo-400 transition-colors font-medium">
                    {app.job.title}
                  </Link>
                  {(app.job.department || app.job.location) && (
                    <p className="text-xs text-theme-text40">
                      {[app.job.department, app.job.location].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            )}
            {candidate.linkedinUrl && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <LinkedinIcon className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-theme-text40">LinkedIn</p>
                  <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    View Profile
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes & Feedback */}
        <CandidateDetailClient
          applicationId={app?.id ?? null}
          currentStageName={stageName}
          currentStatus={app?.status ?? "ACTIVE"}
          candidateId={id}
          existingNotes={existingNotes}
          renderOnly="notes"
        />
      </div>
    </div>
  );
}
