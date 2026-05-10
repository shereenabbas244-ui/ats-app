"use client";

import { useState } from "react";

interface CandidateActionsProps {
  applicationId: string;
  currentStatus: string;
}

export function CandidateActions({ applicationId, currentStatus }: CandidateActionsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatus(newStatus);
    setLoading(false);
  }

  if (status === "HIRED" || status === "REJECTED") return null;

  return (
    <div className="flex gap-1 mt-1">
      {status === "ACTIVE" && (
        <>
          <button
            onClick={() => updateStatus("HIRED")}
            disabled={loading}
            className="text-xs bg-green-100 text-green-300 hover:bg-green-200 px-2 py-0.5 rounded-full transition-colors disabled:opacity-50"
          >
            Hire
          </button>
          <button
            onClick={() => updateStatus("REJECTED")}
            disabled={loading}
            className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-0.5 rounded-full transition-colors disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={() => updateStatus("ON_HOLD")}
            disabled={loading}
            className="text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-2 py-0.5 rounded-full transition-colors disabled:opacity-50"
          >
            Hold
          </button>
        </>
      )}
      {status === "ON_HOLD" && (
        <>
          <button
            onClick={() => updateStatus("ACTIVE")}
            disabled={loading}
            className="text-xs bg-indigo-100 text-indigo-300 hover:bg-indigo-200 px-2 py-0.5 rounded-full transition-colors disabled:opacity-50"
          >
            Reactivate
          </button>
          <button
            onClick={() => updateStatus("REJECTED")}
            disabled={loading}
            className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-0.5 rounded-full transition-colors disabled:opacity-50"
          >
            Reject
          </button>
        </>
      )}
    </div>
  );
}
