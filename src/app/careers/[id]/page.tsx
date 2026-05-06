"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LinkIcon, FileTextIcon, XIcon } from "lucide-react";

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  REMOTE: "Remote",
};

interface Job {
  id: string; title: string; department: string | null; location: string | null;
  type: string; description: string; requirements: string;
  salaryMin: number | null; salaryMax: number | null; salaryCurrency: string | null;
  createdAt: string;
}

type FormState = "idle" | "reading" | "submitting" | "success" | "error";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    location: "", currentTitle: "", linkedinUrl: "", coverLetter: "",
  });

  useEffect(() => {
    fetch(`/api/public/jobs`)
      .then((r) => r.json())
      .then((jobs: Job[]) => {
        const found = jobs.find((j) => j.id === id);
        if (!found) router.replace("/careers");
        else setJob(found);
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File must be under 5MB.");
      setFormState("error");
      return;
    }
    setFormState("reading");
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1] ?? "";
      setResumeFile(file);
      setResumeData(base64);
      setFormState("idle");
      setErrorMsg("");
    };
    reader.onerror = () => { setErrorMsg("Could not read file."); setFormState("error"); };
    reader.readAsDataURL(file);
  }, []);

  function handleShowForm() {
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/public/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: id, ...form,
          ...(resumeData && resumeFile ? { resumeData, resumeFilename: resumeFile.name } : {}),
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setErrorMsg(data.error ?? "Something went wrong."); setFormState("error"); }
      else setFormState("success");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setFormState("error");
    }
  }

  function handleCopy() {
    void navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-[#E55B1F] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!job) return null;

  const jobUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Check out this job at Lobah Games: ${job.title}`;
  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#E55B1F] transition-colors";

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link href="/careers" className="text-white/40 hover:text-white text-sm mb-8 inline-flex items-center gap-1 transition-colors">
        ← Back to all roles
      </Link>

      {/* Job Header */}
      <div className="mt-6 mb-10">
        <div className="flex flex-wrap gap-2 mb-3">
          {job.department && <span className="text-xs font-medium text-[#E55B1F] bg-[#E55B1F]/10 px-2 py-0.5 rounded-full">{job.department}</span>}
          <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{JOB_TYPE_LABELS[job.type] ?? job.type}</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-2">{job.title}</h1>
        <div className="flex flex-wrap gap-4 text-white/50 text-sm mt-3">
          {job.location && <span>📍 {job.location}</span>}
          {job.salaryMin && job.salaryMax && <span>💰 {job.salaryCurrency ?? "USD"} {job.salaryMin.toLocaleString()} – {job.salaryMax.toLocaleString()}</span>}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        {/* Job Details */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-bold text-white mb-3 border-b border-white/10 pb-2">About the Role</h2>
            <p className="text-white/70 leading-relaxed whitespace-pre-line">{job.description}</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-3 border-b border-white/10 pb-2">Requirements</h2>
            <p className="text-white/70 leading-relaxed whitespace-pre-line">{job.requirements}</p>
          </section>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="sticky top-24 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-base mb-1">Interested?</h3>
            <p className="text-white/50 text-sm mb-5">Apply now and join the Lobah Games team.</p>
            <button onClick={handleShowForm}
              className="w-full bg-[#E55B1F] hover:bg-[#d04e15] text-white font-bold py-3 rounded-xl transition-colors">
              Apply for this role
            </button>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-sm mb-3">Share this role</h3>
            <div className="flex flex-col gap-2">
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
                <span className="font-bold text-[#0A66C2]">in</span> Share on LinkedIn
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(jobUrl)}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
                <span className="font-bold text-white">𝕏</span> Share on X
              </a>
              <a href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + jobUrl)}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
                <span className="text-[#25D366]">●</span> Share on WhatsApp
              </a>
              <button onClick={handleCopy}
                className="flex items-center gap-2 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors text-left">
                <LinkIcon className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inline application form — no modal, no overflow container, file picker always works */}
      {showForm && (
        <div ref={formRef} className="mt-16 border-t border-white/10 pt-12">
          {formState === "success" ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-3">Application Submitted!</h2>
              <p className="text-white/60 mb-2">Thanks for applying to <strong>{job.title}</strong>.</p>
              <p className="text-white/40 text-sm">Check your email for a confirmation. We'll be in touch soon.</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-8">Apply for {job.title}</h2>
              <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">First Name *</label>
                    <input name="firstName" required value={form.firstName} onChange={handleChange} className={inputClass} placeholder="Jane" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Last Name *</label>
                    <input name="lastName" required value={form.lastName} onChange={handleChange} className={inputClass} placeholder="Doe" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-1">Email *</label>
                  <input name="email" type="email" required value={form.email} onChange={handleChange} className={inputClass} placeholder="jane@example.com" />
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-1">Phone</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} className={inputClass} placeholder="+966 5x xxx xxxx" />
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-1">Current Title</label>
                  <input name="currentTitle" value={form.currentTitle} onChange={handleChange} className={inputClass} placeholder="Senior Engineer" />
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-1">Location</label>
                  <input name="location" value={form.location} onChange={handleChange} className={inputClass} placeholder="Riyadh, Saudi Arabia" />
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-1">LinkedIn URL</label>
                  <input name="linkedinUrl" type="url" value={form.linkedinUrl} onChange={handleChange} className={inputClass} placeholder="https://linkedin.com/in/janedoe" />
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-1">Cover Letter</label>
                  <textarea name="coverLetter" value={form.coverLetter} onChange={handleChange} rows={4}
                    className={`${inputClass} resize-none`} placeholder="Tell us why you'd be a great fit..." />
                </div>

                {/* Resume — plain file input, no modal wrapping */}
                <div>
                  <label className="block text-xs text-white/50 mb-2">Resume / CV</label>
                  {resumeFile && resumeData ? (
                    <div className="flex items-center gap-3 bg-white/5 border border-[#E55B1F]/40 rounded-lg px-4 py-3">
                      <FileTextIcon className="h-5 w-5 text-[#E55B1F] shrink-0" />
                      <span className="text-sm text-white flex-1 truncate">{resumeFile.name}</span>
                      <button type="button" onClick={() => { setResumeFile(null); setResumeData(""); }}
                        className="text-white/40 hover:text-white transition-colors">
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-white/60
                        file:mr-4 file:py-2 file:px-5
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-[#E55B1F] file:text-white
                        hover:file:bg-[#d04e15] file:cursor-pointer
                        cursor-pointer"
                    />
                  )}
                  <p className="text-xs text-white/30 mt-1">PDF or Word, max 5MB</p>
                </div>

                {formState === "error" && (
                  <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{errorMsg}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={formState === "submitting" || formState === "reading"}
                    className="bg-[#E55B1F] hover:bg-[#d04e15] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl transition-colors">
                    {formState === "submitting" ? "Submitting..." : formState === "reading" ? "Reading file..." : "Submit Application"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="text-white/40 hover:text-white px-6 py-3 rounded-xl transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
