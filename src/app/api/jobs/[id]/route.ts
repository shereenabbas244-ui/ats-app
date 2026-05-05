import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      stages: { orderBy: { order: "asc" } },
      createdBy: { select: { name: true, image: true } },
      _count: { select: { applications: true } },
    },
  });

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;

  const { title, department, location, type, status, description, requirements, salaryMin, salaryMax, salaryCurrency } = body;

  const job = await prisma.job.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title as string }),
      ...(department !== undefined && { department: department as string }),
      ...(location !== undefined && { location: location as string }),
      ...(type !== undefined && { type: type as string }),
      ...(status !== undefined && { status: status as string }),
      ...(description !== undefined && { description: description as string }),
      ...(requirements !== undefined && { requirements: requirements as string }),
      ...(salaryMin !== undefined && { salaryMin: salaryMin ? Number(salaryMin) : null }),
      ...(salaryMax !== undefined && { salaryMax: salaryMax ? Number(salaryMax) : null }),
      ...(salaryCurrency !== undefined && { salaryCurrency: salaryCurrency as string }),
    },
  });

  return NextResponse.json(job);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
