import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { enhanceJobDescription } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, rawDescription } = await req.json() as { title: string; rawDescription: string };
  if (!title || !rawDescription) {
    return NextResponse.json({ error: "Missing title or description" }, { status: 400 });
  }

  const enhanced = await enhanceJobDescription(title, rawDescription);
  return NextResponse.json(enhanced);
}
