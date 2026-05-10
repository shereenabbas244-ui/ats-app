"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

const inputClass = "w-full rounded-lg border border-white/15 px-3 py-2 text-sm text-white placeholder-white/20 bg-white/[0.04] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

interface Job {
  id: string; title: string; department: string; location: string;
  type: string; status: string; description: string; requirements: string;
  salaryMin: number | null; salaryMax: number | null; salaryCurrency: string;
}

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Job | null>(null);

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then(r => r.json())
      .then((data: Job) => { setForm(data); setFetching(false); });
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => prev ? { ...prev, [e.target.name]: e.target.value } : prev);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Failed to update job.");
      setLoading(false);
    } else {
      router.push(`/jobs/${id}`);
    }
  }

  if (fetching) return <div className="p-8 text-white/40">Loading...</div>;
  if (!form) return null;

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/jobs/${id}`} className="text-white/40 hover:text-white/60 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Edit Job</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Job Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">Job Title *</label>
              <input name="title" required value={form.title} onChange={handleChange} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">Department</label>
                <input name="department" value={form.department ?? ""} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">Location</label>
                <input name="location" value={form.location ?? ""} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">Type</label>
                <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                  <option value="DRAFT">Draft</option>
                  <option value="OPEN">Open</option>
                  <option value="PAUSED">Paused</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">Min Salary</label>
                <input name="salaryMin" type="number" value={form.salaryMin ?? ""} onChange={handleChange} className={inputClass} placeholder="50000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">Max Salary</label>
                <input name="salaryMax" type="number" value={form.salaryMax ?? ""} onChange={handleChange} className={inputClass} placeholder="80000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">Currency</label>
                <input name="salaryCurrency" value={form.salaryCurrency ?? "USD"} onChange={handleChange} className={inputClass} placeholder="USD" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">Description *</label>
              <textarea name="description" required value={form.description} onChange={handleChange} rows={6} className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">Requirements *</label>
              <textarea name="requirements" required value={form.requirements} onChange={handleChange} rows={4} className={inputClass} />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading}>Save Changes</Button>
              <Link href={`/jobs/${id}`}><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
