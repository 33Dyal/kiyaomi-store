"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * A Link styled as a Button. Exists because Server Components (like the
 * homepage) can't pass a component reference (e.g. `Link`) as a prop into
 * a Client Component (`Button`) — only serializable values cross that
 * boundary. This component imports Link itself, so callers only ever pass
 * plain strings/children, which are safe from a Server Component.
 */
const variants = {
  primary: "bg-kiyomi-ink text-kiyomi-cream hover:bg-kiyomi-terracotta",
  secondary: "bg-transparent border border-kiyomi-ink text-kiyomi-ink hover:bg-kiyomi-ink hover:text-kiyomi-cream",
};

export function ButtonLink({ href, variant = "primary", className, children }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm tracking-wide uppercase transition-colors",
        variants[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}
