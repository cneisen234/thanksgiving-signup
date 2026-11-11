"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

// Grab a reCAPTCHA v3 token for this action, if reCAPTCHA is configured.
async function getRecaptchaToken(action: string): Promise<string | undefined> {
  if (!RECAPTCHA_SITE_KEY) return undefined;
  const grecaptcha = (window as unknown as { grecaptcha?: Grecaptcha }).grecaptcha;
  if (!grecaptcha) return undefined;
  return new Promise((resolve) => {
    grecaptcha.ready(() => {
      grecaptcha
        .execute(RECAPTCHA_SITE_KEY as string, { action })
        .then(resolve)
        .catch(() => resolve(undefined));
    });
  });
}

type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
};

export function SignupForm({ categories }: { categories: string[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [item, setItem] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage("");

    const recaptchaToken = await getRecaptchaToken("signup");

    try {
      const res = await fetch("/api/signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, item, category, note, recaptchaToken }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.message ?? "Something went wrong. Please try again.");
        return;
      }
      // Keep the name, clear the dish so it's quick to add another.
      setItem("");
      setNote("");
      setStatus("done");
      setMessage("Added — thank you! 🧡");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">
            Your name
          </label>
          <input
            id="name"
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aunt Carol"
            maxLength={80}
            required
          />
        </div>
        <div>
          <label htmlFor="category" className="field-label">
            Category
          </label>
          <select
            id="category"
            className="field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="item" className="field-label">
          What are you bringing?
        </label>
        <input
          id="item"
          className="field"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="e.g. Pumpkin pie"
          maxLength={120}
          required
        />
      </div>

      <div>
        <label htmlFor="note" className="field-label">
          Note <span style={{ color: "var(--stone)", fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          id="note"
          className="field"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. gluten-free, bringing serving spoon"
          maxLength={280}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button type="submit" className="btn-pop" disabled={status === "saving"}>
          {status === "saving" ? "Adding…" : "Add"}
        </button>
        {message && (
          <span
            className="text-sm font-semibold"
            style={{ color: status === "error" ? "var(--cranberry)" : "var(--pine-deep)" }}
            role="status"
          >
            {message}
          </span>
        )}
      </div>
    </form>
  );
}
