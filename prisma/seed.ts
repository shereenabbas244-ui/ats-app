import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create admin user with password from env or default
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@lobah.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123";
  const hashed = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, name: "Admin", role: "ADMIN", password: hashed },
  });

  // Create sample job
  const job = await prisma.job.upsert({
    where: { id: "seed-job-1" },
    update: {},
    create: {
      id: "seed-job-1",
      title: "Senior Full-Stack Engineer",
      department: "Engineering",
      location: "Remote",
      type: "FULL_TIME",
      status: "OPEN",
      description: `We're looking for a Senior Full-Stack Engineer to join our growing team. You'll work on building scalable web applications that serve millions of users. You'll collaborate closely with product, design, and data teams to ship high-quality features.\n\nOur stack: React, Next.js, TypeScript, PostgreSQL, and AWS.`,
      requirements: `• 5+ years of experience with React and Node.js\n• Strong TypeScript skills\n• Experience with PostgreSQL and database design\n• Familiarity with cloud services (AWS/GCP/Azure)\n• Experience with CI/CD pipelines\n• Strong communication skills`,
      salaryMin: 140000,
      salaryMax: 180000,
      salaryCurrency: "USD",
      createdById: admin.id,
      stages: {
        create: [
          { name: "Applied", order: 0, color: "#6366f1" },
          { name: "Screening", order: 1, color: "#8b5cf6" },
          { name: "Technical", order: 2, color: "#3b82f6" },
          { name: "Interview", order: 3, color: "#06b6d4" },
          { name: "Offer", order: 4, color: "#10b981" },
          { name: "Hired", order: 5, color: "#22c55e" },
        ],
      },
    },
    include: { stages: { orderBy: { order: "asc" } } },
  });

  // Create sample candidates
  const candidates = [
    {
      id: "seed-cand-1",
      firstName: "Sarah",
      lastName: "Chen",
      email: "sarah.chen@example.com",
      currentTitle: "Senior Software Engineer",
      currentCompany: "TechCorp",
      location: "San Francisco, CA",
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
      resumeText: `Sarah Chen - Senior Software Engineer
Email: sarah.chen@example.com | LinkedIn: linkedin.com/in/sarahchen

EXPERIENCE
Senior Software Engineer - TechCorp (2020-Present)
• Led migration of monolithic app to microservices, reducing latency by 40%
• Built real-time dashboard serving 2M+ users using React and WebSockets
• Mentored team of 4 junior engineers

Software Engineer - StartupXYZ (2018-2020)
• Developed REST APIs using Node.js and Express
• Optimized PostgreSQL queries, improving performance by 60%

SKILLS
React, TypeScript, Node.js, PostgreSQL, AWS, Docker, GraphQL

EDUCATION
BS Computer Science - Stanford University (2018)`,
      source: "LINKEDIN" as const,
      aiScore: 92,
    },
    {
      id: "seed-cand-2",
      firstName: "Marcus",
      lastName: "Johnson",
      email: "marcus.j@example.com",
      currentTitle: "Full-Stack Developer",
      currentCompany: "Agency Co",
      location: "Austin, TX",
      skills: ["React", "Vue.js", "Python", "MongoDB", "Docker"],
      resumeText: `Marcus Johnson - Full Stack Developer
Email: marcus.j@example.com

EXPERIENCE
Full Stack Developer - Agency Co (2021-Present)
• Built 15+ client websites using React and Vue.js
• Created REST APIs with Python/Django

Junior Developer - Freelance (2019-2021)
• Various web projects for small businesses

SKILLS
React, Vue.js, Python, Django, MongoDB, Docker

EDUCATION
Bootcamp Graduate - Coding Bootcamp (2019)`,
      source: "RESUME_UPLOAD" as const,
      aiScore: 68,
    },
    {
      id: "seed-cand-3",
      firstName: "Priya",
      lastName: "Patel",
      email: "priya.patel@example.com",
      currentTitle: "Lead Engineer",
      currentCompany: "BigTech Inc",
      location: "New York, NY",
      skills: ["React", "TypeScript", "Go", "Kubernetes", "PostgreSQL", "AWS"],
      resumeText: `Priya Patel - Lead Software Engineer
Email: priya.patel@example.com

EXPERIENCE
Lead Engineer - BigTech Inc (2019-Present)
• Led team of 8 engineers building high-traffic e-commerce platform
• Architected event-driven microservices using Go and Kafka
• Reduced infrastructure costs by 35% through optimization

Senior Engineer - MidTech (2016-2019)
• Built TypeScript/React frontend serving 5M MAU
• Designed PostgreSQL schemas for complex e-commerce data

SKILLS
TypeScript, React, Go, Kubernetes, PostgreSQL, AWS, Kafka, Redis

EDUCATION
MS Computer Science - MIT (2016)`,
      source: "LINKEDIN" as const,
      aiScore: 95,
    },
  ];

  for (const c of candidates) {
    const { aiScore, ...candidateData } = c;
    const candidate = await prisma.candidate.upsert({
      where: { id: c.id },
      update: {},
      create: candidateData,
    });

    const stage = job.stages[candidates.indexOf(c) % 3];
    await prisma.application.upsert({
      where: { candidateId_jobId: { candidateId: candidate.id, jobId: job.id } },
      update: {},
      create: {
        candidateId: candidate.id,
        jobId: job.id,
        stageId: stage.id,
        source: c.source,
        aiScore,
        aiSummary: `AI analysis for ${c.firstName} — strong candidate with relevant experience.`,
        activities: {
          create: [
            { type: "APPLIED", description: "Application received" },
            { type: "AI_SCORED", description: `AI score: ${aiScore}/100` },
          ],
        },
      },
    });
  }

  console.log("✅ Seed data created successfully");
  console.log(`   • 1 job: ${job.title}`);
  console.log(`   • ${candidates.length} candidates with applications`);
  console.log(`   • Login at http://localhost:3000 with email: admin@ats.dev`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
