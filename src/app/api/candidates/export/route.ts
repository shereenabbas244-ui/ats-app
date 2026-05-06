import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidates = await prisma.candidate.findMany({
    include: {
      applications: {
        include: { job: { select: { title: true } }, stage: { select: { name: true } } },
        orderBy: { appliedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "First Name", "Last Name", "Email", "Phone", "Location",
    "Current Title", "Current Company", "Source", "Skills",
    "Latest Job Applied", "Latest Stage", "Latest Status", "Applied At",
  ];

  const rows = candidates.map((c) => {
    const app = c.applications[0];
    return [
      c.firstName,
      c.lastName,
      c.email ?? "",
      c.phone ?? "",
      c.location ?? "",
      c.currentTitle ?? "",
      c.currentCompany ?? "",
      c.source,
      c.skills.join("; "),
      app?.job.title ?? "",
      app?.stage?.name ?? "",
      app?.status ?? "",
      app?.appliedAt ? new Date(app.appliedAt).toISOString().split("T")[0] : "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });

  const csv = [header.map((h) => `"${h}"`).join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="candidates-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
