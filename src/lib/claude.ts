import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ParsedResume {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  currentTitle?: string;
  currentCompany?: string;
  summary: string;
  skills: string[];
  experience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    graduationYear?: string;
  }>;
  linkedinUrl?: string;
}

export interface AIScoreResult {
  overall: number; // 0-100
  breakdown: {
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    locationMatch: number;
    cultureFit: number;
  };
  strengths: string[];
  gaps: string[];
  summary: string;
  recommendation: "strong_yes" | "yes" | "maybe" | "no";
}

export interface CandidateInsight {
  keyStrengths: string[];
  potentialConcerns: string[];
  interviewQuestions: string[];
  overallAssessment: string;
}

// ─── Resume Parsing ──────────────────────────────────────────────────────────

export async function parseResume(resumeText: string): Promise<ParsedResume> {
  if (!resumeText.trim()) throw new Error("Resume text must not be empty");
  const stream = client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    thinking: { type: "enabled", budget_tokens: 8000 },
    system: `You are an expert resume parser. Extract structured information from resumes accurately.
Always return valid JSON matching the exact schema requested. If a field is not found, use null or empty array.`,
    messages: [
      {
        role: "user",
        content: `Parse this resume and return a JSON object with this exact structure:
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string or null",
  "location": "string or null",
  "currentTitle": "string or null",
  "currentCompany": "string or null",
  "summary": "2-3 sentence professional summary",
  "skills": ["array", "of", "skills"],
  "experience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "YYYY-MM or YYYY",
      "endDate": "YYYY-MM or YYYY or null for current",
      "description": "brief description"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string or null",
      "graduationYear": "YYYY or null"
    }
  ],
  "linkedinUrl": "string or null"
}

Resume text:
${resumeText}

Return ONLY the JSON object, no markdown or explanation.`,
      },
    ],
  });

  const message = await stream.finalMessage();
  const text = message.content.find((b) => b.type === "text")?.text ?? "{}";

  try {
    return JSON.parse(text.trim()) as ParsedResume;
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as ParsedResume;
    throw new Error("Failed to parse resume: invalid JSON response");
  }
}

// ─── AI Scoring ──────────────────────────────────────────────────────────────

export async function scoreCandidate(
  resumeText: string,
  jobTitle: string,
  jobDescription: string,
  jobRequirements: string
): Promise<AIScoreResult> {
  if (!resumeText.trim()) throw new Error("Resume text must not be empty");
  if (!jobTitle.trim()) throw new Error("Job title must not be empty");
  if (!jobDescription.trim()) throw new Error("Job description must not be empty");
  const stream = client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    thinking: { type: "enabled", budget_tokens: 8000 },
    system: `You are an expert recruiter and talent evaluator. Score candidates objectively based on job fit.
Be fair, thorough, and evidence-based. Return valid JSON only.`,
    messages: [
      {
        role: "user",
        content: `Evaluate this candidate for the following job and return a JSON score report.

JOB: ${jobTitle}
DESCRIPTION: ${jobDescription}
REQUIREMENTS: ${jobRequirements}

CANDIDATE RESUME:
${resumeText}

Return a JSON object with this exact structure:
{
  "overall": <0-100 integer>,
  "breakdown": {
    "skillsMatch": <0-100>,
    "experienceMatch": <0-100>,
    "educationMatch": <0-100>,
    "locationMatch": <0-100>,
    "cultureFit": <0-100>
  },
  "strengths": ["top 3-5 specific strengths relative to this role"],
  "gaps": ["top 2-4 gaps or concerns"],
  "summary": "2-3 sentence evaluation summary",
  "recommendation": "strong_yes | yes | maybe | no"
}

Scoring guide:
- 90-100: Near-perfect fit, exceptional candidate
- 75-89: Strong fit, highly recommended
- 60-74: Good fit, worth interviewing
- 45-59: Partial fit, some concerns
- 30-44: Weak fit, significant gaps
- 0-29: Poor fit

Return ONLY the JSON object.`,
      },
    ],
  });

  const message = await stream.finalMessage();
  const text = message.content.find((b) => b.type === "text")?.text ?? "{}";

  try {
    return JSON.parse(text.trim()) as AIScoreResult;
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as AIScoreResult;
    throw new Error("Failed to score candidate: invalid JSON response");
  }
}

