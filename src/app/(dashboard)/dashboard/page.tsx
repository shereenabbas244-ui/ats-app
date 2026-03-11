import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BriefcaseIcon, UsersIcon, TrendingUpIcon, CheckCircleIcon } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();

  const [totalJobs, openJobs, totalCandidates, recentApplications, hiredCount] =
    await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: "OPEN" } }),
      prisma.candidate.count(),
      prisma.application.findMany({
        take: 10,
        orderBy: { appliedAt: "desc" },
        include: {
          candidate: { select: { firstName: true, lastName: true, avatarUrl: true } },
          job: { select: { title: true } },
          stage: { select: { name: true, color: true } },
        },
      }),
      prisma.application.count({ where: { status: "HIRED" } }),
    ]);

  const stats = [
    { label: "Open Jobs", value: openJobs, total: totalJobs, icon: BriefcaseIcon, color: "text-indigo-600 bg-indigo-50" },
    { label: "Total Candidates", value: totalCandidates, icon: UsersIcon, color: "text-blue-600 bg-blue-50" },
    { label: "Active Applications", value: recentApplications.length, icon: TrendingUpIcon, color: "text-purple-600 bg-purple-50" },
    { label: "Hired This Year", value: hiredCount, icon: CheckCircleIcon, color: "text-green-600 bg-green-50" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "Recruiter"} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s what&apos;s happening with your hiring pipeline.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  {"total" in stat && (
                    <p className="text-xs text-gray-400 mt-0.5">{stat.total} total</p>
                  )}
                </div>
                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <div className="divide-y divide-gray-50">
          {recentApplications.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-gray-400">
              No applications yet. Post a job to get started!
            </div>
          ) : (
            recentApplications.map((app) => (
              <div key={app.id} className="flex items-center gap-4 px-6 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold shrink-0">
                  {app.candidate.firstName[0]}{app.candidate.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {app.candidate.firstName} {app.candidate.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{app.job.title}</p>
                </div>
                {app.stage && (
                  <Badge
                    className="shrink-0"
                    style={{ backgroundColor: `${app.stage.color}20`, color: app.stage.color }}
                  >
                    {app.stage.name}
                  </Badge>
                )}
                {app.aiScore !== null && (
                  <span className="text-xs font-medium text-gray-500 shrink-0">
                    AI: {app.aiScore}
                  </span>
                )}
                <span className="text-xs text-gray-400 shrink-0">
                  {formatRelativeTime(app.appliedAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
