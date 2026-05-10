"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SearchIcon, LayoutGridIcon, ListIcon, StarIcon, ChevronDownIcon } from "lucide-react";

interface Application {
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

function Stars({ score }: { score: number | null }) {
  if (score === null) return null;
  const filled = Math.round((score / 100) * 5);
  return (
    <div className="flex items-center gap-0.5 mt-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`h-3.5 w-3.5 ${i < filled ? "text-amber-400 fill-amber-400" : "text-theme-text20"}`}
        />
      ))}
    </div>
  );
}

function Avatar({ firstName, lastName, size = "md" }: { firstName: string; lastName: string; size?: "sm" | "md" }) {
  const cls = size === "sm"
    ? "h-8 w-8 text-xs"
    : "h-10 w-10 text-sm";
  return (
    <div className={`${cls} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 font-semibold text-white`}>
      {firstName[0]}{lastName[0]}
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  const app = candidate.applications[0];
  return (
    <Link href={`/candidates/${candidate.id}`}>
      <div className="rounded-xl border border-theme-border bg-theme-surface p-3.5 hover:border-theme-border2 transition-colors cursor-pointer">
        <div className="flex items-start gap-2.5">
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            <div className="h-4 w-1 rounded-full opacity-0 group-has-[.drag-handle]:opacity-100">
              <div className="flex flex-col gap-0.5">
                {[0,1,2,3].map(i => <div key={i} className="h-0.5 w-1 rounded bg-theme-text30" />)}
              </div>
            </div>
            <Avatar firstName={candidate.firstName} lastName={candidate.lastName} size="sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-theme-text leading-tight">
              {candidate.firstName} {candidate.lastName}
            </p>
            <p className="text-xs text-theme-text50 truncate mt-0.5">
              {app?.job.title ?? candidate.currentTitle ?? "—"}
            </p>
            <Stars score={null} />
          </div>
        </div>
      </div>
    </Link>
  );
}

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
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`h-2 w-2 rounded-full ${STAGE_DOTS[stage]}`} />
              <span className="text-sm font-semibold text-theme-text">{stage}</span>
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-theme-subtle text-xs font-medium text-theme-text50">
                {cards.length}
              </span>
            </div>
            {/* Cards */}
            <div className="space-y-2">
              {cards.map((c) => <CandidateCard key={c.id} candidate={c} />)}
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

function ListView({ candidates, search }: { candidates: Candidate[]; search: string }) {
  const filtered = useMemo(() => {
    if (!search.trim()) return candidates;
    const q = search.toLowerCase();
    return candidates.filter((c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.currentTitle ?? "").toLowerCase().includes(q) ||
      (c.currentCompany ?? "").toLowerCase().includes(q) ||
      (c.location ?? "").toLowerCase().includes(q) ||
      c.skills.some((s) => s.toLowerCase().includes(q))
    );
  }, [candidates, search]);

  if (filtered.length === 0) {
    return (
      <div className="py-12 text-center rounded-xl border border-theme-border">
        <p className="text-theme-text50 text-sm">No candidates match your search.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filtered.map((c) => {
        const app = c.applications[0];
        return (
          <Link key={c.id} href={`/candidates/${c.id}`}>
            <div className="flex items-center gap-4 rounded-xl border border-theme-border bg-theme-surface px-4 py-3 hover:border-theme-border2 transition-colors">
              <Avatar firstName={c.firstName} lastName={c.lastName} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-theme-text">
                  {c.firstName} {c.lastName}
                </p>
                <p className="text-xs text-theme-text50 truncate mt-0.5">
                  {c.currentTitle ?? app?.job.title ?? "—"}
                  {c.currentCompany ? ` · ${c.currentCompany}` : ""}
                </p>
              </div>
              {app && (
                <div className="shrink-0 text-right">
                  <p className="text-xs text-theme-text50">{app.job.title}</p>
                  {app.stage && (
                    <span className="text-xs text-theme-text40">{app.stage.name}</span>
                  )}
                </div>
              )}
              {c.location && (
                <p className="text-xs text-theme-text40 shrink-0 hidden lg:block">{c.location}</p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function CandidatesClient({ candidates, jobs }: { candidates: Candidate[]; jobs: Job[] }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"board" | "list">("board");
  const [jobFilter, setJobFilter] = useState("ALL");

  const searchFiltered = useMemo(() => {
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
        {/* Search */}
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

        {/* Job filter */}
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

        {/* View toggle */}
        <div className="flex rounded-xl border border-theme-border bg-theme-surface overflow-hidden">
          <button
            onClick={() => setView("board")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
              view === "board"
                ? "bg-theme-hover text-theme-text"
                : "text-theme-text50 hover:text-theme-text"
            }`}
          >
            <LayoutGridIcon className="h-4 w-4" />
            Board
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
              view === "list"
                ? "bg-theme-hover text-theme-text"
                : "text-theme-text50 hover:text-theme-text"
            }`}
          >
            <ListIcon className="h-4 w-4" />
            List
          </button>
        </div>
      </div>

      {view === "board" ? (
        <BoardView candidates={searchFiltered} jobFilter={jobFilter} />
      ) : (
        <ListView candidates={searchFiltered} search="" />
      )}
    </>
  );
}
