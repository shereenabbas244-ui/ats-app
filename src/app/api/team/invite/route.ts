import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendTeamInvite } from "@/lib/email";

function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://your-app.vercel.app";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email } = await req.json() as { email: string };
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const inviteCode = process.env.SIGNUP_INVITE_CODE;
  if (!inviteCode) return NextResponse.json({ error: "SIGNUP_INVITE_CODE is not configured." }, { status: 500 });

  // Save/update invitation record
  await prisma.invitation.upsert({
    where: { email },
    update: { invitedBy: session.user.name ?? session.user.email ?? "Admin", createdAt: new Date() },
    create: { email, invitedBy: session.user.name ?? session.user.email ?? "Admin" },
  });

  // Try to send email (may fail if domain not verified)
  const emailSent = await (async () => {
    if (!process.env.RESEND_API_KEY) return false;
    try {
      await sendTeamInvite({
        toEmail: email,
        inviterName: session.user.name ?? "Your team",
        inviteCode,
        signupUrl: `${getAppUrl()}/signup`,
      });
      return true;
    } catch {
      return false;
    }
  })();

  return NextResponse.json({ success: true, emailSent });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email } = await req.json() as { email: string };
  await prisma.invitation.delete({ where: { email } }).catch(() => null);
  return NextResponse.json({ success: true });
}
