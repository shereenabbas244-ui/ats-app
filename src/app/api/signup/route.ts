import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  inviteCode: z.string(),
});

export async function POST(req: NextRequest) {
  const body = await req.json() as unknown;

  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(body);
  } catch {
    return NextResponse.json({ error: "Please fill in all fields correctly. Password must be at least 8 characters." }, { status: 400 });
  }

  const validCode = process.env.SIGNUP_INVITE_CODE;
  if (!validCode || data.inviteCode !== validCode) {
    return NextResponse.json({ error: "Invalid invite code. Contact your administrator." }, { status: 403 });
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const hashed = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      role: "RECRUITER",
    },
  });

  return NextResponse.json({ success: true });
}
