"use client";

import { useState } from "react";
import Link from "next/link";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  APPLIED:    { label: "Application Received",    color: "text-blue-400",   icon: "📨" },
  REVIEWING:  { label: "Under Review",            color: "text-yellow-400", icon: "🔍" },
  INTERVIEW:  { label: "Interview Scheduled",     color: "text-purple-400", icon: "🗓️" },
  OFFER:      { label: "Offer Extended",          color: "text-green-400",  icon: "🎉" },
  HIRED:      { label: "Hired — Congratulations!", color: "text-green-400",  icon: "✅" },
  REJECTED:   { label: "Not Moving Forward",      color: "text-red-400",    icon: "❌" },
  ON_HOLD:    { label: "Application On Hold",     color: "text-orange-400", icon: "⏸️" },
  WITHDRAWN:  { label: "Withdrawn",               color: "text-gray-400",   icon: "↩️" },
};

interface AppResult {
  id: string;
  status: string;
  appliedAt: string;
  stage: { name: string } | null;
  job: { title: string; department: string | null; location: string | null };
}

export default function ApplicationStatusPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AppResult[] | null>(null);
  const [error, setError] = useState("");

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch(`/api/public/status?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        setError("No applications found for this email address.");
      } else {
        const data = await res.json() as AppResult[];
        setResults(data);
        if (data.length === 0) setError("No applications found for this email address.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Link href="/careers" className="text-white/40 hover:text-white text-sm mb-8 inline-flex items-center gap-1 transition-colors">
        ← Back to careers
      </Link>

      <div className="mt-8 mb-10">
        <h1 className="text-3xl font-extrabold text-white mb-2">Check Application Status</h1>
        <p className="text-white/50">Enter the email address you used to apply and we&apos;ll show you the status of your applications.</p>
      </div>

      <form onSubmit={handleCheck} className="flex gap-3 mb-8">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#E55B1F] text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#E55B1F] hover:bg-[#d04e15] disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
        >
          {loading ? "Checking..." : "Check Status"}
        </button>
      </form>

      {error && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <p className="text-white/50">{error}</p>
          <p className="text-white/30 text-sm mt-2">Make sure you entered the exact email used when applying.</p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-white/50 text-sm">{results.length} application{results.length !== 1 ? "s" : ""} found</p>
          {results.map((app) => {
            const statusInfo = STATUS_LABELS[app.status] ?? { label: app.status, color: "text-white/60", icon: "📋" };
            return (
              <div key={app.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{app.job.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-white/50">
                      {app.job.department && <span>{app.job.department}</span>}
                      {app.job.location && <span>📍 {app.job.location}</span>}
                    </div>
                    {app.stage && (
                      <p className="text-sm text-white/40 mt-2">Stage: {app.stage.name}</p>
                    )}
                    <p className="text-xs text-white/30 mt-1">
                      Applied {new Date(app.appliedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl mb-1">{statusInfo.icon}</div>
                    <p className={`text-sm font-semibold ${statusInfo.color}`}>{statusInfo.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
