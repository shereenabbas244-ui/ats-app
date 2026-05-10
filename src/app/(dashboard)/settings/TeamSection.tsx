"use client";

import { useState } from "react";
import { Trash2Icon, MailIcon, UserPlusIcon, RefreshCwIcon, ClockIcon, CopyIcon, CheckIcon } from "lucide-react";

interface TeamMember {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  invitedBy: string;
  createdAt: string;
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-orange-100 text-orange-700",
  RECRUITER: "bg-blue-100 text-blue-700",
  HIRING_MANAGER: "bg-purple-100 text-purple-700",
};

export function TeamSection({
  members: initial,
  invitations: initialInvites,
  currentUserId,
  inviteCode,
}: {
  members: TeamMember[];
  invitations: Invitation[];
  currentUserId: string;
  inviteCode: string;
}) {
  const [members, setMembers] = useState(initial);
  const [invitations, setInvitations] = useState(initialInvites);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [cancellingEmail, setCancellingEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteMsg(null);
    const res = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });
    const data = await res.json() as { error?: string; emailSent?: boolean };
    if (res.ok) {
      const msg = data.emailSent
        ? `Invite sent to ${inviteEmail}`
        : `Invitation saved for ${inviteEmail} — email not sent (verify your domain in Resend to send emails to any address)`;
      setInviteMsg({ ok: data.emailSent ?? false, text: msg });
      setInvitations((prev) => {
        const filtered = prev.filter((i) => i.email !== inviteEmail);
        return [{ id: Date.now().toString(), email: inviteEmail, invitedBy: "You", createdAt: new Date().toISOString() }, ...filtered];
      });
      setInviteEmail("");
    } else {
      setInviteMsg({ ok: false, text: data.error ?? "Failed to send invite." });
    }
    setInviting(false);
  }

  async function handleResend(email: string) {
    setResendingEmail(email);
    const res = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json() as { emailSent?: boolean; error?: string };
    if (res.ok && data.emailSent) {
      setInviteMsg({ ok: true, text: `Invite resent to ${email}` });
    } else {
      setInviteMsg({ ok: false, text: data.error ?? "Could not resend — verify your domain in Resend first." });
    }
    setResendingEmail(null);
  }

  async function handleCancelInvite(email: string) {
    setCancellingEmail(email);
    await fetch("/api/team/invite", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setInvitations((prev) => prev.filter((i) => i.email !== email));
    setCancellingEmail(null);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    const res = await fetch("/api/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    if (res.ok) setMembers((prev) => prev.map((m) => m.id === userId ? { ...m, role: newRole } : m));
  }

  async function handleRemove(userId: string) {
    setRemovingId(userId);
    const res = await fetch("/api/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) setMembers((prev) => prev.filter((m) => m.id !== userId));
    setRemovingId(null);
    setConfirmId(null);
  }

  function copySignupLink() {
    const url = `${window.location.origin}/signup`;
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Invite */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <UserPlusIcon className="h-4 w-4 text-white/50" />
          <h3 className="text-sm font-semibold text-white/80">Invite Team Member</h3>
        </div>
        <form onSubmit={handleInvite} className="flex gap-2">
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@lobah.com"
            className="flex-1 rounded-lg border border-white/[0.08] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E55B1F]/30 focus:border-[#E55B1F]"
          />
          <button
            type="submit"
            disabled={inviting}
            className="flex items-center gap-1.5 bg-[#E55B1F] hover:bg-[#d04e15] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <MailIcon className="h-3.5 w-3.5" />
            {inviting ? "Sending…" : "Send Invite"}
          </button>
        </form>

        {/* Copy signup link */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-white/40">Or share signup link:</span>
          <button onClick={copySignupLink} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-800">
            {copied ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>

        {inviteCode && (
          <p className="text-xs text-white/40 mt-1">Invite code: <span className="font-mono font-semibold text-white/60">{inviteCode}</span></p>
        )}
        <p className="text-xs text-amber-600 mt-1">⚠ Invite emails require your domain to be verified in Resend. Until then, share the link + code manually.</p>

        {inviteMsg && (
          <p className={`text-xs mt-2 ${inviteMsg.ok ? "text-green-400" : "text-amber-600"}`}>{inviteMsg.text}</p>
        )}
      </div>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/80 mb-2 flex items-center gap-1.5">
            <ClockIcon className="h-3.5 w-3.5 text-white/40" />
            Pending Invitations ({invitations.length})
          </h3>
          <div className="space-y-1.5">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-2 px-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div>
                  <p className="text-sm text-white/90">{inv.email}</p>
                  <p className="text-xs text-white/40">Invited by {inv.invitedBy}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResend(inv.email)}
                    disabled={resendingEmail === inv.email}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-800 disabled:opacity-50"
                  >
                    <RefreshCwIcon className="h-3 w-3" />
                    {resendingEmail === inv.email ? "…" : "Resend"}
                  </button>
                  <button
                    onClick={() => handleCancelInvite(inv.email)}
                    disabled={cancellingEmail === inv.email}
                    className="text-white/30 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Member list */}
      <div>
        <h3 className="text-sm font-semibold text-white/80 mb-3">Team Members ({members.length})</h3>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-2.5 px-3 bg-white/[0.03] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xs font-bold">
                  {(m.name ?? m.email ?? "?")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {m.name ?? "—"}
                    {m.id === currentUserId && <span className="text-xs text-white/40 ml-1">(you)</span>}
                  </p>
                  <p className="text-xs text-white/50">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={m.role}
                  onChange={(e) => handleRoleChange(m.id, e.target.value)}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#E55B1F] ${roleColors[m.role] ?? "bg-white/[0.06] text-white/60"}`}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="RECRUITER">Recruiter</option>
                  <option value="HIRING_MANAGER">Hiring Manager</option>
                </select>

                {m.id !== currentUserId && (
                  confirmId === m.id ? (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleRemove(m.id)} disabled={removingId === m.id}
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded font-medium disabled:opacity-50">
                        {removingId === m.id ? "…" : "Remove"}
                      </button>
                      <button onClick={() => setConfirmId(null)} className="text-xs text-white/50 hover:text-white/80">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmId(m.id)} className="text-white/30 hover:text-red-500 transition-colors">
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
