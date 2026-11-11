import { listSignups, CATEGORIES, type Signup } from "@/lib/db";
import { SignupForm } from "@/components/SignupForm";
import { RecaptchaNote } from "@/components/RecaptchaNote";
import { DeleteButton } from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  let signups: Signup[] = [];
  let dbError = false;
  try {
    signups = await listSignups();
  } catch {
    dbError = true;
  }

  const byCategory = CATEGORIES.map((category) => ({
    category,
    items: signups.filter((s) => s.category === category),
  }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      {/* Header */}
      <header className="text-center fade-in-up">
        <p className="eyebrow">Family Thanksgiving</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">What Are You Bringing?</h1>
        <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg" style={{ color: "var(--ash)" }}>
          Add your name and what you&apos;re bringing
        </p>
        <div className="divider-leaf mt-6" aria-hidden>
          🍁
        </div>
      </header>

      {/* Form */}
      <section className="mt-8 fade-in-up" style={{ animationDelay: "0.08s" }}>
        <div className="card-pop p-6 sm:p-8">
          <h2 className="text-2xl">Add your dish</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--stone)" }}>
            Takes a few seconds. You can add more than one.
          </p>
          <div className="mt-5">
            <SignupForm categories={[...CATEGORIES]} />
          </div>
          <p className="mt-4 text-center text-xs" style={{ color: "var(--stone)" }}>
            <RecaptchaNote />
          </p>
        </div>
      </section>

      {/* The sheet */}
      <section className="mt-12 fade-in-up" style={{ animationDelay: "0.16s" }}>
        <div className="flex items-end justify-between">
          <h2 className="text-2xl">List</h2>
          <span className="text-sm" style={{ color: "var(--stone)" }}>
            {signups.length} {signups.length === 1 ? "dish" : "dishes"} so far
          </span>
        </div>

        {dbError ? (
          <div className="card-soft mt-5 p-6 text-center" style={{ color: "var(--ash)" }}>
            The list isn&apos;t connected yet. Once the database is set up, everyone&apos;s dishes
            will show up here.
          </div>
        ) : signups.length === 0 ? (
          <div className="card-soft mt-5 p-8 text-center">
            <p className="text-lg" style={{ color: "var(--ash)" }}>
              Nothing on the table yet 🍽️
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--stone)" }}>
              Be the first to sign up above.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-6">
            {byCategory.map(({ category, items }) =>
              items.length === 0 ? null : (
                <div key={category} className="card-soft p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl">{category}</h3>
                    <span className="count-pill">{items.length}</span>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {items.map((s) => (
                      <li
                        key={s.id}
                        className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t pt-3 first:border-t-0 first:pt-0"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <div className="min-w-0">
                          <span className="font-bold" style={{ color: "var(--charcoal)" }}>
                            {s.item}
                          </span>
                          {s.note && (
                            <span className="ml-2 text-sm" style={{ color: "var(--stone)" }}>
                              — {s.note}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--ash)" }}>
                          <span>{s.name}</span>
                          <DeleteButton id={s.id} label={s.item} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      <footer className="mt-14 text-center text-xs" style={{ color: "var(--stone)" }}>
        See you on Thanksgiving. 🦃
      </footer>
    </main>
  );
}
