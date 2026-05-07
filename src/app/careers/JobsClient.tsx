"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SearchIcon, MapPinIcon, BriefcaseIcon, FilterIcon } from "lucide-react";

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time", PART_TIME: "Part Time",
  CONTRACT: "Contract", INTERNSHIP: "Internship", REMOTE: "Remote",
};

interface Job {
  id: string; title: string; department: string | null; location: string | null;
  type: string; salaryMin: number | null; salaryMax: number | null;
  salaryCurrency: string | null; createdAt: string;
}

export function JobsClient({ jobs }: { jobs: Job[] }) {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");
  const [location, setLocation] = useState("all");
  const [type, setType] = useState("all");

  const departments = useMemo(() => Array.from(new Set(jobs.map(j => j.department).filter(Boolean))) as string[], [jobs]);
  const locations = useMemo(() => Array.from(new Set(jobs.map(j => j.location).filter(Boolean))) as string[], [jobs]);

  const filtered = useMemo(() => jobs.filter(job => {
    const q = search.toLowerCase();
    const matchesSearch = !q || job.title.toLowerCase().includes(q) ||
      (job.department ?? "").toLowerCase().includes(q) ||
      (job.location ?? "").toLowerCase().includes(q);
    const matchesDept = dept === "all" || job.department === dept;
    const matchesLoc = location === "all" || job.location === location;
    const matchesType = type === "all" || job.type === type;
    return matchesSearch && matchesDept && matchesLoc && matchesType;
  }), [jobs, search, dept, location, type]);

  const selectClass = "rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E55B1F]";

  return (
    <div>
      {/* Search + Filters */}
      <div className="mb-8 space-y-3">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search jobs by title, department, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#E55B1F] text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4 text-white/40" />
            <span className="text-sm text-white/40">Filter:</span>
          </div>
          <select value={dept} onChange={e => setDept(e.target.value)} className={selectClass}>
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={location} onChange={e => setLocation(e.target.value)} className={selectClass}>
            <option value="all">All Locations</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={type} onChange={e => setType(e.target.value)} className={selectClass}>
            <option value="all">All Types</option>
            {Object.entries(JOB_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          {(search || dept !== "all" || location !== "all" || type !== "all") && (
            <button onClick={() => { setSearch(""); setDept("all"); setLocation("all"); setType("all"); }}
              className="text-sm text-[#E55B1F] hover:underline">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-white/50 text-sm mb-6">
        {filtered.length === 0 ? "No positions match your search." :
         `${filtered.length} position${filtered.length !== 1 ? "s" : ""} found`}
      </p>

      {/* Job list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-white/10 rounded-2xl">
          <p className="text-white/40">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(job => (
            <Link key={job.id} href={`/careers/${job.id}`}
              className="group flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E55B1F]/50 rounded-2xl p-6 transition-all">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {job.department && (
                    <span className="text-xs font-medium text-[#E55B1F] bg-[#E55B1F]/10 px-2 py-0.5 rounded-full">{job.department}</span>
                  )}
                  <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{JOB_TYPE_LABELS[job.type] ?? job.type}</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#E55B1F] transition-colors">{job.title}</h3>
                {job.location && (
                  <p className="text-white/50 text-sm mt-0.5 flex items-center gap-1">
                    <MapPinIcon className="h-3.5 w-3.5" />{job.location}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                {job.salaryMin && job.salaryMax && (
                  <span className="text-sm text-white/50">
                    {job.salaryCurrency ?? "USD"} {job.salaryMin.toLocaleString()} – {job.salaryMax.toLocaleString()}
                  </span>
                )}
                <span className="bg-[#E55B1F] group-hover:bg-[#d04e15] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors whitespace-nowrap">
                  Apply Now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
