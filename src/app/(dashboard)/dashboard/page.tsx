import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  BriefcaseIcon,
  UsersIcon,
  CalendarIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  ClockIcon,
  FileTextIcon,
  ArrowRightIcon,
  SparklesIcon,
  StarIcon,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

const PIPELINE_STAGES = [
  { status: "ACTIVE",    label: "Applied",   bar: "bg-indigo-500",  badge: "bg-indigo-500/20 text-indigo-500 dark:text-indigo-300" },
  { status: "SCREENING", label: "Screening", bar: "bg-amber-500",   badge: "bg-amber-500/20 text-amber-600 dark:text-amber-300" },
  { status: "INTERVIEW", label: "Interview", bar: "bg-purple-500",  badge: "bg-purple-500/20 text-purple-600 dark:text-purple-300" },
  { status: "OFFER",     label: "Offer",     bar: "bg-emerald-500", badge: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300" },
  { status: "HIRED",     label: "Hired",     bar: "bg-green-500",   badge: "bg-green-500/20 text-green-600 dark:text-green-300" },
  { status: "REJECTED",  label: "Rejected",  bar: "bg-red-500",     badge: "bg-red-500/20 text-red-600 dark:text-red-300" },
];

function Stars({ score }: { score: number }) {
  const stars = Math.round((score / 100) * 5);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`h-4 w-4 ${i < stars ? "text-amber-400 fill-amber-400" : "text-theme-text20"}`}
        />
      ))}
    </div>
  );
}

function ActivityIcon({ status }: { status: string }) {
  if (status === "HIRED") return <CheckCircleIcon className="h-4 w-4 text-green-400" />;
  if (status === "REJECTED") return <ArrowRightIcon className="h-4 w-4 text-red-400" />;
  return <FileTextIcon className="h-4 w-4 text-indigo-400" />;
}

function activityLabel(app: {
  status: string;
  candidate: { firstName: string; lastName: string };
  job: { title: string };
  stage: { name: string } | null;
}) {
  const name = `${app.candidate.firstName} ${app.candidate.lastName}`;
  if (app.status === "HIRED") return `${name} was hired as ${app.job.title}`;
  if (app.status === "REJECTED") return `${name} was rejected from ${app.job.title}`;
  if (app.stage && app.stage.name !== "Applied") return `${name} moved to ${app.stage.name} stage`;
  return `${name} applied for ${app.job.title}`;
}

