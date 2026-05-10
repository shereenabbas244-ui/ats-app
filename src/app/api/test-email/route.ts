import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_PASS;
  const from = process.env.EMAIL_FROM ?? "careers@lobah.com";
  const to = process.env.HR_EMAIL ?? "hr@lobah.com";

  if (!user || !pass) {
    return NextResponse.json({
      error: "BREVO_SMTP_USER or BREVO_SMTP_PASS not set in Vercel environment variables",
      setup: "Go to brevo.com → SMTP & API → SMTP Keys to get your credentials",
      from,
      to,
    }, { status: 500 });
  }

  try {
    const transport = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: { user, pass },
    });

    const info = await transport.sendMail({
      from,
      to,
      subject: "Lobah ATS — email test",
      html: "<p>If you received this, emails are working correctly via Brevo SMTP.</p>",
    });

    return NextResponse.json({
      success: true,
      from,
      to,
      messageId: info.messageId,
      note: "Email sent via Brevo SMTP. Check your inbox (and spam folder).",
    });
  } catch (err) {
    return NextResponse.json({ error: String(err), from, to }, { status: 500 });
  }
}
