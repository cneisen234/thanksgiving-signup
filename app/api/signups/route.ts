// /api/signups — GET the list, POST a new signup (reCAPTCHA-protected).

import { listSignups, addSignup, deleteSignup, CATEGORIES, type Category } from "@/lib/db";
import { verifyRecaptcha } from "@/lib/recaptcha";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const signups = await listSignups();
    return Response.json({ ok: true, signups });
  } catch {
    return Response.json(
      { ok: false, message: "Couldn't load the list. Please try again." },
      { status: 500 },
    );
  }
}

type Body = {
  name?: string;
  item?: string;
  category?: string;
  note?: string;
  recaptchaToken?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const item = body.item?.trim() ?? "";
  const category = body.category?.trim() ?? "";
  const note = body.note?.trim() || null;

  if (!name) {
    return Response.json({ ok: false, message: "Please add your name." }, { status: 400 });
  }
  if (!item) {
    return Response.json(
      { ok: false, message: "Let us know what you're bringing." },
      { status: 400 },
    );
  }
  if (!CATEGORIES.includes(category as Category)) {
    return Response.json({ ok: false, message: "Please pick a category." }, { status: 400 });
  }
  if (name.length > 80 || item.length > 120 || (note && note.length > 280)) {
    return Response.json({ ok: false, message: "That's a bit too long." }, { status: 400 });
  }

  // reCAPTCHA v3 — block bots before touching the database.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const recaptcha = await verifyRecaptcha(body.recaptchaToken, "signup", ip);
  if (!recaptcha.ok) {
    return Response.json(
      { ok: false, message: "We couldn't verify your request. Please try again." },
      { status: 403 },
    );
  }

  try {
    const signup = await addSignup({
      name,
      item,
      category: category as Category,
      note,
    });
    return Response.json({ ok: true, signup });
  } catch {
    return Response.json(
      { ok: false, message: "Couldn't save that. Please try again." },
      { status: 500 },
    );
  }
}

// DELETE /api/signups?id=123 — remove one signup. No authorization (anyone at
// the table can take an item off), by request.
export async function DELETE(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ ok: false, message: "Invalid id." }, { status: 400 });
  }
  try {
    await deleteSignup(id);
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { ok: false, message: "Couldn't remove that. Please try again." },
      { status: 500 },
    );
  }
}