// ─── Candidate Insights ──────────────────────────────────────────────────────

export async function generateCandidateInsights(
  resumeText: string,
  jobTitle: string,
  jobDescription: string
): Promise<CandidateInsight> {
  if (!resumeText.trim()) throw new Error("Resume text must not be empty");
  if (!jobTitle.trim()) throw new Error("Job title must not be empty");
  if (!jobDescription.trim()) throw new Error("Job description must not be empty");
  const stream = client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    thinking: { type: "enabled", budget_tokens: 5000 },
    system: `You are an expert interviewer and talent evaluator. Generate actionable insights to help recruiters.`,
    messages: [
      {
        role: "user",
        content: `Analyze this candidate for the role of ${jobTitle} and provide actionable interviewing insights.

JOB DESCRIPTION: ${jobDescription}

CANDIDATE RESUME:
${resumeText}

Return JSON:
{
  "keyStrengths": ["3-5 specific strengths to highlight in interview"],
  "potentialConcerns": ["2-3 areas to probe or clarify"],
  "interviewQuestions": ["5 tailored behavioral/technical questions for this candidate"],
  "overallAssessment": "3-4 sentence holistic assessment"
}

Return ONLY the JSON object.`,
      },
    ],
  });

  const message = await stream.finalMessage();
  const text = message.content.find((b) => b.type === "text")?.text ?? "{}";

  try {
    return JSON.parse(text.trim()) as CandidateInsight;
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as CandidateInsight;
    throw new Error("Failed to generate insights: invalid JSON response");
  }
}

// ─── Batch Scoring ───────────────────────────────────────────────────────────

export async function rankCandidates(
  candidates: Array<{ id: string; resumeText: string; name: string }>,
  jobTitle: string,
  jobDescription: string,
  jobRequirements: string
): Promise<Array<{ id: string; score: number; recommendation: string }>> {
  if (!jobTitle.trim()) throw new Error("Job title must not be empty");
  if (!jobDescription.trim()) throw new Error("Job description must not be empty");
  if (candidates.length === 0) throw new Error("At least one candidate is required");
  const stream = client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    thinking: { type: "enabled", budget_tokens: 8000 },
    system: `You are an expert recruiter. Rank candidates fairly and objectively.`,
    messages: [
      {
        role: "user",
        content: `Rank these ${candidates.length} candidates for the role: ${jobTitle}

JOB DESCRIPTION: ${jobDescription}
REQUIREMENTS: ${jobRequirements}

CANDIDATES:
${candidates.map((c, i) => `--- Candidate ${i + 1} (ID: ${c.id}, Name: ${c.name}) ---\n${c.resumeText}`).join("\n\n")}

Return a JSON array ranked from best to worst:
[
  {
    "id": "candidate-id",
    "score": <0-100>,
    "recommendation": "strong_yes | yes | maybe | no"
  }
]

Return ONLY the JSON array.`,
      },
    ],
  });

  const message = await stream.finalMessage();
  const text = message.content.find((b) => b.type === "text")?.text ?? "[]";

  try {
    return JSON.parse(text.trim()) as Array<{
      id: string;
      score: number;
      recommendation: string;
    }>;
  } catch {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch)
      return JSON.parse(jsonMatch[0]) as Array<{
        id: string;
        score: number;
        recommendation: string;
      }>;
    throw new Error("Failed to rank candidates: invalid JSON response");
  }
}

// ─── Job Description Enhancement ─────────────────────────────────────────────

export async function enhanceJobDescription(
  title: string,
  rawDescription: string
): Promise<{ description: string; requirements: string }> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Enhance this job posting to be clear, compelling, and inclusive.

Job Title: ${title}
Raw Input: ${rawDescription}

Return JSON:
{
  "description": "polished job description with responsibilities, culture, and benefits (3-4 paragraphs)",
  "requirements": "clear bullet-point requirements list (must-have and nice-to-have)"
}

Return ONLY the JSON object.`,
      },
    ],
  });

  const text =
    response.content.find((b) => b.type === "text")?.text ?? "{}";
  try {
    return JSON.parse(text.trim()) as {
      description: string;
      requirements: string;
    };
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch)
      return JSON.parse(jsonMatch[0]) as {
        description: string;
        requirements: string;
      };
    throw new Error("Failed to enhance job description");
  }
}
