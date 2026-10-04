"use client";

import { Breadcrumb } from "@/components/ui/breadcrumb";

const zones = [
  {
    eyebrow: "ZONE 01",
    title: "Within Nairobi",
    stat: "Free",
    statLabel: "over KES 5,000",
    dark: false,
    description: (
      <>
        Free delivery within Nairobi on orders over KES 5,000. Delivery fees and
        timelines are otherwise calculated at checkout based on your delivery zone.
      </>
    ),
  },
  {
    eyebrow: "ZONE 02",
    title: "Rest of Kenya",
    stat: "—",
    statLabel: "calculated at checkout",
    dark: false,
    description: (
      <>
        Delivered outside Nairobi by tracked courier. Fees and timelines are
        calculated at checkout based on your delivery zone.
      </>
    ),
  },
  {
    eyebrow: "ZONE 03",
    title: "Get in touch",
    stat: "24/7",
    statLabel: "support",
    dark: true,
    description: (
      <>
        Have a question we haven't answered here? Reach out through our{" "}
        <a href="/support" className="underline">
          contact page
        </a>{" "}
        and a person will answer.
      </>
    ),
  },
];

const sections = [
  {
    title: "About",
    content: (
      <p>
        Kiyomi is a small studio focused on considered, everyday pieces. Every item
        is designed with care and produced in limited runs.
      </p>
    ),
  },
  {
    title: "Shipping",
    content: (
      <p>
        <strong className="text-kiyomi-ink">Delivery zones:</strong> Delivery fees
        and timelines are calculated at checkout based on your delivery zone. See our
        full{" "}
        <a href="/shipping" className="underline">
          shipping policy
        </a>{" "}
        for details.
      </p>
    ),
  },
  {
    title: "Returns",
    content: (
      <p>
        Eligible items can be returned within the window set in our{" "}
        <a href="/returns" className="underline">
          returns policy
        </a>
        . Items must be unworn, unwashed, and in their original packaging.
      </p>
    ),
  },
];

const faqs = [
  {
    q: "How do I track my order?",
    a: (
      <>
        Once your order ships, you'll receive a tracking link by email. You can also
        check the status anytime from your{" "}
        <a href="/account" className="underline">
          account
        </a>{" "}
        page.
      </>
    ),
  },
  {
    q: "Can I change or cancel my order?",
    a: "Contact us as soon as possible after placing your order — we can usually make changes before it ships.",
  },
  {
    q: "Do you offer gift wrapping?",
    a: "Not yet, but it's on our roadmap. Stay tuned.",
  },
];

export default function InfoPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-16">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Info" },
        ]}
      />

      <p className="mt-8 text-xs uppercase tracking-widest text-kiyomi-muted">
        Info
      </p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight md:text-5xl">
        Everything you need to know, in one place.
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-kiyomi-muted">
        About us, how delivery works, and what to do if something isn't right.
      </p>

      {/* Zone-style highlight cards */}
      <div className="mt-14 grid gap-px overflow-hidden border border-kiyomi-sandDark bg-kiyomi-sandDark md:grid-cols-3">
        {zones.map((zone) => (
          <div
            key={zone.title}
            className={`p-8 ${
              zone.dark
                ? "bg-kiyomi-ink text-kiyomi-cream"
                : "bg-kiyomi-cream text-kiyomi-ink"
            }`}
          >
            <p
              className={`text-xs uppercase tracking-widest ${
                zone.dark ? "text-kiyomi-cream/60" : "text-kiyomi-muted"
              }`}
            >
              {zone.eyebrow}
            </p>
            <h2 className="mt-2 font-display text-xl">{zone.title}</h2>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-4xl">{zone.stat}</span>
              <span
                className={`text-xs uppercase tracking-wide ${
                  zone.dark ? "text-kiyomi-cream/60" : "text-kiyomi-muted"
                }`}
              >
                {zone.statLabel}
              </span>
            </div>
            <p
              className={`mt-4 text-sm leading-relaxed ${
                zone.dark ? "text-kiyomi-cream/80" : "text-kiyomi-muted"
              }`}
            >
              {zone.description}
            </p>
          </div>
        ))}
      </div>

      {/* Plain content grid */}
      <div className="mt-16 border-t border-kiyomi-sandDark pt-12">
        <div className="grid gap-10 md:grid-cols-3">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-display text-lg">{section.title}</h3>
              <div className="mt-3 text-sm leading-relaxed text-kiyomi-muted">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 border-t border-kiyomi-sandDark pt-12">
        <h3 className="font-display text-lg">FAQ</h3>
        <div className="mt-6 max-w-2xl divide-y divide-kiyomi-sandDark">
          {faqs.map((item) => (
            <div key={item.q} className="py-4">
              <p className="text-sm text-kiyomi-ink">{item.q}</p>
              <p className="mt-1 text-sm leading-relaxed text-kiyomi-muted">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}