/**
 * LinkedIn API Integration
 *
 * Public API (available with standard OAuth):
 *   - Sign in with LinkedIn (r_liteprofile, r_emailaddress)
 *   - Share posts / job postings (w_member_social)
 *   - Profile data for authenticated users
 *
 * Partner-tier API (requires LinkedIn Talent Solutions approval):
 *   - Job Postings API (create/manage jobs on LinkedIn)
 *   - Apply Connect (Easy Apply tracking, candidate import)
 *   - Recruiter System Connect (full ATS integration)
 *
 * The functions below implement what's available publicly,
 * and stub the partner-tier features so they're easy to enable
 * once you obtain LinkedIn partnership.
 *
 * Apply for LinkedIn Talent Solutions:
 * https://business.linkedin.com/talent-solutions/ats-partners
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  headline?: string;
  location?: string;
  profilePictureUrl?: string;
  publicProfileUrl?: string;
  summary?: string;
  positions?: LinkedInPosition[];
  skills?: string[];
}

export interface LinkedInPosition {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  description?: string;
  isCurrent: boolean;
}

export interface LinkedInJob {
  linkedinJobId: string;
  title: string;
  description: string;
  location: string;
  jobType: string;
  postUrl: string;
  postedAt: string;
  expiresAt?: string;
}

export interface LinkedInApplicant {
  applicantId: string;
  firstName: string;
  lastName: string;
  email?: string;
  linkedinUrl?: string;
  profileId?: string;
  appliedAt: string;
  resumeUrl?: string;
  coverLetter?: string;
}

// ─── OAuth helpers ───────────────────────────────────────────────────────────

const LINKEDIN_API_BASE = "https://api.linkedin.com/v2";
const LINKEDIN_OAUTH_BASE = "https://www.linkedin.com/oauth/v2";

export function getLinkedInOAuthUrl(
  redirectUri: string,
  state: string,
  scopes: string[] = ["r_liteprofile", "r_emailaddress"]
): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: redirectUri,
    state,
    scope: scopes.join(" "),
  });
  return `${LINKEDIN_OAUTH_BASE}/authorization?${params}`;
}

export async function exchangeLinkedInCode(
  code: string,
  redirectUri: string
): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch(`${LINKEDIN_OAUTH_BASE}/accessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LinkedIn token exchange failed: ${err}`);
  }

  return res.json() as Promise<{ access_token: string; expires_in: number }>;
}

// ─── Profile API (public tier) ────────────────────────────────────────────────

export async function getLinkedInProfile(
  accessToken: string
): Promise<LinkedInProfile> {
  const [profileRes, emailRes] = await Promise.all([
    fetch(`${LINKEDIN_API_BASE}/me?projection=(id,firstName,lastName,headline,profilePicture(displayImage~:playableStreams),publicProfileUrl,summary)`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    fetch(`${LINKEDIN_API_BASE}/emailAddress?q=members&projection=(elements*(handle~))`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
  ]);

  if (!profileRes.ok) {
    throw new Error(`LinkedIn profile fetch failed: ${profileRes.status}`);
  }

  const profile = (await profileRes.json()) as {
    id: string;
    firstName?: { localized?: Record<string, string> };
    lastName?: { localized?: Record<string, string> };
    headline?: { localized?: Record<string, string> };
    publicProfileUrl?: string;
    summary?: { localized?: Record<string, string> };
    profilePicture?: {
      "displayImage~"?: {
        elements?: Array<{ identifiers?: Array<{ identifier: string }> }>;
      };
    };
  };

  let email: string | undefined;
  if (emailRes.ok) {
    const emailData = (await emailRes.json()) as {
      elements?: Array<{ "handle~"?: { emailAddress?: string } }>;
    };
    email = emailData.elements?.[0]?.["handle~"]?.emailAddress;
  }

  const localized = (obj?: { localized?: Record<string, string> }) =>
    obj?.localized ? Object.values(obj.localized)[0] : undefined;

  const pictureElements =
    profile.profilePicture?.["displayImage~"]?.elements ?? [];
  const profilePictureUrl =
    pictureElements[pictureElements.length - 1]?.identifiers?.[0]?.identifier;

  return {
    id: profile.id,
    firstName: localized(profile.firstName) ?? "",
    lastName: localized(profile.lastName) ?? "",
    email,
    headline: localized(profile.headline),
    publicProfileUrl: profile.publicProfileUrl,
    summary: localized(profile.summary),
    profilePictureUrl,
  };
}

// ─── Job Postings (Partner API — stubbed) ────────────────────────────────────

/**
 * Post a job to LinkedIn.
 * Requires LinkedIn Job Posting API access (Talent Solutions partnership).
 * Apply at: https://business.linkedin.com/talent-solutions/ats-partners
 */
export async function postJobToLinkedIn(
  accessToken: string,
  job: {
    title: string;
    description: string;
    location: string;
    companyId: string;
    jobType?: string;
    externalJobPostingId?: string;
  }
): Promise<{ linkedinJobId: string; postUrl: string }> {
  // Partner API endpoint — requires Talent Solutions access
  const res = await fetch(`${LINKEDIN_API_BASE}/simpleJobPostings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      title: job.title,
      description: { text: job.description },
      employmentStatus: jobTypeToLinkedIn(job.jobType ?? "FULL_TIME"),
      companyApplyUrl: { url: `${process.env.NEXTAUTH_URL}/jobs/apply` },
      listedAt: Date.now(),
      jobPostingOperationType: "CREATE",
      integrationContext: `urn:li:company:${job.companyId}`,
      externalJobPostingId: job.externalJobPostingId,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 403) {
      throw new Error(
        "LinkedIn Job Posting API requires Talent Solutions partnership. " +
        "Apply at: https://business.linkedin.com/talent-solutions/ats-partners"
      );
    }
    throw new Error(`LinkedIn job post failed: ${errText}`);
  }

  const location = res.headers.get("x-restli-id") ?? "";
  return {
    linkedinJobId: location,
    postUrl: `https://www.linkedin.com/jobs/view/${location}`,
  };
}

