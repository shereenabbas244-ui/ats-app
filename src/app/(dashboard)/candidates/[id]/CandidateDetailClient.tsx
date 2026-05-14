"use client";

import { useState } from "react";
import { MessageSquareIcon, ChevronDownIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Note {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

interface StageOption {
  id: string;
  name: string;
}

interface Props {
  applicationId: string | null;
  currentStageName: string;
  currentStatus: string;
  candidateId: string;
  existingNotes: Note[];
  stageOptions?: StageOption[];
  renderOnly: "stage-select" | "notes";
}

const STAGE_OPTIONS = ["Applied", "Screening", "Interview", "Offer", "Hired"];

export function CandidateDetailClient({
  applicationId,
  currentStageName,
  currentStatus,
  candidateId,
  existingNotes,
  stageOptions,
  renderOnly,
}: Props) {
  const router = useRouter();
  const [stage, setStage] = useState(currentStageName);
  const [status, setStatus] = useState(currentStatus);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [notes, setNotes] = useState<Note[]>(existingNotes);

  const [stageLoading, setStageLoading] = useState(false);

  async function handleStageChange(newStage: string) {
    if (!applicationId || newStage === stage || stageLoading) return;
    const stageId = stageOptions?.find((s) => s.name === newStage)?.id;
    if (!stageId) return;
    setStageLoading(true);
    try {
      await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId }),
      });
      setStage(newStage);
      router.refresh();
    } finally {
      setStageLoading(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!applicationId || statusLoading) return;
    setStatusLoading(true);
    try {
      await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
      router.refresh();
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleSaveNote() {
    if (!noteText.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, content: noteText }),
      });
      if (res.ok) {
        const note = await res.json() as { id: string; content: string; author: { name: string }; createdAt: string };
        setNotes((prev) => [{
          id: note.id,
          content: note.content,
          authorName: note.author?.name ?? "You",
          createdAt: note.createdAt,
        }, ...prev]);
        setNoteText("");
      }
    } finally {
      setSaving(false);
    }
  }

  if (renderOnly === "stage-select") {
    return (
      <div className="flex items-center gap-2">
        {/* Stage select */}
        <div className="relative">
          <select
            value={stage}
            disabled={stageLoading}
            onChange={(e) => handleStageChange(e.target.value)}
            className="appearance-none rounded-xl border border-theme-border bg-theme-surface pl-4 pr-10 py-2.5 text-sm font-medium text-theme-text focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer min-w-[140px] disabled:opacity-60"
          >
            {(stageOptions ?? STAGE_OPTIONS.map((n) => ({ id: n, name: n }))).map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-text40" />
        </div>

        {/* Status action buttons */}
        {applicationId && status !== "HIRED" && status !== "REJECTED" && (
          <>
            <button
              onClick={() => handleStatusChange("HIRED")}
              disabled={statusLoading}
              className="rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 text-xs font-semibold px-3 py-2 transition-colors disabled:opacity-50"
            >
              Hire
            </button>
            <button
              onClick={() => handleStatusChange("REJECTED")}
              disabled={statusLoading}
              className="rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-semibold px-3 py-2 transition-colors disabled:opacity-50"
            >
              Reject
            </button>
            {status !== "ON_HOLD" && (
              <button
                onClick={() => handleStatusChange("ON_HOLD")}
                disabled={statusLoading}
                className="rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 text-xs font-semibold px-3 py-2 transition-colors disabled:opacity-50"
              >
                Hold
              </button>
            )}
          </>
        )}
        {applicationId && status === "ON_HOLD" && (
          <button
            onClick={() => handleStatusChange("ACTIVE")}
            disabled={statusLoading}
            className="rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-xs font-semibold px-3 py-2 transition-colors disabled:opacity-50"
          >
            Reactivate
          </button>
        )}
        {(status === "HIRED" || status === "REJECTED") && (
          <span className={`text-xs font-semibold px-3 py-2 rounded-lg border ${
            status === "HIRED"
              ? "bg-green-600/20 text-green-400 border-green-500/30"
              : "bg-red-600/20 text-red-400 border-red-500/30"
          }`}>
            {status === "HIRED" ? "Hired" : "Rejected"}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-theme-border bg-theme-surface p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <MessageSquareIcon className="h-4 w-4 text-indigo-400" />
        <h2 className="text-sm font-semibold text-theme-text">Notes & Feedback</h2>
      </div>

      {notes.length > 0 && (
        <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
          {notes.map((n) => (
            <div key={n.id} className="border-l-2 border-indigo-500/40 pl-3">
              <p className="text-sm text-theme-text80">{n.content}</p>
              <p className="text-xs text-theme-text40 mt-0.5">
                {n.authorName} · {formatDate(n.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      <textarea
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        placeholder="Add notes about this candidate..."
        className="flex-1 w-full resize-none rounded-lg border border-theme-border bg-theme-faint px-4 py-3 text-sm text-theme-text placeholder-theme-text30 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[160px]"
      />

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSaveNote}
          disabled={!noteText.trim() || saving}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
        >
          {saving ? "Saving…" : "Save Notes"}
        </button>
      </div>
    </div>
  );
}
