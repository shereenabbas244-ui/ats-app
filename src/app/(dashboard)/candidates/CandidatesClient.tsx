"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  SearchIcon,
  LayoutGridIcon,
  ListIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MailIcon,
  PhoneIcon,
} from "lucide-react";

interface Application {
  id: string;
  aiScore: number | null;
  job: { id: string; title: string };
  stage: { name: string } | null;
  status: string;
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  currentTitle: string | null;
  currentCompany: string | null;
  source: string;
  skills: string[];
  linkedinUrl: string | null;
  createdAt: string;
  _count: { applications: number };
  applications: Application[];
}

interface Job {
  id: string;
  title: string;
}

const BOARD_STAGES = ["Applied", "Screening", "Interview", "Offer", "Hired"];

const STAGE_DOTS: Record<string, string> = {
  Applied:   "bg-blue-500",
  Screening: "bg-amber-500",
  Interview: "bg-purple-500",
  Offer:     "bg-green-500",
  Hired:     "bg-green-500",
};

const STAGE_BADGE: Record<string, string> = {
  Applied:   "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Screening: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Interview: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  Offer:     "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Hired:     "bg-green-500/15 text-green-400 border-green-500/20",
};

// Convert aiScore (0-100) to stars (0-5) and back
function scoreToStars(score: number | null): number {
  if (score === null) return 0;
  return Math.round((score / 100) * 5);
}
function starsToScore(stars: number): number {
  return Math.round((stars / 5) * 100);
}

function InteractiveStars({
  applicationId,
  initialScore,
}: {
  applicationId: string | null;
  initialScore: number | null;
}) {
  const [score, setScore] = useState<number | null>(initialScore);
  const [hover, setHover] = useState(0);
  const [saving, setSaving] = useState(false);
  const filled = hover > 0 ? hover : scoreToStars(score);

  async function handleClick(star: number) {
    if (!applicationId || saving) return;
    const newScore = starsToScore(star);
    setScore(newScore);
    setSaving(true);
    try {
      await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiScore: newScore }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          disabled={!applicationId || saving}
          onClick={() => handleClick(i + 1)}
          onMouseEnter={() => applicationId && setHover(i + 1)}
          onMouseLeave={() => setHover(0)}
          className={`transition-colors disabled:cursor-default ${
            applicationId ? "cursor-pointer hover:scale-110" : "cursor-default"
          }`}
        >
          <StarIcon
            className={`h-3.5 w-3.5 transition-colors ${
              i < filled ? "text-amber-400 fill-amber-400" : "text-theme-text20"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function Avatar({ firstName, lastName, size = "md" }: { firstName: string; lastName: string; size?: "sm" | "md" | "lg" }) {
  const cls =
    size === "sm" ? "h-8 w-8 text-xs" :
    size === "lg" ? "h-12 w-12 text-base" :
    "h-10 w-10 text-sm";
  return (
    <div className={`${cls} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 font-semibold text-white`}>
      {firstName[0]}{lastName[0]}
    </div>
  );
}

// ---- Board View ----
function BoardView({ candidates, jobFilter }: { candidates: Candidate[]; jobFilter: string }) {
  const filtered = useMemo(() => {
    if (jobFilter === "ALL") return candidates;
    return candidates.filter((c) => c.applications.some((a) => a.job.id === jobFilter));
  }, [candidates, jobFilter]);

  const byStage = useMemo(() => {
    const map: Record<string, Candidate[]> = {};
    BOARD_STAGES.forEach((s) => { map[s] = []; });
    filtered.forEach((c) => {
      const stageName = c.applications[0]?.stage?.name ?? "Applied";
      const col = BOARD_STAGES.find((s) => s.toLowerCase() === stageName.toLowerCase()) ?? "Applied";
      map[col].push(c);
    });
    return map;
  }, [filtered]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {BOARD_STAGES.map((stage) => {
        const cards = byStage[stage] ?? [];
        return (
          <div key={stage} className="flex-shrink-0 w-64">
            <div className="flex items-center gap-2 mb-3">
              <span className={`h-2 w-2 rounded-full ${STAGE_DOTS[stage]}`} />
              <span className="text-sm font-semibold text-theme-text">{stage}</span>
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-theme-subtle text-xs font-medium text-theme-text50">
                {cards.length}
              </span>
            </div>
            <div className="space-y-2">
              {cards.map((c) => {
                const app = c.applications[0];
                return (
                  <Link key={c.id} href={`/candidates/${c.id}`}>
                    <div className="rounded-xl border border-theme-border bg-theme-surface p-3.5 hover:border-theme-border2 transition-colors cursor-pointer">
                      <div className="flex items-start gap-2.5">
                        <Avatar firstName={c.firstName} lastName={c.lastName} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-theme-text leading-tight">
                            {c.firstName} {c.lastName}
                          </p>
                          <p className="text-xs text-theme-text50 truncate mt-0.5">
                            {app?.job.title ?? c.currentTitle ?? "—"}
                          </p>
                          <div className="mt-1.5">
                            <InteractiveStars
                              applicationId={app?.id ?? null}
                              initialScore={app?.aiScore ?? null}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {cards.length === 0 && (
                <div className="rounded-xl border border-dashed border-theme-border py-8 text-center">
                  <p className="text-xs text-theme-text30">No candidates</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- List View ----
function ListView({ candidates }: { candidates: Candidate[] }) {
  if (candidates.length === 0) {
    return (
      <div className="py-12 text-center rounded-xl border border-theme-border">
        <p className="text-theme-text50 text-sm">No candidates match your search.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-theme-border bg-theme-surface overflow-hidden">
      {candidates.map((c, idx) => {
        const app = c.applications[0];
        const stageName = app?.stage?.name ?? null;
        const badgeCls = stageName ? (STAGE_BADGE[stageName] ?? "bg-theme-subtle text-theme-text50 border-theme-border") : null;

        return (
          <Link key={c.id} href={`/candidates/${c.id}`}>
            <div
              className={`flex items-center gap-4 px-5 py-4 hover:bg-theme-hover transition-colors cursor-pointer ${
                idx < candidates.length - 1 ? "border-b border-theme-border" : ""
              }`}
            >
              {/* Avatar */}
              <Avatar firstName={c.firstName} lastName={c.lastName} />

              {/* Name + title */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-theme-text">
                  {c.firstName} {c.lastName}
                </p>
                <p className="text-xs text-theme-text50 mt-0.5 truncate">
                  {c.currentTitle ?? app?.job.title ?? "—"}
                </p>
              </div>

              {/* Email */}
              {c.email && (
                <div className="hidden md:flex items-center gap-1.5 text-xs text-theme-text50 min-w-0">
                  <MailIcon className="h-3.5 w-3.5 shrink-0 text-theme-text30" />
                  <span className="truncate max-w-[180px]">{c.email}</span>
                </div>
              )}

              {/* Phone */}
              {c.phone && (
                <div className="hidden lg:flex items-center gap-1.5 text-xs text-theme-text50 shrink-0">
                  <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-theme-text30" />
                  <span>{c.phone}</span>
                </div>
              )}

              {/* Stage badge */}
              {stageName && badgeCls && (
                <span className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badgeCls}`}>
                  {stageName}
                </span>
              )}

              {/* Stars */}
              <div className="shrink-0" onClick={(e) => e.preventDefault()}>
                <InteractiveStars
                  applicationId={app?.id ?? null}
                  initialScore={app?.aiScore ?? null}
                />
              </div>

              {/* Chevron */}
              <ChevronRightIcon className="h-4 w-4 text-theme-text30 shrink-0" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ---- Main ----
