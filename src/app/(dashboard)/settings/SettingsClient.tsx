"use client";

import { useState } from "react";
import { UserIcon, LockIcon, BellIcon, MailIcon, CheckIcon, FileTextIcon, ChevronDownIcon } from "lucide-react";

interface OrgSettings {
  hrEmail: string;
  emailFromName: string;
  notifyNewApplication: boolean;
  notifyStageChange: boolean;
  notifyHired: boolean;
  notifyRejected: boolean;
  templateAppSubject: string;
  templateAppBody: string;
  templateHiredSubject: string;
  templateHiredBody: string;
  templateRejectedSubject: string;
  templateRejectedBody: string;
}

interface Props {
  userName: string;
  userEmail: string;
  orgSettings: OrgSettings;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        checked ? "bg-indigo-600" : "bg-theme-border3"
      }`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
        checked ? "translate-x-5" : "translate-x-0"
      }`} />
    </button>
  );
}

function SaveBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="flex items-center gap-1 text-xs text-green-400">
      <CheckIcon className="h-3.5 w-3.5" />
      Saved
    </span>
  );
}

const TEMPLATE_DEFS = [
  {
    label: "Application Received",
    desc: "Sent to the candidate when they submit an application",
    subjectKey: "templateAppSubject" as const,
    bodyKey: "templateAppBody" as const,
  },
  {
    label: "Candidate Hired",
    desc: "Sent to the candidate when marked as Hired",
    subjectKey: "templateHiredSubject" as const,
    bodyKey: "templateHiredBody" as const,
  },
  {
    label: "Candidate Rejected",
    desc: "Sent to the candidate when marked as Rejected",
    subjectKey: "templateRejectedSubject" as const,
    bodyKey: "templateRejectedBody" as const,
  },
];

