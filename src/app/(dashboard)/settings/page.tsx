import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserIcon, ShieldIcon, GlobeIcon, UsersIcon } from "lucide-react";
import { TeamSection } from "./TeamSection";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();

  const [members, invitations] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.invitation.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  // Filter out invitations for emails that already have accounts
  const memberEmails = new Set(members.map((m) => m.email));
  const pendingInvitations = invitations.filter((i) => !memberEmails.has(i.email));

  const serialized = members.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  const serializedInvites = pendingInvitations.map((i) => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
  }));

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserIcon className="h-4 w-4" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
              <div>
                <p className="text-sm font-medium text-white">Name</p>
                <p className="text-sm text-white/50">{session?.user?.name ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
              <div>
                <p className="text-sm font-medium text-white">Email</p>
                <p className="text-sm text-white/50">{session?.user?.email ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-white">Role</p>
                <p className="text-sm text-white/50">Administrator</p>
              </div>
              <Badge variant="default">Admin</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UsersIcon className="h-4 w-4" />
              Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeamSection
              members={serialized}
              invitations={serializedInvites}
              currentUserId={session?.user?.id ?? ""}
              inviteCode={process.env.SIGNUP_INVITE_CODE ?? ""}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GlobeIcon className="h-4 w-4" />
              Careers Page
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
              <div>
                <p className="text-sm font-medium text-white">Public URL</p>
                <p className="text-sm text-white/50 break-all">{process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL ?? "your-domain.vercel.app"}/careers</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-white">Status</p>
                <p className="text-sm text-white/50">Publicly accessible — no login required</p>
              </div>
              <Badge variant="success">Live</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldIcon className="h-4 w-4" />
              Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
              <div>
                <p className="text-sm font-medium text-white">LinkedIn</p>
                <p className="text-sm text-white/50">Job posting & candidate import</p>
              </div>
              <Badge variant={process.env.LINKEDIN_CLIENT_ID ? "success" : "secondary"}>
                {process.env.LINKEDIN_CLIENT_ID ? "Connected" : "Not configured"}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-white">AI (Claude)</p>
                <p className="text-sm text-white/50">Resume parsing, scoring & ranking</p>
              </div>
              <Badge variant={process.env.ANTHROPIC_API_KEY ? "success" : "secondary"}>
                {process.env.ANTHROPIC_API_KEY ? "Connected" : "Not configured"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