export function CandidatesClient({ candidates, jobs }: { candidates: Candidate[]; jobs: Job[] }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"board" | "list">("list");
  const [jobFilter, setJobFilter] = useState("ALL");

  const filtered = useMemo(() => {
    if (!search.trim()) return candidates;
    const q = search.toLowerCase();
    return candidates.filter((c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.currentTitle ?? "").toLowerCase().includes(q) ||
      (c.location ?? "").toLowerCase().includes(q)
    );
  }, [candidates, search]);

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-text40" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-theme-border bg-theme-surface pl-9 pr-4 py-2.5 text-sm text-theme-text placeholder-theme-text40 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="relative">
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="appearance-none rounded-xl border border-theme-border bg-theme-surface pl-4 pr-9 py-2.5 text-sm text-theme-text focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[150px] cursor-pointer"
          >
            <option value="ALL">All Jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-text40" />
        </div>

        <div className="flex rounded-xl border border-theme-border bg-theme-surface overflow-hidden shrink-0">
          <button
            onClick={() => setView("board")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
              view === "board" ? "bg-theme-hover text-theme-text" : "text-theme-text50 hover:text-theme-text"
            }`}
          >
            <LayoutGridIcon className="h-4 w-4" />
            Board
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
              view === "list" ? "bg-theme-hover text-theme-text" : "text-theme-text50 hover:text-theme-text"
            }`}
          >
            <ListIcon className="h-4 w-4" />
            List
          </button>
        </div>
      </div>

      {view === "board" ? (
        <BoardView candidates={filtered} jobFilter={jobFilter} />
      ) : (
        <ListView candidates={filtered} />
      )}
    </>
  );
}
