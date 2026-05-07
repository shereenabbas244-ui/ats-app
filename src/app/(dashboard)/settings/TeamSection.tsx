"use client";

import { useState } from "react";
import { Trash2Icon, MailIcon, UserPlusIcon } from "lucide-react";

interface TeamMember {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
}

export function TeamSection({
  members: initial,
  currentUserId,
}: {
  members: TeamMember[];
  currentUserId: string;
}) {
  const [members, setMembers] = useState(initial);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteMsg(null);
    const res = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });
    const data = await res.json() as { error?: string };
    if (res.ok) {
      setInviteMsg({ ok: true, text: `Invite sent to ${inviteEmail}` });
      setInviteEmail("");
    } else {
      setInviteMsg({ ok: false, text: data.error ?? "Failed to send invite." });
    }
    setInviting(false);
  }

  async function handleRemove(userId: string) {
    setRemovingId(userId);
    const res = await fetch("/api/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== userId));
    }
    setRemovingId(null);
    setConfirmId(null);
  }

  const roleLabel: Record<string, string> = {
    ADMIN: "Admin",
    RECRUITER: "Recruiter",
    HIRING_MANAGER: "Hiring Manager",
  };

  return (
    <div className="space-y-6">
      {/* Invite */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <UserPlusIcon className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">Invite Team Member</h3>
        </div>
        <form onSubmit={handleInvite} className="flex gap-2">
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@lobah.com"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E55B1F]/30 focus:border-[#E55B1F]"
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
        {inviteMsg && (
          <p className={`text-xs mt-2 ${inviteMsg.ok ? "text-green-600" : "text-red-500"}`}>
            {inviteMsg.text}
          </p>
        )}
      </div>

      {/* Member list */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Team Members ({members.length})
        </h3>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xs font-bold">
                  {(m.name ?? m.email ?? "?")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.name ?? "—"}</p>
                  <p className="text-xs text-gray-500">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  m.role === "ADMIN" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {roleLabel[m.role] ?? m.role}
                </span>
                {m.id !== currentUserId && (
                  confirmId === m.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRemove(m.id)}
                        disabled={removingId === m.id}
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded font-medium disabled:opacity-50"
                      >
                        {removingId === m.id ? "…" : "Remove"}
                      </button>
                      <button onClick={() => setConfirmId(null)} className="text-xs text-gray-500 hover:text-gray-700">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(m.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
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
