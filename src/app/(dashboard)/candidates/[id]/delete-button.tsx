"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";

export function DeleteCandidateButton({
  candidateId,
  candidateName,
}: {
  candidateId: string;
  candidateName: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/candidates/${candidateId}`, { method: "DELETE" });
    router.push("/candidates");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-theme-text50">Delete {candidateName}?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs bg-red-600 hover:bg-red-700 text-theme-text px-3 py-1.5 rounded-lg font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs border border-theme-border2 text-theme-text60 hover:bg-theme-faint px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-red-500/20 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors"
    >
      <Trash2Icon className="h-3.5 w-3.5" />
      Delete candidate
    </button>
  );
}
