"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ id, label }: { id: number; label: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Close on Escape while the dialog is open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy]);

  async function confirmDelete() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/signups?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Couldn't remove that. Please try again.");
        setBusy(false);
        return;
      }
      setOpen(false);
      setBusy(false);
      router.refresh();
    } catch {
      setError("Couldn't remove that. Please try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="delete-btn"
        aria-label={`Remove ${label}`}
        title="Remove"
      >
        ×
      </button>

      {open && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!busy) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`confirm-title-${id}`}
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id={`confirm-title-${id}`} className="text-xl">
              Remove this dish?
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--ash)" }}>
              This takes <strong style={{ color: "var(--charcoal)" }}>{label}</strong> off the
              list for good. This can&apos;t be undone.
            </p>
            {error && (
              <p className="mt-3 text-sm font-semibold" style={{ color: "var(--cranberry)" }}>
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button type="button" className="btn-pop" onClick={confirmDelete} disabled={busy}>
                {busy ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
