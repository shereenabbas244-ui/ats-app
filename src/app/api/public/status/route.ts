import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const candidate = await prisma.candidate.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const applications = await prisma.application.findMany({
    where: { candidateId: candidate.id },
    select: {
      id: true,
      status: true,
      appliedAt: true,
      stage: { select: { name: true } },
      job: { select: { title: true, department: true, location: true } },
    },
    orderBy: { appliedAt: "desc" },
  });

  if (applications.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(applications);
}
