export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { JobsClient } from "./JobsClient";

async function getOpenJobs() {
  return prisma.job.findMany({
    where: { status: "OPEN" },
    select: {
      id: true,
      title: true,
      department: true,
      location: true,
      type: true,
      salaryMin: true,
      salaryMax: true,
      salaryCurrency: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function CareersPage() {
  const jobs = await getOpenJobs();

  const departments = Array.from(new Set(jobs.map((j) => j.department).filter(Boolean))) as string[];

  return (
    <div>
      {/* Hero */}
      <section className="relative py-28 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#E55B1F]/10 via-transparent to-transparent pointer-events-none" />
        <p className="text-[#E55B1F] text-sm font-semibold uppercase tracking-widest mb-4">
          We are Lobah Games
        </p>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
          FROM SAUDI ARABIA
          <br />
          TO THE WORLD
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto mb-10">
          Join our passionate team and help us create extraordinary gaming experiences that reach players everywhere.
        </p>
        <a
          href="#open-roles"
          className="inline-block bg-[#E55B1F] hover:bg-[#d04e15] text-white font-bold px-8 py-4 rounded-xl text-base transition-colors"
        >
          View Open Roles
        </a>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { value: `${jobs.length}+`, label: "Open Positions" },
          { value: departments.length > 0 ? `${departments.length}` : "5+", label: "Teams" },
          { value: "Riyadh", label: "Headquarters" },
          { value: "Global", label: "Reach" },
        ].map(({ value, label }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-extrabold text-[#E55B1F] mb-1">{value}</div>
            <div className="text-white/60 text-sm">{label}</div>
          </div>
        ))}
      </section>

      {/* Open Roles */}
      <section id="open-roles" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white mb-2">Open Roles</h2>
        <p className="text-white/50 mb-10">
          {jobs.length === 0 ? "No open positions right now — check back soon." : "Search and filter to find your next role."}
        </p>

        {jobs.length === 0 ? (
          <div className="text-center py-24 border border-white/10 rounded-2xl">
            <p className="text-white/40 text-lg">No open positions at the moment.</p>
            <p className="text-white/30 text-sm mt-2">Check back soon or send your CV to careers@lobah.com</p>
          </div>
        ) : (
          <JobsClient jobs={jobs.map(j => ({ ...j, createdAt: j.createdAt.toISOString() }))} />
        )}
      </section>

      {/* Why Lobah */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10">
        <h2 className="text-3xl font-bold text-white mb-10 text-center">Why Lobah Games?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "🎮",
              title: "Build World-Class Games",
              desc: "Work on titles that reach millions of players globally, crafted with passion from the heart of Saudi Arabia.",
            },
            {
              icon: "🚀",
              title: "Grow Fast",
              desc: "We move quickly and give team members real ownership. Your work ships and makes an impact.",
            },
            {
              icon: "🌍",
              title: "Mission-Driven",
              desc: "Be part of putting Saudi Arabia on the global gaming map. Our mission is bold, and we mean it.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
