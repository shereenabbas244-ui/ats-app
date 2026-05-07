import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "RESEND_API_KEY is not set in environment variables" }, { status: 500 });
  }

  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
  const to = process.env.HR_EMAIL ?? "hr@lobah.com";

  const resend = new Resend(key);
  try {
    const result = await resend.emails.send({
      from,
      to,
      subject: "Lobah ATS — Email test",
      html: "<p>This is a test email from Lobah ATS. If you received this, emails are working correctly.</p>",
    });
    return NextResponse.json({ success: true, from, to, result });
  } catch (err) {
    return NextResponse.json({ error: String(err), from, to }, { status: 500 });
  }
}
