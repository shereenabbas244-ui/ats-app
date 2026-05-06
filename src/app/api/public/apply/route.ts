import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendApplicationConfirmation, sendNewApplicationAlert } from "@/lib/email";

const applySchema = z.object({
  jobId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  currentTitle: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  coverLetter: z.string().optional(),
  resumeText: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json() as unknown;
  const data = applySchema.parse(body);

  const job = await prisma.job.findUnique({
    where: { id: data.jobId, status: "OPEN" },
    include: { stages: { orderBy: { order: "asc" }, take: 1 } },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found or no longer accepting applications" }, { status: 404 });
  }

  const candidate = await prisma.candidate.upsert({
    where: { email: data.email },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      location: data.location,
      currentTitle: data.currentTitle,
      linkedinUrl: data.linkedinUrl || undefined,
      ...(data.resumeText && { resumeText: data.resumeText }),
    },
    create: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      location: data.location,
      currentTitle: data.currentTitle,
      linkedinUrl: data.linkedinUrl || undefined,
      resumeText: data.resumeText,
      source: "JOB_BOARD",
    },
  });

  const existing = await prisma.application.findUnique({
    where: { candidateId_jobId: { candidateId: candidate.id, jobId: data.jobId } },
  });

  if (existing) {
    return NextResponse.json({ error: "You have already applied for this position" }, { status: 409 });
  }

  const application = await prisma.application.create({
    data: {
      candidateId: candidate.id,
      jobId: data.jobId,
      stageId: job.stages[0]?.id,
      source: "JOB_BOARD",
      coverLetter: data.coverLetter,
      activities: {
        create: { type: "APPLIED", description: "Applied via career page" },
      },
    },
  });

  // Send emails (non-blocking)
  const candidateName = `${data.firstName} ${data.lastName}`;
  void sendApplicationConfirmation({ candidateName, candidateEmail: data.email, jobTitle: job.title });
  void sendNewApplicationAlert({ candidateName, candidateEmail: data.email, jobTitle: job.title, applicationId: application.id });

  return NextResponse.json({ success: true, applicationId: application.id }, { status: 201 });
}
