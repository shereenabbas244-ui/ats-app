"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { BriefcaseIcon, LinkedinIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@ats.dev");
  const [name, setName] = useState("Admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      name,
      redirect: false,
    });
    if (result?.ok) {
      router.push("/dashboard");
    } else {
      setError("Login failed. Try again.");
      setLoading(false);
    }
  };

  const handleLinkedIn = () => signIn("linkedin", { callbackUrl: "/dashboard" });

  const inputClass =
    "w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E55B1F] mx-auto mb-4">
              <BriefcaseIcon className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Lobah ATS</h1>
            <p className="text-sm text-gray-500 mt-1">Lobah Games — Applicant Tracking System</p>
          </div>

          {/* Dev Login */}
          <form onSubmit={handleDevLogin} className="space-y-3 mb-4">
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 font-medium">
              ⚡ Dev mode — enter any email to log in instantly
            </div>
            <input
              type="email"
              required
              className={inputClass}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              className={inputClass}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 text-white font-semibold py-3 hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* LinkedIn divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            onClick={handleLinkedIn}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#0A66C2] text-white font-semibold py-3 hover:bg-[#004182] transition-colors shadow-sm"
          >
            <LinkedinIcon className="h-5 w-5" />
            Sign in with LinkedIn
          </button>
          <p className="text-xs text-center text-gray-400 mt-2">
            LinkedIn login requires OAuth credentials in .env
          </p>

          <div className="mt-6 space-y-2">
            <p className="text-xs text-center text-gray-400">Includes:</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                "AI Resume Parsing",
                "Candidate Scoring",
                "Kanban Pipeline",
                "LinkedIn Sync",
                "Interview Q&A",
                "Batch AI Ranking",
              ].map((f) => (
                <div key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="text-indigo-500">✓</span>{f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
