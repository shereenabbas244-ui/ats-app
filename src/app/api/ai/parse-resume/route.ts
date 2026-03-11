import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { parseResume } from "@/lib/claude";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("resume") as File | null;
  const resumeText = formData.get("resumeText") as string | null;

  let text = resumeText;

  // If file uploaded, extract text (for PDF you'd use a PDF parser in production)
  if (file && !text) {
    text = await file.text();
  }

  if (!text) {
    return NextResponse.json({ error: "No resume content provided" }, { status: 400 });
  }

  const parsed = await parseResume(text);

  // Optionally auto-create candidate
  const autoCreate = formData.get("autoCreate") === "true";
  if (autoCreate && parsed.email) {
    const candidate = await prisma.candidate.upsert({
      where: { email: parsed.email },
      create: {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email,
        phone: parsed.phone,
        linkedinUrl: parsed.linkedinUrl,
        location: parsed.location,
        currentTitle: parsed.currentTitle,
        currentCompany: parsed.currentCompany,
        summary: parsed.summary,
        skills: parsed.skills,
        resumeText: text,
        source: "RESUME_UPLOAD",
      },
      update: {
        resumeText: text,
        skills: parsed.skills,
        summary: parsed.summary,
        currentTitle: parsed.currentTitle,
        currentCompany: parsed.currentCompany,
      },
    });
    return NextResponse.json({ parsed, candidate });
  }

  return NextResponse.json({ parsed, resumeText: text });
}
