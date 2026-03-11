"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  SparklesIcon,
  UploadIcon,
  UsersIcon,
  FileTextIcon,
  CheckCircleIcon,
} from "lucide-react";
import { scoreToColor, scoreToLabel } from "@/lib/utils";

interface ParsedResume {
  firstName?: string;
  lastName?: string;
  email?: string;
  currentTitle?: string;
  currentCompany?: string;
  skills?: string[];
  summary?: string;
}

interface ScoreBreakdown {
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  locationMatch: number;
  cultureFit: number;
}

interface ScoreResult {
  overall: number;
  breakdown: ScoreBreakdown;
  strengths: string[];
  gaps: string[];
  summary: string;
  recommendation: string;
}

interface CandidateInsights {
  keyStrengths: string[];
  potentialConcerns: string[];
  interviewQuestions: string[];
  overallAssessment: string;
}

export default function AIPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobRequirements, setJobRequirements] = useState("");
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [insights, setInsights] = useState<CandidateInsights | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleParseResume = async () => {
    if (!resumeText) return;
    setLoading("parse");
    try {
      const formData = new FormData();
      formData.append("resumeText", resumeText);
      const res = await fetch("/api/ai/parse-resume", { method: "POST", body: formData });
      const data = await res.json() as { parsed?: ParsedResume };
      if (data.parsed) setParsedResume(data.parsed);
    } finally {
      setLoading(null);
    }
  };

  const handleScoreCandidate = async () => {
    if (!resumeText || !jobTitle || !jobDescription) return;
    setLoading("score");
    try {
      const res = await fetch("/api/ai/score-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobTitle, jobDescription, jobRequirements }),
      });
      const data = await res.json() as { score?: ScoreResult; insights?: CandidateInsights };
      if (data.score) setScoreResult(data.score);
      if (data.insights) setInsights(data.insights);
    } finally {
      setLoading(null);
    }
  };

  const textareaClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Tools</h1>
        <p className="text-sm text-gray-500 mt-1">
          Powered by Claude Opus 4.6 — parse resumes, score candidates, generate interview questions
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileTextIcon className="h-5 w-5 text-indigo-600" />
                <CardTitle>Resume Text</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                rows={10}
                className={textareaClass}
                placeholder="Paste resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <Button
                onClick={handleParseResume}
                loading={loading === "parse"}
                disabled={!resumeText}
                variant="outline"
                className="w-full"
              >
                <UploadIcon className="h-4 w-4" />
                Parse Resume with AI
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-indigo-600" />
                <CardTitle>Job Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                className={textareaClass}
                placeholder="Job title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
              <textarea
                rows={4}
                className={textareaClass}
                placeholder="Job description..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <textarea
                rows={3}
                className={textareaClass}
                placeholder="Requirements..."
                value={jobRequirements}
                onChange={(e) => setJobRequirements(e.target.value)}
              />
              <Button
                onClick={handleScoreCandidate}
                loading={loading === "score"}
                disabled={!resumeText || !jobTitle || !jobDescription}
                className="w-full"
              >
                <SparklesIcon className="h-4 w-4" />
                Score &amp; Analyze Candidate
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          {parsedResume && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <CardTitle>Parsed Resume</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {parsedResume.firstName} {parsedResume.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{parsedResume.email}</p>
                  {parsedResume.currentTitle && (
                    <p className="text-sm text-gray-600 mt-1">
                      {parsedResume.currentTitle}
                      {parsedResume.currentCompany ? ` at ${parsedResume.currentCompany}` : ""}
                    </p>
                  )}
                </div>
                {parsedResume.skills && parsedResume.skills.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1.5">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {parsedResume.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {parsedResume.summary && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Summary</p>
                    <p className="text-sm text-gray-600">{parsedResume.summary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {scoreResult && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-indigo-600" />
                    <CardTitle>AI Score</CardTitle>
                  </div>
                  <span className={`text-2xl font-bold px-3 py-1 rounded-lg ${scoreToColor(scoreResult.overall)}`}>
                    {scoreResult.overall}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Score Breakdown</p>
                  {Object.entries(scoreResult.breakdown).map(([key, val]) => (
                    <div key={key} className="mb-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                        <span className="font-medium">{val}/100</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100">
                        <div
                          className="h-1.5 rounded-full bg-indigo-500 transition-all"
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1.5">Strengths</p>
                  {scoreResult.strengths.map((s, i) => (
                    <p key={i} className="text-sm text-green-700 flex items-start gap-1.5 mb-1">
                      <span className="text-green-500 mt-0.5">✓</span> {s}
                    </p>
                  ))}
                </div>

                {scoreResult.gaps.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1.5">Gaps</p>
                    {scoreResult.gaps.map((g, i) => (
                      <p key={i} className="text-sm text-red-600 flex items-start gap-1.5 mb-1">
                        <span className="mt-0.5">✗</span> {g}
                      </p>
                    ))}
                  </div>
                )}

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">AI Summary</p>
                  <p className="text-sm text-gray-700">{scoreResult.summary}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Recommendation:</span>
                  <Badge
                    variant={
                      scoreResult.recommendation === "strong_yes" || scoreResult.recommendation === "yes"
                        ? "success"
                        : scoreResult.recommendation === "maybe"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {scoreResult.recommendation.replace("_", " ").toUpperCase()}
                  </Badge>
                  <span className="text-sm font-medium text-gray-700">
                    · {scoreToLabel(scoreResult.overall)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {insights && (
            <Card>
              <CardHeader>
                <CardTitle>Interview Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Suggested Questions</p>
                  {insights.interviewQuestions.map((q, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <span className="text-xs font-bold text-indigo-600 shrink-0 mt-0.5">{i + 1}.</span>
                      <p className="text-sm text-gray-700">{q}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3">
                  <p className="text-xs font-medium text-indigo-600 uppercase mb-1">Overall Assessment</p>
                  <p className="text-sm text-indigo-900">{insights.overallAssessment}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!parsedResume && !scoreResult && (
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
              <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">AI Results Appear Here</p>
              <p className="text-sm text-gray-400 mt-1">Parse a resume or score a candidate to see AI analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
