import nodemailer from "nodemailer";

// ─── Transport ───────────────────────────────────────────────────────────────
// Uses Brevo (formerly Sendinblue) SMTP — free tier: 300 emails/day.
// Required Vercel env vars:
//   BREVO_SMTP_USER   — your Brevo SMTP login (the email you registered with)
//   BREVO_SMTP_PASS   — the SMTP key from Brevo → SMTP & API → SMTP
// Optional:
//   EMAIL_FROM        — e.g. "Lobah Careers <careers@lobah.com>"
//   HR_EMAIL          — recipient for internal alerts, default hr@lobah.com

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

const FROM = process.env.EMAIL_FROM
  // Fall back to the SMTP user itself — always accepted by Brevo as sender
  ?? (process.env.BREVO_SMTP_USER ? `Lobah Careers <${process.env.BREVO_SMTP_USER}>` : "Lobah Careers <careers@lobah.com>");
const HR_EMAIL = process.env.HR_EMAIL ?? "hr@lobah.com";

async function send(options: { to: string; subject: string; html: string }) {
  const transport = getTransport();
  if (!transport) return;
  // Let errors propagate so Vercel logs show the real reason for failure
  const info = await transport.sendMail({ from: FROM, ...options });
  console.log("[email] Sent to", options.to, "—", info.messageId);
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
  await send({
    to: candidateEmail,
    subject: `Application received — ${jobTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d0d0d;color:#fff;padding:40px;border-radius:12px;">
        <h1 style="font-size:24px;font-weight:900;margin:0 0 8px;color:#fff;">Application Received!</h1>
        <p style="color:#E55B1F;font-size:14px;margin:0 0 24px;">Lobah Games</p>
        <p style="color:#ccc;line-height:1.6;">Hi <strong style="color:#fff;">${candidateName}</strong>,</p>
        <p style="color:#ccc;line-height:1.6;">Thank you for applying for the <strong style="color:#fff;">${jobTitle}</strong> position at Lobah Games. We have received your application and will review it shortly.</p>
        <p style="color:#ccc;line-height:1.6;">We will be in touch if your profile matches our requirements.</p>
        <div style="margin:32px 0;padding:20px;background:#1a1a1a;border-radius:8px;border-left:4px solid #E55B1F;">
          <p style="margin:0;color:#ccc;font-size:14px;">You applied for: <strong style="color:#fff;">${jobTitle}</strong></p>
        </div>
        <p style="color:#555;font-size:12px;margin-top:32px;">© ${new Date().getFullYear()} Lobah Games. From Saudi Arabia to the world 🌍</p>
      </div>
    `,
  });
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ats-app-git-master-shereenabbas244-4279s-projects.vercel.app";
  await send({
    to: HR_EMAIL,
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
  const statusMessages: Record<string, { subject: string; message: string }> = {
    HIRED: {
      subject: `Congratulations! Offer for ${jobTitle}`,
      message: "We are thrilled to inform you that you have been selected for this position. Our team will reach out to you shortly with the next steps.",
    },
    REJECTED: {
      subject: `Update on your application — ${jobTitle}`,
      message: "After careful consideration, we have decided to move forward with other candidates for this role. We appreciate your interest in Lobah Games and encourage you to apply for future positions.",
    },
    ON_HOLD: {
      subject: `Application update — ${jobTitle}`,
      message: "Your application is currently on hold while we continue our review process. We will update you as soon as we have more information.",
    },
  };

  const msg = statusMessages[status];
  if (!msg) return;

  await send({
    to: candidateEmail,
    subject: msg.subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d0d0d;color:#fff;padding:40px;border-radius:12px;">
        <h1 style="font-size:22px;font-weight:900;margin:0 0 24px;color:#fff;">${msg.subject}</h1>
        <p style="color:#ccc;line-height:1.6;">Hi <strong style="color:#fff;">${candidateName}</strong>,</p>
        <p style="color:#ccc;line-height:1.6;">${msg.message}</p>
        <p style="color:#ccc;line-height:1.6;">Position: <strong style="color:#fff;">${jobTitle}</strong></p>
        <p style="color:#555;font-size:12px;margin-top:32px;">© ${new Date().getFullYear()} Lobah Games. From Saudi Arabia to the world 🌍</p>
      </div>
    `,
  });
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
