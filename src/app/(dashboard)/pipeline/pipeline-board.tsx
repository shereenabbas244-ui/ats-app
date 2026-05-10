"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkedinIcon, SparklesIcon, KanbanIcon } from "lucide-react";
import { scoreToColor } from "@/lib/utils";

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  currentTitle: string | null;
  currentCompany: string | null;
  skills: string[];
  linkedinUrl: string | null;
}

interface Application {
  id: string;
  aiScore: number | null;
  appliedAt: Date;
  source: string;
  candidate: Candidate;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  order: number;
  applications: Application[];
}

interface Job {
  id: string;
  title: string;
}

interface Props {
  jobs: Job[];
  selectedJobId?: string;
  stages: Stage[];
}

export function PipelineBoard({ jobs, selectedJobId, stages }: Props) {
  const router = useRouter();
  const [dragging, setDragging] = useState<string | null>(null);
  const [ranking, setRanking] = useState(false);

  const handleJobChange = (jobId: string) => {
    router.push(`/pipeline?jobId=${jobId}`);
  };

  const handleDragStart = (applicationId: string) => {
    setDragging(applicationId);
  };

  const handleDrop = async (stageId: string) => {
    if (!dragging) return;
    setDragging(null);

    await fetch(`/api/applications/${dragging}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stageId }),
    });

    router.refresh();
  };

  const handleRankAll = async () => {
    if (!selectedJobId) return;
    setRanking(true);
    try {
      await fetch("/api/ai/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedJobId }),
      });
      router.refresh();
    } finally {
      setRanking(false);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full">
        <KanbanIcon className="h-16 w-16 text-white/30 mb-4" />
        <p className="text-white/50 font-medium">No open jobs</p>
        <p className="text-sm text-white/40">Create a job posting to see the pipeline.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.08] bg-[#1C2133]">
        <h1 className="text-xl font-bold text-white shrink-0">Pipeline</h1>
        <select
          className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={selectedJobId ?? ""}
          onChange={(e) => handleJobChange(e.target.value)}
        >
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRankAll}
            loading={ranking}
            disabled={!selectedJobId}
          >
            <SparklesIcon className="h-4 w-4 text-indigo-500" />
            AI Rank All
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 p-6 h-full" style={{ minWidth: stages.length * 280 + "px" }}>
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="flex flex-col w-64 shrink-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stage.id)}
            >
              {/* Stage header */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
                <span className="text-sm font-semibold text-white/80">{stage.name}</span>
                <span className="ml-auto rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-white/50 font-medium">
                  {stage.applications.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 flex-1 min-h-24 rounded-xl bg-white/[0.03] p-2">
                {stage.applications.map((app) => (
                  <CandidateCard
                    key={app.id}
                    app={app}
                    onDragStart={() => handleDragStart(app.id)}
                    onDragEnd={() => setDragging(null)}
                  />
                ))}
                {stage.applications.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-xs text-white/40">Drop candidates here</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CandidateCard({
  app,
  onDragStart,
  onDragEnd,
}: {
  app: Application;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="rounded-lg border border-white/[0.08] bg-[#1C2133] p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-300 text-xs font-semibold">
            {app.candidate.firstName[0]}{app.candidate.lastName[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {app.candidate.firstName} {app.candidate.lastName}
            </p>
          </div>
        </div>
        {app.aiScore !== null && (
          <span className={`shrink-0 text-xs font-bold px-1.5 py-0.5 rounded ${scoreToColor(app.aiScore)}`}>
            {app.aiScore}
          </span>
        )}
      </div>

      {app.candidate.currentTitle && (
        <p className="text-xs text-white/50 mt-1.5 truncate">
          {app.candidate.currentTitle}
          {app.candidate.currentCompany ? ` · ${app.candidate.currentCompany}` : ""}
        </p>
      )}

      {app.candidate.skills.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {app.candidate.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-xs text-white/50">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <Badge variant="outline" className="text-xs">
          {app.source.replace("_", " ")}
        </Badge>
        {app.candidate.linkedinUrl && (
          <a
            href={app.candidate.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-500 hover:text-blue-700"
          >
            <LinkedinIcon className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
