import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createCandidateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  location: z.string().optional(),
  currentTitle: z.string().optional(),
  currentCompany: z.string().optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()).optional().default([]),
  resumeText: z.string().optional(),
  source: z.enum(["MANUAL", "LINKEDIN", "LINKEDIN_EASY_APPLY", "RESUME_UPLOAD", "REFERRAL", "JOB_BOARD"]).optional().default("MANUAL"),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const skill = searchParams.get("skill");

  const candidates = await prisma.candidate.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { currentTitle: { contains: search, mode: "insensitive" } },
              { currentCompany: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(skill ? { skills: { has: skill } } : {}),
    },
    include: {
      _count: { select: { applications: true } },
      applications: {
        include: { job: { select: { title: true } }, stage: true },
        take: 3,
        orderBy: { appliedAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(candidates);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as unknown;
  const data = createCandidateSchema.parse(body);

  // Upsert by email
  const candidate = await prisma.candidate.upsert({
    where: { email: data.email },
    create: data,
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      linkedinUrl: data.linkedinUrl,
      location: data.location,
      currentTitle: data.currentTitle,
      currentCompany: data.currentCompany,
      summary: data.summary,
      skills: data.skills,
      ...(data.resumeText ? { resumeText: data.resumeText } : {}),
    },
  });

  return NextResponse.json(candidate, { status: 201 });
}
