"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPinIcon,
  UsersIcon,
  CalendarIcon,
  SearchIcon,
  MoreHorizontalIcon,
  BriefcaseIcon,
  PlusIcon,
  LinkedinIcon,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

type Job = {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  status: string;
  createdAt: string;
  linkedinJobId: string | null;
  _count: { applications: number };
};

const STATUS_COLORS: Record<string, string> = {
  OPEN:   "bg-green-500/15 text-green-500 dark:text-green-400 border border-green-500/30",
  DRAFT:  "bg-blue-500/15 text-blue-500 dark:text-blue-400 border border-blue-500/30",
  PAUSED: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
  CLOSED: "bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/30",
};

function JobCard({ job }: { job: Job }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleDelete() {
    if (!confirm(`Delete "${job.title}"?`)) return;
    await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
    router.refresh();
  }

  const statusLabel = job.status.charAt(0) + job.status.slice(1).toLowerCase();

  return (
    <div className="relative rounded-xl border border-theme-border bg-theme-surface p-5 hover:border-theme-border2 transition-colors group">
      {/* Three-dot menu */}
      <div ref={menuRef} className="absolute top-4 right-4">
        <button
          onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); }}
          className="p-1.5 rounded-lg text-theme-text40 hover:text-theme-text hover:bg-theme-hover transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontalIcon className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-20 w-36 rounded-lg border border-theme-border bg-theme-surface shadow-lg py-1">
            <Link
              href={`/jobs/${job.id}`}
              className="block px-3 py-2 text-sm text-theme-text60 hover:bg-theme-hover hover:text-theme-text"
              onClick={() => setMenuOpen(false)}
            >
              View details
            </Link>
            <Link
              href={`/jobs/${job.id}/edit`}
              className="block px-3 py-2 text-sm text-theme-text60 hover:bg-theme-hover hover:text-theme-text"
              onClick={() => setMenuOpen(false)}
            >
              Edit job
            </Link>
            <button
              onClick={handleDelete}
              className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <Link href={`/jobs/${job.id}`} className="block">
        <div className="flex items-start gap-1 mb-0.5 pr-8">
          <h3 className="font-bold text-theme-text text-base leading-snug">{job.title}</h3>
          {job.linkedinJobId && (
            <LinkedinIcon className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
          )}
        </div>
        <p className="text-theme-text50 text-sm mb-4">{job.department ?? "—"}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-theme-text50 mb-5">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
              {job.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <UsersIcon className="h-3.5 w-3.5 shrink-0" />
            {job._count.applications} applicants
          </span>
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
            {formatDate(job.createdAt)}
          </span>
        </div>

        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[job.status] ?? STATUS_COLORS.DRAFT}`}>
          {statusLabel}
        </span>
      </Link>
    </div>
  );
}

export function JobsClient({ jobs }: { jobs: Job[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = jobs.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      (job.department ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (job.location ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || job.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <>
      {/* Search + filter bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-text40" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-theme-border bg-theme-surface pl-9 pr-4 py-2.5 text-sm text-theme-text placeholder-theme-text40 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-theme-border bg-theme-surface px-4 py-2.5 text-sm text-theme-text focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[130px]"
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="DRAFT">Draft</option>
          <option value="PAUSED">Paused</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-theme-border bg-theme-surface py-16 text-center">
          <BriefcaseIcon className="h-12 w-12 text-theme-text30 mx-auto mb-4" />
          <p className="text-theme-text50 font-medium">
            {jobs.length === 0 ? "No jobs yet" : "No jobs match your search"}
          </p>
          {jobs.length === 0 && (
            <p className="text-sm text-theme-text40 mt-1">Create your first job posting to start hiring.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </>
  );
}
