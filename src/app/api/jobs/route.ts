import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createJobSchema = z.object({
  title: z.string().min(1),
  department: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"]).default("FULL_TIME"),
  description: z.string().min(1),
  requirements: z.string().min(1),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().optional(),
  stages: z.array(z.object({ name: z.string(), color: z.string().optional() })).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const jobs = await prisma.job.findMany({
    where: {
      ...(status ? { status: status as "DRAFT" | "OPEN" | "PAUSED" | "CLOSED" } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { department: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { applications: true } },
      createdBy: { select: { name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as unknown;
  const data = createJobSchema.parse(body);

  const defaultStages = data.stages ?? [
    { name: "Applied", color: "#6366f1" },
    { name: "Screening", color: "#8b5cf6" },
    { name: "Interview", color: "#3b82f6" },
    { name: "Technical", color: "#06b6d4" },
    { name: "Offer", color: "#10b981" },
    { name: "Hired", color: "#22c55e" },
  ];

  const job = await prisma.job.create({
    data: {
      title: data.title,
      department: data.department,
      location: data.location,
      type: data.type,
      description: data.description,
      requirements: data.requirements,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      salaryCurrency: data.salaryCurrency ?? "USD",
      createdById: session.user.id,
      stages: {
        create: defaultStages.map((s, i) => ({
          name: s.name,
          order: i,
          color: s.color ?? "#6366f1",
        })),
      },
    },
    include: { stages: true },
  });

  return NextResponse.json(job, { status: 201 });
}
