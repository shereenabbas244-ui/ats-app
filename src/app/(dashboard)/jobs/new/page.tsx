"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SparklesIcon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "",
    type: "FULL_TIME",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
  });

  const handleEnhance = async () => {
    if (!form.title || !form.description) return;
    setEnhancing(true);
    try {
      const res = await fetch("/api/ai/enhance-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, rawDescription: form.description + "\n" + form.requirements }),
      });
      if (res.ok) {
        const data = await res.json() as { description: string; requirements: string };
        setForm((f) => ({ ...f, description: data.description, requirements: data.requirements }));
      }
    } finally {
      setEnhancing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salaryMin: form.salaryMin ? parseInt(form.salaryMin) : undefined,
          salaryMax: form.salaryMax ? parseInt(form.salaryMax) : undefined,
        }),
      });
      if (res.ok) {
        const job = await res.json() as { id: string };
        router.push(`/jobs/${job.id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/jobs" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post New Job</h1>
          <p className="text-sm text-gray-500 mt-1">Use AI to enhance your job description</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input
                required
                className={inputClass}
                placeholder="e.g. Senior Software Engineer"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Engineering"
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  className={inputClass}
                  placeholder="e.g. San Francisco, CA or Remote"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select
                  className={inputClass}
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary ($)</label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="80000"
                  value={form.salaryMin}
                  onChange={(e) => setForm((f) => ({ ...f, salaryMin: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary ($)</label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="120000"
                  value={form.salaryMax}
                  onChange={(e) => setForm((f) => ({ ...f, salaryMax: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Description & Requirements</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEnhance}
                loading={enhancing}
                disabled={!form.title || !form.description}
              >
                <SparklesIcon className="h-4 w-4 text-indigo-500" />
                Enhance with AI
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description *
              </label>
              <textarea
                required
                rows={8}
                className={inputClass}
                placeholder="Describe the role, responsibilities, team, and culture..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements *</label>
              <textarea
                required
                rows={6}
                className={inputClass}
                placeholder="List required skills, experience, education..."
                value={form.requirements}
                onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href="/jobs">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" loading={loading}>
            Create Job
          </Button>
        </div>
      </form>
    </div>
  );
}
