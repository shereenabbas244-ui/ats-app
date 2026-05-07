import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET() {
  const hasKey = !!process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
  const to = process.env.HR_EMAIL ?? "(not set — defaulting to hr@lobah.com)";

  if (!hasKey) {
    return NextResponse.json({
      error: "RESEND_API_KEY is not set in Vercel environment variables",
      from,
      to,
    }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const result = await resend.emails.send({
      from,
      to: process.env.HR_EMAIL ?? "hr@lobah.com",
      subject: "Lobah ATS — email test",
      html: "<p>If you received this, HR alert emails are working correctly.</p>",
    });
    return NextResponse.json({
      success: true,
      from,
      to,
      resendId: result.data?.id,
      note: "Email was accepted by Resend. If not received, check spam or verify your domain at resend.com/domains",
    });
  } catch (err) {
    return NextResponse.json({ error: String(err), from, to }, { status: 500 });
  }
}
