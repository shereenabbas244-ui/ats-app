import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Lobah Careers <careers@lobah.com>";

export async function sendApplicationConfirmation({
  candidateName,
  candidateEmail,
  jobTitle,
}: {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  await resend.emails.send({
    from: FROM,
    to: candidateEmail,
    subject: `Application received — ${jobTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d0d0d;color:#fff;padding:40px;border-radius:12px;">
        <img src="https://ats-app-git-master-shereenabbas244-4279s-projects.vercel.app/Lobah%20new%20logo.png" alt="Lobah Games" height="40" style="margin-bottom:32px;" />
        <h1 style="font-size:24px;font-weight:900;margin:0 0 8px;">Application Received!</h1>
        <p style="color:#E55B1F;font-size:14px;margin:0 0 24px;">We are Lobah Games</p>
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
  applicationId,
}: {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  applicationId: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  const hrEmail = process.env.HR_EMAIL ?? "hr@lobah.com";
  await resend.emails.send({
    from: FROM,
    to: hrEmail,
    subject: `New application — ${jobTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px;">
        <h2 style="color:#E55B1F;">New Application Received</h2>
        <p><strong>${candidateName}</strong> (${candidateEmail}) has applied for <strong>${jobTitle}</strong>.</p>
        <a href="https://ats-app-git-master-shereenabbas244-4279s-projects.vercel.app/dashboard"
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
  if (!process.env.RESEND_API_KEY) return;

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

  await resend.emails.send({
    from: FROM,
    to: candidateEmail,
    subject: msg.subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d0d0d;color:#fff;padding:40px;border-radius:12px;">
        <img src="https://ats-app-git-master-shereenabbas244-4279s-projects.vercel.app/Lobah%20new%20logo.png" alt="Lobah Games" height="40" style="margin-bottom:32px;" />
        <h1 style="font-size:22px;font-weight:900;margin:0 0 24px;">${msg.subject}</h1>
        <p style="color:#ccc;line-height:1.6;">Hi <strong style="color:#fff;">${candidateName}</strong>,</p>
        <p style="color:#ccc;line-height:1.6;">${msg.message}</p>
        <p style="color:#ccc;line-height:1.6;">Position: <strong style="color:#fff;">${jobTitle}</strong></p>
        <p style="color:#555;font-size:12px;margin-top:32px;">© ${new Date().getFullYear()} Lobah Games. From Saudi Arabia to the world 🌍</p>
      </div>
    `,
  });
}
