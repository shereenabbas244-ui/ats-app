import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  hrEmail: z.string().email().optional(),
  emailFromName: z.string().min(1).optional(),
  notifyNewApplication: z.boolean().optional(),
  notifyStageChange: z.boolean().optional(),
  notifyHired: z.boolean().optional(),
  notifyRejected: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.orgSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", updatedAt: new Date() },
    update: {},
  });

  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as unknown;
  const data = schema.parse(body);

  const settings = await prisma.orgSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data, updatedAt: new Date() },
    update: { ...data, updatedAt: new Date() },
  });

  return NextResponse.json(settings);
}
