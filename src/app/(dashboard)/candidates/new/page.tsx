"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeftIcon, PlusIcon, XIcon } from "lucide-react";

const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

export default function NewCandidatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    location: "", currentTitle: "", currentCompany: "",
    linkedinUrl: "", summary: "", skills: [] as string[],
    source: "MANUAL",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function addSkill() {
    const skill = skillInput.trim();
    if (skill && !form.skills.includes(skill)) {
      setForm(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json() as { id?: string; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Failed to create candidate.");
      setLoading(false);
    } else {
      router.push(`/candidates/${data.id}`);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/candidates" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Candidate</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Candidate Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
                <input name="firstName" required value={form.firstName} onChange={handleChange} className={inputClass} placeholder="Jane" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label>
                <input name="lastName" required value={form.lastName} onChange={handleChange} className={inputClass} placeholder="Doe" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange} className={inputClass} placeholder="jane@example.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} className={inputClass} placeholder="+1 555 000 0000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                <input name="location" value={form.location} onChange={handleChange} className={inputClass} placeholder="Riyadh, Saudi Arabia" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Current Title</label>
                <input name="currentTitle" value={form.currentTitle} onChange={handleChange} className={inputClass} placeholder="Software Engineer" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Current Company</label>
                <input name="currentCompany" value={form.currentCompany} onChange={handleChange} className={inputClass} placeholder="Acme Corp" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input name="linkedinUrl" type="url" value={form.linkedinUrl} onChange={handleChange} className={inputClass} placeholder="https://linkedin.com/in/janedoe" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Source</label>
              <select name="source" value={form.source} onChange={handleChange} className={inputClass}>
                <option value="MANUAL">Manual</option>
                <option value="REFERRAL">Referral</option>
                <option value="JOB_BOARD">Job Board</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="RESUME_UPLOAD">Resume Upload</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                  className={inputClass}
                  placeholder="Add a skill and press Enter"
                />
                <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.skills.map(skill => (
                    <span key={skill} className="flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-0.5 text-xs font-medium">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)}>
                        <XIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Summary</label>
              <textarea name="summary" value={form.summary} onChange={handleChange} rows={3} className={inputClass} placeholder="Brief professional summary..." />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading}>Create Candidate</Button>
              <Link href="/candidates"><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