export function SettingsClient({ userName, userEmail, orgSettings: initial }: Props) {
  // Profile
  const [name, setName] = useState(userName);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  // Email settings + templates (shared save)
  const [org, setOrg] = useState<OrgSettings>(initial);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);

  // Template accordion
  const [openTemplate, setOpenTemplate] = useState<string | null>(null);

  // Template save (separate)
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);

  async function saveProfile() {
    if (!name.trim() || profileSaving) return;
    setProfileSaving(true);
    setProfileSaved(false);
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } finally {
      setProfileSaving(false);
    }
  }

  async function savePassword() {
    if (!currentPw || !newPw || pwSaving) return;
    if (newPw !== confirmPw) { setPwError("Passwords don't match"); return; }
    if (newPw.length < 8) { setPwError("Password must be at least 8 characters"); return; }
    setPwError("");
    setPwSaving(true);
    setPwSaved(false);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setPwError(data.error ?? "Failed to update password");
      } else {
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
        setPwSaved(true);
        setTimeout(() => setPwSaved(false), 3000);
      }
    } finally {
      setPwSaving(false);
    }
  }

  async function saveEmailSettings() {
    if (emailSaving) return;
    setEmailSaving(true);
    setEmailSaved(false);
    try {
      await fetch("/api/settings/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hrEmail: org.hrEmail,
          emailFromName: org.emailFromName,
          notifyNewApplication: org.notifyNewApplication,
          notifyStageChange: org.notifyStageChange,
          notifyHired: org.notifyHired,
          notifyRejected: org.notifyRejected,
        }),
      });
      setEmailSaved(true);
      setTimeout(() => setEmailSaved(false), 3000);
    } finally {
      setEmailSaving(false);
    }
  }

  async function saveTemplates() {
    if (templateSaving) return;
    setTemplateSaving(true);
    setTemplateSaved(false);
    try {
      await fetch("/api/settings/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateAppSubject: org.templateAppSubject,
          templateAppBody: org.templateAppBody,
          templateHiredSubject: org.templateHiredSubject,
          templateHiredBody: org.templateHiredBody,
          templateRejectedSubject: org.templateRejectedSubject,
          templateRejectedBody: org.templateRejectedBody,
        }),
      });
      setTemplateSaved(true);
      setTimeout(() => setTemplateSaved(false), 3000);
    } finally {
      setTemplateSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="rounded-xl border border-theme-border bg-theme-surface p-6">
        <div className="flex items-center gap-2 mb-5">
          <UserIcon className="h-4 w-4 text-indigo-400" />
          <h2 className="text-base font-semibold text-theme-text">Profile</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-theme-text50 mb-1.5">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-theme-border bg-theme-faint px-3 py-2.5 text-sm text-theme-text focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-theme-text50 mb-1.5">Email</label>
            <input
              value={userEmail}
              disabled
              className="w-full rounded-lg border border-theme-border bg-theme-faint px-3 py-2.5 text-sm text-theme-text50 cursor-not-allowed"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-4">
          <SaveBadge show={profileSaved} />
          <button
            onClick={saveProfile}
            disabled={profileSaving || !name.trim()}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 transition-colors"
          >
            {profileSaving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-xl border border-theme-border bg-theme-surface p-6">
        <div className="flex items-center gap-2 mb-5">
          <LockIcon className="h-4 w-4 text-indigo-400" />
          <h2 className="text-base font-semibold text-theme-text">Change Password</h2>
        </div>
        <div className="space-y-3 max-w-sm">
          <div>
            <label className="block text-xs font-medium text-theme-text50 mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="w-full rounded-lg border border-theme-border bg-theme-faint px-3 py-2.5 text-sm text-theme-text focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-theme-text50 mb-1.5">New Password</label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="w-full rounded-lg border border-theme-border bg-theme-faint px-3 py-2.5 text-sm text-theme-text focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-theme-text50 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="w-full rounded-lg border border-theme-border bg-theme-faint px-3 py-2.5 text-sm text-theme-text focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          {pwError && <p className="text-xs text-red-400">{pwError}</p>}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <SaveBadge show={pwSaved} />
          <button
            onClick={savePassword}
            disabled={pwSaving || !currentPw || !newPw || !confirmPw}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 transition-colors"
          >
            {pwSaving ? "Updating…" : "Update Password"}
          </button>
        </div>
      </div>

      {/* Email & Notifications */}
      <div className="rounded-xl border border-theme-border bg-theme-surface p-6">
        <div className="flex items-center gap-2 mb-5">
          <MailIcon className="h-4 w-4 text-indigo-400" />
          <h2 className="text-base font-semibold text-theme-text">Email & Notifications</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-theme-text50 mb-1.5">HR Alert Email</label>
            <input
              type="email"
              value={org.hrEmail}
              onChange={(e) => setOrg({ ...org, hrEmail: e.target.value })}
              placeholder="hr@lobah.com"
              className="w-full rounded-lg border border-theme-border bg-theme-faint px-3 py-2.5 text-sm text-theme-text focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-xs text-theme-text40 mt-1">Receives internal alerts for new applications</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-theme-text50 mb-1.5">Sender Display Name</label>
            <input
              value={org.emailFromName}
              onChange={(e) => setOrg({ ...org, emailFromName: e.target.value })}
              placeholder="Lobah Careers"
              className="w-full rounded-lg border border-theme-border bg-theme-faint px-3 py-2.5 text-sm text-theme-text focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-xs text-theme-text40 mt-1">Appears as the sender name in candidate emails</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <BellIcon className="h-4 w-4 text-theme-text40" />
          <h3 className="text-sm font-semibold text-theme-text">Notification Triggers</h3>
        </div>

        <div className="space-y-0 divide-y divide-theme-border">
          {([
            { key: "notifyNewApplication", label: "New Application", desc: "Alert HR when a candidate applies" },
            { key: "notifyStageChange", label: "Stage Changes", desc: "Alert HR when a candidate moves stages" },
            { key: "notifyHired", label: "Candidate Hired", desc: "Email candidate when marked as Hired" },
            { key: "notifyRejected", label: "Candidate Rejected", desc: "Email candidate when marked as Rejected" },
          ] as const).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-sm font-medium text-theme-text">{label}</p>
                <p className="text-xs text-theme-text50 mt-0.5">{desc}</p>
              </div>
              <Toggle checked={org[key]} onChange={(v) => setOrg({ ...org, [key]: v })} />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 mt-5 pt-5 border-t border-theme-border">
          <SaveBadge show={emailSaved} />
          <button
            onClick={saveEmailSettings}
            disabled={emailSaving}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 transition-colors"
          >
            {emailSaving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Email Templates */}
      <div className="rounded-xl border border-theme-border bg-theme-surface p-6">
        <div className="flex items-center gap-2 mb-2">
          <FileTextIcon className="h-4 w-4 text-indigo-400" />
          <h2 className="text-base font-semibold text-theme-text">Email Templates</h2>
        </div>
        <p className="text-xs text-theme-text40 mb-5">
          Customize the emails sent to candidates. Use <code className="bg-theme-faint px-1 py-0.5 rounded text-indigo-400">{"{candidateName}"}</code> and <code className="bg-theme-faint px-1 py-0.5 rounded text-indigo-400">{"{jobTitle}"}</code> as placeholders.
        </p>

        <div className="divide-y divide-theme-border border border-theme-border rounded-lg overflow-hidden">
          {TEMPLATE_DEFS.map(({ label, desc, subjectKey, bodyKey }) => {
            const isOpen = openTemplate === label;
            return (
              <div key={label}>
                <button
                  type="button"
                  onClick={() => setOpenTemplate(isOpen ? null : label)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-theme-hover transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-theme-text">{label}</p>
                    <p className="text-xs text-theme-text40 mt-0.5">{desc}</p>
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-theme-text40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 bg-theme-faint space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-theme-text50 mb-1.5">Subject Line</label>
                      <input
                        value={org[subjectKey]}
                        onChange={(e) => setOrg({ ...org, [subjectKey]: e.target.value })}
                        className="w-full rounded-lg border border-theme-border bg-theme-surface px-3 py-2.5 text-sm text-theme-text focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-theme-text50 mb-1.5">Message Body</label>
                      <textarea
                        value={org[bodyKey]}
                        onChange={(e) => setOrg({ ...org, [bodyKey]: e.target.value })}
                        rows={5}
                        className="w-full rounded-lg border border-theme-border bg-theme-surface px-3 py-2.5 text-sm text-theme-text focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
                      />
                      <p className="text-xs text-theme-text40 mt-1">Separate paragraphs with a blank line.</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <SaveBadge show={templateSaved} />
          <button
            onClick={saveTemplates}
            disabled={templateSaving}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 transition-colors"
          >
            {templateSaving ? "Saving…" : "Save Templates"}
          </button>
        </div>
      </div>
    </div>
  );
}