/**
 * Import all applicants for a LinkedIn job posting.
 * Requires Apply Connect API (Talent Solutions partnership).
 */
export async function importLinkedInApplicants(
  accessToken: string,
  linkedinJobId: string
): Promise<LinkedInApplicant[]> {
  const res = await fetch(
    `${LINKEDIN_API_BASE}/applications?q=jobPosting&jobPostingId=${linkedinJobId}&count=100`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    }
  );

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error(
        "LinkedIn Apply Connect API requires Talent Solutions partnership. " +
        "Apply at: https://business.linkedin.com/talent-solutions/ats-partners"
      );
    }
    throw new Error(`LinkedIn applicant import failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    elements?: Array<{
      id: string;
      applicant?: {
        "com.linkedin.recruiter.common.MiniProfile"?: {
          firstName?: string;
          lastName?: string;
          publicIdentifier?: string;
        };
      };
      appliedAt?: number;
      resume?: { url?: string };
      coverLetter?: string;
    }>;
  };

  return (data.elements ?? []).map((el) => {
    const miniProfile =
      el.applicant?.["com.linkedin.recruiter.common.MiniProfile"];
    return {
      applicantId: el.id,
      firstName: miniProfile?.firstName ?? "",
      lastName: miniProfile?.lastName ?? "",
      linkedinUrl: miniProfile?.publicIdentifier
        ? `https://www.linkedin.com/in/${miniProfile.publicIdentifier}`
        : undefined,
      profileId: miniProfile?.publicIdentifier,
      appliedAt: new Date(el.appliedAt ?? Date.now()).toISOString(),
      resumeUrl: el.resume?.url,
      coverLetter: el.coverLetter,
    };
  });
}

/**
 * Import a candidate's full LinkedIn profile (for talent search / profile import).
 * Requires r_fullprofile scope and LinkedIn Recruiter access.
 */
export async function importLinkedInCandidateProfile(
  accessToken: string,
  profileId: string
): Promise<LinkedInProfile> {
  const res = await fetch(
    `${LINKEDIN_API_BASE}/people/(id:${profileId})?projection=(id,firstName,lastName,headline,summary,publicProfileUrl,positions,skills)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`LinkedIn profile import failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    id: string;
    firstName?: { localized?: Record<string, string> };
    lastName?: { localized?: Record<string, string> };
    headline?: { localized?: Record<string, string> };
    summary?: { localized?: Record<string, string> };
    publicProfileUrl?: string;
    positions?: {
      values?: Array<{
        company?: { name?: string };
        title?: string;
        startDate?: { year?: number; month?: number };
        endDate?: { year?: number; month?: number };
        description?: string;
        isCurrent?: boolean;
      }>;
    };
    skills?: {
      values?: Array<{ skill?: { name?: string } }>;
    };
  };

  const localized = (obj?: { localized?: Record<string, string> }) =>
    obj?.localized ? Object.values(obj.localized)[0] : undefined;

  const positions = (data.positions?.values ?? []).map((p) => ({
    company: p.company?.name ?? "",
    title: p.title ?? "",
    startDate: formatLinkedInDate(p.startDate),
    endDate: p.isCurrent ? undefined : formatLinkedInDate(p.endDate),
    description: p.description,
    isCurrent: p.isCurrent ?? false,
  }));

  const skills = (data.skills?.values ?? [])
    .map((s) => s.skill?.name)
    .filter(Boolean) as string[];

  return {
    id: data.id,
    firstName: localized(data.firstName) ?? "",
    lastName: localized(data.lastName) ?? "",
    headline: localized(data.headline),
    summary: localized(data.summary),
    publicProfileUrl: data.publicProfileUrl,
    positions,
    skills,
  };
}

// ─── Webhook handler for Easy Apply ──────────────────────────────────────────

export interface LinkedInWebhookPayload {
  type: "EASY_APPLY" | "JOB_APPLICATION_UPDATE";
  applicationId: string;
  jobId: string;
  applicant: {
    firstName: string;
    lastName: string;
    email?: string;
    profileId?: string;
    resumeUrl?: string;
  };
  appliedAt: string;
}

export function parseLinkedInWebhook(body: unknown): LinkedInWebhookPayload {
  return body as LinkedInWebhookPayload;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function jobTypeToLinkedIn(type: string): string {
  const map: Record<string, string> = {
    FULL_TIME: "FULL_TIME",
    PART_TIME: "PART_TIME",
    CONTRACT: "CONTRACTOR",
    INTERNSHIP: "INTERNSHIP",
    REMOTE: "FULL_TIME",
  };
  return map[type] ?? "FULL_TIME";
}

function formatLinkedInDate(
  date?: { year?: number; month?: number }
): string {
  if (!date?.year) return "";
  if (date.month) {
    return `${date.year}-${String(date.month).padStart(2, "0")}`;
  }
  return String(date.year);
}
