import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { scoreCandidate, generateCandidateInsights } from "@/lib/claude";

// Standalone scoring endpoint that doesn't require an application record
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { resumeText, jobTitle, jobDescription, jobRequirements } =
    await req.json() as {
      resumeText: string;
      jobTitle: string;
      jobDescription: string;
      jobRequirements?: string;
    };

  if (!resumeText || !jobTitle || !jobDescription) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [score, insights] = await Promise.all([
    scoreCandidate(resumeText, jobTitle, jobDescription, jobRequirements ?? ""),
    generateCandidateInsights(resumeText, jobTitle, jobDescription),
  ]);

  return NextResponse.json({ score, insights });
}
