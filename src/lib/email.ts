import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";

// ─── Transport ───────────────────────────────────────────────────────────────

function getTransport() {
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_PASS;
  if (!user || !pass) {
    console.warn("[email] BREVO_SMTP_USER / BREVO_SMTP_PASS not set — emails will not be sent");
    return null;
  }
  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });
}

async function getOrgSettings() {
  try {
    return await prisma.orgSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", updatedAt: new Date() },
      update: {},
    });
  } catch {
    return null;
  }
}

async function send(options: { to: string; subject: string; html: string }) {
  const transport = getTransport();
  if (!transport) return;

  const org = await getOrgSettings();
  const fromName = org?.emailFromName ?? "Lobah Careers";
  const fromAddress = process.env.EMAIL_FROM ?? "careers@lobah.com";
  const from = `${fromName} <${fromAddress}>`;

  const info = await transport.sendMail({ from, ...options });
  console.log("[email] Sent to", options.to, "—", info.messageId);
}

// ─── Template helpers ─────────────────────────────────────────────────────────

function renderTemplate(template: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.replaceAll(`{${k}}`, v),
    template
  );
}

function bodyToHtml(body: string) {
  return body
    .split(/\n\n+/)
    .map((p) => `<p style="color:#ccc;line-height:1.6;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

function wrapEmail(title: string, bodyHtml: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d0d0d;color:#fff;padding:40px;border-radius:12px;">
      <h1 style="font-size:22px;font-weight:900;margin:0 0 8px;color:#fff;">${title}</h1>
      <p style="color:#E55B1F;font-size:14px;margin:0 0 24px;">Lobah Games</p>
      ${bodyHtml}
      <p style="color:#555;font-size:12px;margin-top:32px;">© ${new Date().getFullYear()} Lobah Games. From Saudi Arabia to the world 🌍</p>
    </div>
  `;
}

// ─── Email templates ─────────────────────────────────────────────────────────

export async function sendApplicationConfirmation({
  candidateName,
  candidateEmail,
  jobTitle,
}: {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
}) {
  const org = await getOrgSettings();
  const vars = { candidateName, jobTitle };
  const subject = renderTemplate(
    org?.templateAppSubject ?? "Application received — {jobTitle}",
    vars
  );
  const bodyText = renderTemplate(
    org?.templateAppBody ??
      "Thank you for applying for the {jobTitle} position at Lobah Games. We have received your application and will review it shortly.\n\nWe will be in touch if your profile matches our requirements.",
    vars
  );
  await send({ to: candidateEmail, subject, html: wrapEmail(subject, bodyToHtml(bodyText)) });
}

export async function sendNewApplicationAlert({
  candidateName,
  candidateEmail,
  jobTitle,
  applicationId: _applicationId,
}: {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  applicationId: string;
}) {
  const org = await getOrgSettings();
  if (org && !org.notifyNewApplication) return;
  const hrEmail = org?.hrEmail ?? process.env.HR_EMAIL ?? "hr@lobah.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ats-app-git-master-shereenabbas244-4279s-projects.vercel.app";
  await send({
    to: hrEmail,
    subject: `New application — ${jobTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px;">
        <h2 style="color:#E55B1F;">New Application Received</h2>
        <p><strong>${candidateName}</strong> (${candidateEmail}) has applied for <strong>${jobTitle}</strong>.</p>
        <a href="${appUrl}/candidates"
           style="display:inline-block;background:#E55B1F;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px;">
          View in Dashboard
        </a>
      </div>
    `,
  });
}

export async function sendStatusUpdate({
  candidateName,
  candidateEmail,
  jobTitle,
  status,
}: {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  status: string;
}) {
  const org = await getOrgSettings();
  if (org && status === "HIRED" && !org.notifyHired) return;
  if (org && status === "REJECTED" && !org.notifyRejected) return;

  const vars = { candidateName, jobTitle };

  if (status === "HIRED") {
    const subject = renderTemplate(
      org?.templateHiredSubject ?? "Congratulations! Offer for {jobTitle}",
      vars
    );
    const bodyText = renderTemplate(
      org?.templateHiredBody ??
        "We are thrilled to inform you that you have been selected for this position. Our team will reach out to you shortly with the next steps.",
      vars
    );
    await send({ to: candidateEmail, subject, html: wrapEmail(subject, bodyToHtml(bodyText)) });
    return;
  }

  if (status === "REJECTED") {
    const subject = renderTemplate(
      org?.templateRejectedSubject ?? "Update on your application — {jobTitle}",
      vars
    );
    const bodyText = renderTemplate(
      org?.templateRejectedBody ??
        "After careful consideration, we have decided to move forward with other candidates for this role. We appreciate your interest in Lobah Games and encourage you to apply for future positions.",
      vars
    );
    await send({ to: candidateEmail, subject, html: wrapEmail(subject, bodyToHtml(bodyText)) });
    return;
  }

  if (status === "ON_HOLD") {
    const subject = `Application update — ${jobTitle}`;
    const message = "Your application is currently on hold while we continue our review process. We will update you as soon as we have more information.";
    await send({
      to: candidateEmail,
      subject,
      html: wrapEmail(subject, bodyToHtml(message)),
    });
  }
}

export async function sendTeamInvite({
  toEmail,
  inviterName,
  inviteCode,
  signupUrl,
}: {
  toEmail: string;
  inviterName: string;
  inviteCode: string;
  signupUrl: string;
}) {
  await send({
    to: toEmail,
    subject: `You've been invited to Lobah ATS`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d0d0d;color:#fff;padding:40px;border-radius:12px;">
        <h1 style="font-size:22px;font-weight:900;margin:0 0 8px;color:#fff;">You're invited to Lobah ATS</h1>
        <p style="color:#E55B1F;font-size:14px;margin:0 0 24px;">Lobah Games</p>
        <p style="color:#ccc;line-height:1.6;"><strong style="color:#fff;">${inviterName}</strong> has invited you to join the Lobah Games hiring platform.</p>
        <div style="margin:24px 0;padding:20px;background:#1a1a1a;border-radius:8px;border-left:4px solid #E55B1F;">
          <p style="margin:0 0 8px;color:#ccc;font-size:14px;">Your invite code:</p>
          <p style="margin:0;color:#fff;font-size:20px;font-weight:bold;letter-spacing:2px;">${inviteCode}</p>
        </div>
        <a href="${signupUrl}" style="display:inline-block;background:#E55B1F;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">
          Create Your Account
        </a>
        <p style="color:#555;font-size:12px;margin-top:32px;">© ${new Date().getFullYear()} Lobah Games. From Saudi Arabia to the world 🌍</p>
      </div>
    `,
  });
}
