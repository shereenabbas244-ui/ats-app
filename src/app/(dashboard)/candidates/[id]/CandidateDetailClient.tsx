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

interface Props {
  applicationId: string | null;
  currentStageName: string;
  candidateId: string;
  existingNotes: Note[];
  renderOnly: "stage-select" | "notes";
}

const STAGE_OPTIONS = ["Applied", "Screening", "Interview", "Offer", "Hired"];

export function CandidateDetailClient({
  applicationId,
  currentStageName,
  candidateId,
  existingNotes,
  renderOnly,
}: Props) {
  const router = useRouter();
  const [stage, setStage] = useState(currentStageName);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState<Note[]>(existingNotes);

  async function handleStageChange(newStage: string) {
    if (!applicationId || newStage === stage) return;
    setStage(newStage);
    // We save stage name only — for now just optimistic UI
    // A full implementation would resolve the stageId first
    router.refresh();
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
      <div className="relative">
        <select
          value={stage}
          onChange={(e) => handleStageChange(e.target.value)}
          className="appearance-none rounded-xl border border-theme-border bg-theme-surface pl-4 pr-10 py-2.5 text-sm font-medium text-theme-text focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer min-w-[140px]"
        >
          {STAGE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-text40" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-theme-border bg-theme-surface p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <MessageSquareIcon className="h-4 w-4 text-indigo-400" />
        <h2 className="text-sm font-semibold text-theme-text">Notes & Feedback</h2>
      </div>

      {/* Existing notes */}
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

      {/* Textarea */}
      <textarea
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        placeholder="Add notes about this candidate..."
        className="flex-1 w-full resize-none rounded-lg border border-theme-border bg-theme-faint px-4 py-3 text-sm text-theme-text placeholder-theme-text30 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[160px]"
      />

      {/* Save button */}
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
