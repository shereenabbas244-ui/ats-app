"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SearchIcon, BriefcaseIcon, MapPinIcon, LinkedinIcon, DownloadIcon } from "lucide-react";

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
  applications: Array<{
    job: { title: string };
    stage: { name: string } | null;
    status: string;
  }>;
}

const sourceVariant: Record<string, string> = {
  LINKEDIN: "bg-blue-100 text-blue-700",
  LINKEDIN_EASY_APPLY: "bg-blue-100 text-blue-700",
  RESUME_UPLOAD: "bg-purple-100 text-purple-700",
  MANUAL: "bg-gray-100 text-gray-700",
  REFERRAL: "bg-green-100 text-green-700",
  JOB_BOARD: "bg-orange-100 text-orange-700",
};

export function CandidatesClient({ candidates }: { candidates: Candidate[] }) {
  const [search, setSearch] = useState("");

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

  function handleExport() {
    window.open("/api/candidates/export", "_blank");
  }

  return (
    <>
      {/* Search + Export bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, title, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <DownloadIcon className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">{filtered.length} candidate{filtered.length !== 1 ? "s" : ""}</p>

      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center border border-gray-100 rounded-xl">
            <p className="text-gray-500">No candidates match your search.</p>
          </div>
        ) : (
          filtered.map((candidate) => (
            <Link key={candidate.id} href={`/candidates/${candidate.id}`}>
              <div className="hover:shadow-md transition-shadow bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-sm font-semibold">
                    {candidate.firstName[0]}{candidate.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">
                        {candidate.firstName} {candidate.lastName}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sourceVariant[candidate.source] ?? "bg-gray-100 text-gray-700"}`}>
                        {candidate.source.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
                      {candidate.currentTitle && (
                        <span className="flex items-center gap-1">
                          <BriefcaseIcon className="h-3 w-3" />
                          {candidate.currentTitle}{candidate.currentCompany ? ` at ${candidate.currentCompany}` : ""}
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
                          <span key={skill} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{skill}</span>
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
                      <p className="text-xs text-gray-400 mt-0.5">{candidate.applications[0].job.title}</p>
                    )}
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
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