export default async function DashboardPage() {
  const session = await auth();

  const [openJobs, totalCandidates, hiredCount, statusCounts, recentActivity, topCandidates, interviewCount] =
    await Promise.all([
      prisma.job.count({ where: { status: "OPEN" } }),
      prisma.candidate.count(),
      prisma.application.count({ where: { status: "HIRED" } }),
      prisma.application.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.application.findMany({
        take: 6,
        orderBy: { appliedAt: "desc" },
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          job: { select: { title: true } },
          stage: { select: { name: true } },
        },
      }),
      prisma.application.findMany({
        where: { aiScore: { not: null } },
        orderBy: { aiScore: "desc" },
        take: 6,
        distinct: ["candidateId"],
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          job: { select: { title: true } },
        },
      }),
      prisma.application.count({
        where: { stage: { name: { contains: "Interview" } } },
      }),
    ]);

  const countByStatus = Object.fromEntries(statusCounts.map((s) => [s.status, s._count.id]));
  const maxCount = Math.max(...Object.values(countByStatus), 1);

  const stats = [
    {
      label: "Open Positions",
      value: openJobs,
      sub: openJobs === 0 ? "No open positions" : `${openJobs} active ${openJobs === 1 ? "job" : "jobs"}`,
      icon: BriefcaseIcon,
      accent: "from-indigo-600/20 to-indigo-600/5 border-indigo-500/20",
      iconColor: "text-indigo-400",
    },
    {
      label: "Total Candidates",
      value: totalCandidates,
      sub: totalCandidates === 0 ? "No candidates yet" : `${totalCandidates} in talent pool`,
      icon: UsersIcon,
      accent: "from-blue-600/20 to-blue-600/5 border-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      label: "Interviews",
      value: interviewCount,
      sub: interviewCount === 0 ? "None scheduled" : `${interviewCount} in interview stage`,
      icon: CalendarIcon,
      accent: "from-amber-600/20 to-amber-600/5 border-amber-500/20",
      iconColor: "text-amber-400",
    },
    {
      label: "Hired",
      value: hiredCount,
      sub: hiredCount === 0 ? "No hires yet" : `${hiredCount} ${hiredCount === 1 ? "person" : "people"} hired`,
      icon: CheckCircleIcon,
      accent: "from-emerald-600/20 to-emerald-600/5 border-emerald-500/20",
      iconColor: "text-emerald-400",
    },
  ];

  return (
    <div className="min-h-screen bg-theme-bg">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1a1040] via-[#13103a] to-[#0d0d2b] border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="relative px-8 py-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome back! 👋
          </h1>
          <p className="text-white/50 text-sm">Here&apos;s what&apos;s happening with your hiring pipeline today.</p>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-xl border bg-gradient-to-br ${stat.accent} p-5`}
            >
              <div className="flex items-start justify-between mb-3">
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                <span className="text-xs text-theme-text40">{stat.sub}</span>
              </div>
              <p className="text-4xl font-bold text-theme-text mb-1">{stat.value}</p>
              <p className="text-sm text-theme-text50">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Pipeline + Activity */}
        <div className="grid grid-cols-3 gap-6">
          {/* Pipeline Overview */}
          <div className="col-span-2 rounded-xl border border-theme-border bg-theme-surface p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUpIcon className="h-4 w-4 text-theme-text40" />
              <h2 className="font-semibold text-theme-text">Pipeline Overview</h2>
            </div>
            <div className="space-y-4">
              {PIPELINE_STAGES.map(({ status, label, bar, badge }) => {
                const count = countByStatus[status] ?? 0;
                const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge}`}>
                        {label}
                      </span>
                      <span className="text-theme-text40 text-xs">
                        {count} {count === 1 ? "candidate" : "candidates"}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-theme-subtle overflow-hidden">
                      <div
                        className={`h-full rounded-full ${bar} transition-all`}
                        style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-theme-border bg-theme-surface p-6">
            <div className="flex items-center gap-2 mb-6">
              <ClockIcon className="h-4 w-4 text-theme-text40" />
              <h2 className="font-semibold text-theme-text">Recent Activity</h2>
            </div>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-theme-text30 text-center py-4">No activity yet.</p>
              ) : (
                recentActivity.map((app) => (
                  <div key={app.id} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-theme-hover mt-0.5">
                      <ActivityIcon status={app.status} />
                    </div>
                    <div>
                      <p className="text-sm text-theme-text80 leading-snug">{activityLabel(app)}</p>
                      <p className="text-xs text-theme-text30 mt-0.5">{formatRelativeTime(app.appliedAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Rated Candidates */}
        {topCandidates.length > 0 && (
          <div className="rounded-xl border border-theme-border bg-theme-surface p-6">
            <div className="flex items-center gap-2 mb-6">
              <SparklesIcon className="h-4 w-4 text-amber-400" />
              <h2 className="font-semibold text-theme-text">Top Rated Candidates</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {topCandidates.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center gap-3 rounded-lg border border-theme-border bg-theme-faint px-4 py-3 hover:bg-theme-subtle transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-theme-text text-sm font-bold">
                    {app.candidate.firstName[0]}{app.candidate.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-theme-text truncate">
                      {app.candidate.firstName} {app.candidate.lastName}
                    </p>
                    <p className="text-xs text-theme-text40 truncate">{app.job.title}</p>
                    <Stars score={app.aiScore!} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {topCandidates.length === 0 && (
          <div className="rounded-xl border border-theme-border bg-theme-surface p-8 text-center">
            <SparklesIcon className="h-8 w-8 text-theme-text20 mx-auto mb-3" />
            <p className="text-sm text-theme-text40">
              Top rated candidates will appear here once AI scores applications.
            </p>
            <Link href="/candidates" className="text-indigo-400 text-sm hover:text-indigo-300 mt-2 inline-block">
              View all candidates →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
