"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const REMEMBER_EMAIL_KEY = "lobah_ats_email";

function LoginForm() {
  const params = useSearchParams();
  const registered = params.get("registered");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#E55B1F] focus:outline-none focus:ring-2 focus:ring-[#E55B1F]/20";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (rememberMe) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.ok) {
      window.location.href = "/dashboard";
    } else {
      setError(`Login failed: ${result?.error ?? "unknown error"}`);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-5">
              <Image
                src="/Lobah new logo.png"
                alt="Lobah"
                width={140}
                height={48}
                className="h-12 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Lobah ATS</h1>
            <p className="text-sm text-gray-500 mt-1">Lobah Games hiring portal</p>
          </div>

          {registered && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700 font-medium mb-4 text-center">
              Account created! Sign in below.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                className={inputClass}
                placeholder="you@lobah.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                className={inputClass}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#E55B1F] accent-[#E55B1F]"
              />
              <label htmlFor="remember-me" className="text-sm text-gray-600 cursor-pointer select-none">
                Remember my email
              </label>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#E55B1F] text-white font-semibold py-3 hover:bg-[#d04e15] transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            New team member?{" "}
            <Link href="/signup" className="text-[#E55B1F] font-medium hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
