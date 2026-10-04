"use client";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

// NOTE: the `as` prop only works when Button is used from another Client
// Component. A Server Component can't pass a component reference (e.g.
// Next's Link) as a prop into a Client Component — only serializable
// values cross that boundary. For links rendered from a Server Component
// (like the homepage), use ButtonLink instead.
const variants = {
  primary: "bg-kiyomi-ink text-kiyomi-cream hover:bg-kiyomi-terracotta",
  secondary: "bg-transparent border border-kiyomi-ink text-kiyomi-ink hover:bg-kiyomi-ink hover:text-kiyomi-cream",
  ghost: "bg-transparent text-kiyomi-ink hover:bg-kiyomi-sandDark",
  destructive: "bg-red-700 text-white hover:bg-red-800",
};

export function Button({
  as: Comp = "button",
  variant = "primary",
  loading = false,
  disabled,
  className,
  children,
  ...props
}) {
  return (
    <Comp
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm tracking-wide uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </Comp>
  );
}
