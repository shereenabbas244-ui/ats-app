import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { candidateId, applicationId, content } = await req.json() as {
    candidateId?: string;
    applicationId?: string;
    content: string;
  };

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }

  const note = await prisma.candidateNote.create({
    data: {
      content: content.trim(),
      authorId: session.user.id,
      ...(candidateId ? { candidateId } : {}),
      ...(applicationId ? { applicationId } : {}),
    },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json(note);
}
