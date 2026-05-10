"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPinIcon,
  UsersIcon,
  CalendarIcon,
  SearchIcon,
  MoreHorizontalIcon,
  BriefcaseIcon,
  LinkedinIcon,
  XIcon,
  PencilIcon,
  BuildingIcon,
  DollarSignIcon,
  ClockIcon,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

type Job = {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  status: string;
  type: string | null;
  description: string | null;
  requirements: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
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

function statusLabel(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

function salaryRange(job: Job) {
  if (!job.salaryMin) return null;
  const cur = job.salaryCurrency ?? "SAR";
  const fmt = (n: number) => `${cur} ${(n / 1000).toFixed(0)}K`;
  return job.salaryMax ? `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}` : `${fmt(job.salaryMin)}+`;
}

// ---- Overlay backdrop ----
function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}

// ---- View Modal ----
function ViewModal({ job, onClose, onEdit }: { job: Job; onClose: () => void; onEdit: () => void }) {
  const salary = salaryRange(job);
  const reqList = job.requirements
    ? job.requirements.split(/\n|,/).map((r) => r.trim()).filter(Boolean)
    : [];

  return (
    <Overlay onClose={onClose}>
      <div className="relative w-full max-w-lg rounded-2xl border border-theme-border bg-theme-surface shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-theme-border">
          <div className="flex-1 pr-8">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-theme-text">{job.title}</h2>
              {job.linkedinJobId && <LinkedinIcon className="h-4 w-4 text-blue-400 shrink-0" />}
            </div>
            <p className="text-sm text-theme-text50">{job.department ?? "No department"}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-theme-text40 hover:bg-theme-hover hover:text-theme-text transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Meta row */}
        <div className="px-6 py-4 border-b border-theme-border flex flex-wrap gap-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[job.status] ?? STATUS_COLORS.DRAFT}`}>
            {statusLabel(job.status)}
          </span>
          {job.type && (
            <span className="flex items-center gap-1.5 text-xs text-theme-text50">
              <ClockIcon className="h-3.5 w-3.5" /> {job.type.replace(/_/g, " ")}
            </span>
          )}
          {job.location && (
            <span className="flex items-center gap-1.5 text-xs text-theme-text50">
              <MapPinIcon className="h-3.5 w-3.5" /> {job.location}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-theme-text50">
            <UsersIcon className="h-3.5 w-3.5" /> {job._count.applications} applicants
          </span>
          <span className="flex items-center gap-1.5 text-xs text-theme-text50">
            <CalendarIcon className="h-3.5 w-3.5" /> {formatDate(job.createdAt)}
          </span>
          {salary && (
            <span className="flex items-center gap-1.5 text-xs text-theme-text50">
              <DollarSignIcon className="h-3.5 w-3.5" /> {salary}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {job.description && (
            <div>
              <h3 className="text-xs font-semibold text-theme-text40 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-theme-text70 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
          )}
          {reqList.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-theme-text40 uppercase tracking-wider mb-2">Requirements</h3>
              <ul className="space-y-1.5">
                {reqList.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-theme-text70">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 transition-colors"
          >
            <PencilIcon className="h-4 w-4" /> Edit Job
          </button>
          <Link
            href={`/jobs/${job.id}`}
            className="flex items-center gap-2 rounded-lg border border-theme-border text-theme-text60 hover:bg-theme-hover text-sm font-medium px-4 py-2.5 transition-colors"
          >
            Open page
          </Link>
        </div>
      </div>
    </Overlay>
  );
}

// ---- Edit Modal ----
function EditModal({ job, onClose, onSaved }: { job: Job; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: job.title,
    department: job.department ?? "",
    location: job.location ?? "",
    type: job.type ?? "",
    description: job.description ?? "",
    requirements: job.requirements ?? "",
    status: job.status,
    salaryMin: job.salaryMin?.toString() ?? "",
    salaryMax: job.salaryMax?.toString() ?? "",
    salaryCurrency: job.salaryCurrency ?? "SAR",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          department: form.department || null,
          location: form.location || null,
          type: form.type || null,
          description: form.description || null,
          requirements: form.requirements || null,
          status: form.status,
          salaryMin: form.salaryMin ? parseInt(form.salaryMin) : null,
          salaryMax: form.salaryMax ? parseInt(form.salaryMax) : null,
          salaryCurrency: form.salaryCurrency || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full rounded-lg border border-theme-border bg-theme-faint px-3 py-2 text-sm text-theme-text placeholder-theme-text40 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <Overlay onClose={onClose}>
      <div className="relative w-full max-w-lg rounded-2xl border border-theme-border bg-theme-surface shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-theme-border">
          <h2 className="text-xl font-bold text-theme-text">Edit Job</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-theme-text40 hover:bg-theme-hover hover:text-theme-text transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-theme-text50 mb-1.5">Job Title *</label>
            <input required className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-theme-text50 mb-1.5">Department</label>
              <input className={inputCls} placeholder="Engineering" value={form.department} onChange={(e) => set("department", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-text50 mb-1.5">Location</label>
              <input className={inputCls} placeholder="Riyadh, KSA" value={form.location} onChange={(e) => set("location", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-theme-text50 mb-1.5">Type</label>
              <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
                <option value="">Select type</option>
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-text50 mb-1.5">Status</label>
              <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="OPEN">Open</option>
                <option value="DRAFT">Draft</option>
                <option value="PAUSED">Paused</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-theme-text50 mb-1.5">Description</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-theme-text50 mb-1.5">Requirements</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={4}
              placeholder="One requirement per line, or comma-separated"
              value={form.requirements}
              onChange={(e) => set("requirements", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-theme-text50 mb-1.5">Min Salary</label>
              <input type="number" className={inputCls} placeholder="e.g. 8000" value={form.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-text50 mb-1.5">Max Salary</label>
              <input type="number" className={inputCls} placeholder="e.g. 15000" value={form.salaryMax} onChange={(e) => set("salaryMax", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-text50 mb-1.5">Currency</label>
              <select className={inputCls} value={form.salaryCurrency} onChange={(e) => set("salaryCurrency", e.target.value)}>
                <option value="SAR">SAR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="AED">AED</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold py-2.5 transition-colors"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-theme-border text-theme-text60 hover:bg-theme-hover text-sm font-medium px-4 py-2.5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}

// ---- Job Card ----
function JobCard({ job, onView, onEdit }: { job: Job; onView: () => void; onEdit: () => void }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleDelete() {
    if (!confirm(`Delete "${job.title}"?`)) return;
    await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
    router.refresh();
  }

  const salary = salaryRange(job);

  return (
    <div className="relative rounded-xl border border-theme-border bg-theme-surface p-5 hover:border-theme-border2 transition-colors group cursor-pointer"
      onClick={onView}
    >
      {/* Three-dot menu */}
      <div ref={menuRef} className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); }}
          className="p-1.5 rounded-lg text-theme-text40 hover:text-theme-text hover:bg-theme-hover transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontalIcon className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-20 w-40 rounded-lg border border-theme-border bg-theme-surface shadow-lg py-1">
            <button
              onClick={() => { setMenuOpen(false); onView(); }}
              className="w-full text-left px-3 py-2 text-sm text-theme-text60 hover:bg-theme-hover hover:text-theme-text"
            >
              View details
            </button>
            <button
              onClick={() => { setMenuOpen(false); onEdit(); }}
              className="w-full text-left px-3 py-2 text-sm text-theme-text60 hover:bg-theme-hover hover:text-theme-text"
            >
              Edit job
            </button>
            <Link
              href={`/jobs/${job.id}`}
              className="block px-3 py-2 text-sm text-theme-text60 hover:bg-theme-hover hover:text-theme-text"
              onClick={() => setMenuOpen(false)}
            >
              Open page
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

      <div className="pr-8">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h3 className="font-bold text-theme-text text-base leading-snug">{job.title}</h3>
          {job.linkedinJobId && <LinkedinIcon className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
        </div>
        <p className="text-theme-text50 text-sm mb-4">{job.department ?? "—"}</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-theme-text50 mb-5">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0" /> {job.location}
          </span>
        )}
        <span className="flex items-center gap-1">
          <UsersIcon className="h-3.5 w-3.5 shrink-0" /> {job._count.applications} applicants
        </span>
        <span className="flex items-center gap-1">
          <CalendarIcon className="h-3.5 w-3.5 shrink-0" /> {formatDate(job.createdAt)}
        </span>
        {salary && (
          <span className="flex items-center gap-1">
            <DollarSignIcon className="h-3.5 w-3.5 shrink-0" /> {salary}
          </span>
        )}
      </div>

      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[job.status] ?? STATUS_COLORS.DRAFT}`}>
        {statusLabel(job.status)}
      </span>
    </div>
  );
}

// ---- Main Client Component ----
export function JobsClient({ jobs: initialJobs }: { jobs: Job[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewJob, setViewJob] = useState<Job | null>(null);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  const filtered = jobs.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      (job.department ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (job.location ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || job.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleSaved() {
    setEditJob(null);
    router.refresh();
  }

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
            <JobCard
              key={job.id}
              job={job}
              onView={() => setViewJob(job)}
              onEdit={() => setEditJob(job)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {viewJob && (
        <ViewModal
          job={viewJob}
          onClose={() => setViewJob(null)}
          onEdit={() => { setViewJob(null); setEditJob(viewJob); }}
        />
      )}
      {editJob && (
        <EditModal
          job={editJob}
          onClose={() => setEditJob(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
