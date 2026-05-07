import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendTeamInvite } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email } = await req.json() as { email: string };
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const inviteCode = process.env.SIGNUP_INVITE_CODE;
  if (!inviteCode) return NextResponse.json({ error: "SIGNUP_INVITE_CODE is not set in environment variables." }, { status: 500 });

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email is not configured (RESEND_API_KEY missing). Share the signup link manually." }, { status: 500 });
  }

  // Fix operator precedence — evaluate VERCEL_URL separately
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? vercelUrl ?? "https://your-app.vercel.app";

  try {
    await sendTeamInvite({
      toEmail: email,
      inviterName: session.user.name ?? "Your team",
      inviteCode,
      signupUrl: `${appUrl}/signup`,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[invite]", err);
    return NextResponse.json({ error: `Failed to send email: ${String(err)}` }, { status: 500 });
  }
}
