"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LinkedinIcon,
  UploadCloudIcon,
  BriefcaseIcon,
  UsersIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  InfoIcon,
} from "lucide-react";

export default function LinkedInPage() {
  const [jobId, setJobId] = useState("");
  const [linkedinJobId, setLinkedinJobId] = useState("");
  const [postJobId, setPostJobId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const importCandidates = async () => {
    if (!jobId || !linkedinJobId) return;
    setLoading("import");
    setResult(null);
    try {
      const res = await fetch("/api/linkedin/import-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, linkedinJobId }),
      });
      const data = await res.json() as { imported?: number; total?: number; error?: string };
      if (res.ok) {
        setResult({ success: true, message: `Imported ${data.imported} of ${data.total} candidates` });
      } else {
        setResult({ success: false, error: data.error });
      }
    } finally {
      setLoading(null);
    }
  };

  const postJob = async () => {
    if (!postJobId || !companyId) return;
    setLoading("post");
    setResult(null);
    try {
      const res = await fetch("/api/linkedin/post-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: postJobId, companyId }),
      });
      const data = await res.json() as { postUrl?: string; error?: string };
      if (res.ok) {
        setResult({ success: true, message: `Job posted! View at: ${data.postUrl}` });
      } else {
        setResult({ success: false, error: data.error });
      }
    } finally {
      setLoading(null);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-white/15 px-3 py-2 text-sm text-white placeholder-white/20 bg-white/[0.04] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">LinkedIn Integration</h1>
        <p className="text-sm text-white/50 mt-1">Sync jobs and candidates with LinkedIn</p>
      </div>

      {/* Partnership Notice */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 flex gap-3">
        <InfoIcon className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-blue-900">LinkedIn Talent Solutions Required</p>
          <p className="text-blue-700 mt-1">
            Full job posting and candidate import requires LinkedIn&apos;s Talent Solutions partnership.
            <a
              href="https://business.linkedin.com/talent-solutions/ats-partners"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline font-medium"
            >
              Apply here →
            </a>
          </p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <Badge variant="success">OAuth Login ✓</Badge>
            <Badge variant="success">Profile Import ✓</Badge>
            <Badge variant="warning">Job Posting (Partner)</Badge>
            <Badge variant="warning">Apply Tracking (Partner)</Badge>
          </div>
        </div>
      </div>

      {/* Post Job to LinkedIn */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="h-5 w-5 text-blue-400" />
            <CardTitle>Post Job to LinkedIn</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-white/50">
            Publish a job from your ATS directly to LinkedIn Jobs.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Job ID (from your ATS)</label>
              <input
                className={inputClass}
                placeholder="e.g. clxyz123..."
                value={postJobId}
                onChange={(e) => setPostJobId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">LinkedIn Company ID</label>
              <input
                className={inputClass}
                placeholder="e.g. 12345678"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={postJob}
            loading={loading === "post"}
            disabled={!postJobId || !companyId}
          >
            <LinkedinIcon className="h-4 w-4" />
            Post to LinkedIn
          </Button>
        </CardContent>
      </Card>

      {/* Import Candidates */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-blue-400" />
            <CardTitle>Import LinkedIn Applicants</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-white/50">
            Import all candidates who applied via LinkedIn Easy Apply into your pipeline.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">ATS Job ID</label>
              <input
                className={inputClass}
                placeholder="e.g. clxyz123..."
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">LinkedIn Job ID</label>
              <input
                className={inputClass}
                placeholder="e.g. 3987654321"
                value={linkedinJobId}
                onChange={(e) => setLinkedinJobId(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={importCandidates}
            loading={loading === "import"}
            disabled={!jobId || !linkedinJobId}
          >
            <UploadCloudIcon className="h-4 w-4" />
            Import Candidates
          </Button>
        </CardContent>
      </Card>

      {/* Webhook Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Easy Apply Webhook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-white/50">
            Configure this webhook URL in your LinkedIn app to automatically receive new Easy Apply
            submissions in real-time.
          </p>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] px-4 py-3 font-mono text-sm text-white/80">
            {typeof window !== "undefined" ? window.location.origin : "https://yourapp.com"}
            /api/linkedin/webhook
          </div>
          <p className="text-xs text-white/40">
            Add this URL in LinkedIn Developer Portal → Your App → Webhooks
          </p>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <div
          className={`flex items-start gap-3 rounded-xl p-4 ${
            result.success ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
          }`}
        >
          {result.success ? (
            <CheckCircleIcon className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircleIcon className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${result.success ? "text-green-800" : "text-red-800"}`}>
            {result.success ? result.message : result.error}
          </p>
        </div>
      )}
    </div>
  );
}
