import Link from "next/link";
import { prisma } from "@/lib/db";

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  REMOTE: "Remote",
};

export const revalidate = 60;

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
          {jobs.length === 0
            ? "No open positions right now — check back soon."
            : `${jobs.length} position${jobs.length > 1 ? "s" : ""} available`}
        </p>

        {jobs.length === 0 ? (
          <div className="text-center py-24 border border-white/10 rounded-2xl">
            <p className="text-white/40 text-lg">No open positions at the moment.</p>
            <p className="text-white/30 text-sm mt-2">Check back soon or send your CV to careers@lobah.com</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/careers/${job.id}`}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E55B1F]/50 rounded-2xl p-6 transition-all"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {job.department && (
                      <span className="text-xs font-medium text-[#E55B1F] bg-[#E55B1F]/10 px-2 py-0.5 rounded-full">
                        {job.department}
                      </span>
                    )}
                    <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                      {JOB_TYPE_LABELS[job.type] ?? job.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#E55B1F] transition-colors">
                    {job.title}
                  </h3>
                  {job.location && (
                    <p className="text-white/50 text-sm mt-0.5">{job.location}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {job.salaryMin && job.salaryMax && (
                    <span className="text-sm text-white/50">
                      {job.salaryCurrency ?? "USD"} {job.salaryMin.toLocaleString()} – {job.salaryMax.toLocaleString()}
                    </span>
                  )}
                  <span className="bg-[#E55B1F] group-hover:bg-[#d04e15] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors whitespace-nowrap">
                    Apply Now →
                  </span>
                </div>
              </Link>
            ))}
          </div>
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
