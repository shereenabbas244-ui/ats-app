import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_PASS;
  const from = process.env.EMAIL_FROM
    ?? (user ? `Lobah Careers <${user}>` : "not set");
  const to = process.env.HR_EMAIL ?? "hr@lobah.com";

  if (!user || !pass) {
    return NextResponse.json({
      error: "BREVO_SMTP_USER or BREVO_SMTP_PASS not set",
      hint: "Add them in Vercel → Settings → Environment Variables, then redeploy.",
      from, to,
    }, { status: 500 });
  }

  const transport = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  // Verify credentials first
  try {
    await transport.verify();
  } catch (err) {
    return NextResponse.json({
      error: "SMTP credential check failed",
      detail: String(err),
      user,
      from,
      hint: "Make sure BREVO_SMTP_USER is the login from Brevo → Transactional → Email → Settings (e.g. aad536001@smtp-brevo.com) and BREVO_SMTP_PASS is the SMTP key.",
    }, { status: 500 });
  }

  // Send test email
  try {
    const info = await transport.sendMail({
      from,
      to,
      subject: "Lobah ATS — email test",
      html: `<p>Emails are working. Sent at ${new Date().toISOString()}.</p>`,
    });
    return NextResponse.json({ success: true, from, to, messageId: info.messageId });
  } catch (err) {
    return NextResponse.json({
      error: "Send failed",
      detail: String(err),
      from,
      to,
      hint: "Credentials verified OK but send failed. The FROM address may need to be verified in Brevo → Senders & Domains.",
    }, { status: 500 });
  }
}
