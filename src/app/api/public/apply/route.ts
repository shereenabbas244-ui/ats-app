import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendApplicationConfirmation, sendNewApplicationAlert } from "@/lib/email";

const applySchema = z.object({
  jobId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  location: z.string().min(1),
  currentTitle: z.string().min(1),
  linkedinUrl: z.string().url(),
  resumeData: z.string().optional(),
  resumeFilename: z.string().optional(),
  resumeText: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json() as unknown;

  let data: z.infer<typeof applySchema>;
  try {
    data = applySchema.parse(body);
  } catch (err) {
    return NextResponse.json({ error: "Please fill in all required fields correctly." }, { status: 400 });
  }

  const job = await prisma.job.findUnique({
    where: { id: data.jobId, status: "OPEN" },
    include: { stages: { orderBy: { order: "asc" }, take: 1 } },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found or no longer accepting applications" }, { status: 404 });
  }

  const resumeText = data.resumeData && data.resumeFilename
    ? `RESUME_FILE:${data.resumeFilename}:${data.resumeData}`
    : data.resumeText
    ? `RESUME_TEXT:${data.resumeText}`
    : undefined;

  const candidate = await prisma.candidate.upsert({
    where: { email: data.email },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      location: data.location,
      currentTitle: data.currentTitle,
      linkedinUrl: data.linkedinUrl,
      ...(resumeText && { resumeText }),
    },
    create: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      location: data.location,
      currentTitle: data.currentTitle,
      linkedinUrl: data.linkedinUrl,
      resumeText,
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
      activities: {
        create: { type: "APPLIED", description: "Applied via career page" },
      },
    },
  });

  const candidateName = `${data.firstName} ${data.lastName}`;

  // Await emails before responding — Vercel kills the function after response.
  // Wrap in try/catch so a send failure doesn't break the application submission.
  try {
    await Promise.all([
      sendApplicationConfirmation({ candidateName, candidateEmail: data.email, jobTitle: job.title }),
      sendNewApplicationAlert({ candidateName, candidateEmail: data.email, jobTitle: job.title, applicationId: application.id }),
    ]);
  } catch (err) {
    console.error("[apply] Email send failed:", err);
  }

  return NextResponse.json({ success: true, applicationId: application.id }, { status: 201 });
}
