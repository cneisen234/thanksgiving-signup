"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ id, label }: { id: number; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (busy) return;
    if (!confirm(`Remove "${label}" from the list?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/signups?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      className="delete-btn"
      aria-label={`Remove ${label}`}
      title="Remove"
    >
      {busy ? "…" : "×"}
    </button>
  );
}
