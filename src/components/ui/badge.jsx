import { cn } from "@/lib/utils/cn";

export function Badge({ children, tone = "default", className }) {
  const tones = {
    default: "bg-kiyomi-sandDark text-kiyomi-ink",
    sale: "bg-kiyomi-terracotta text-white",
    new: "bg-kiyomi-ink text-white",
    outline: "border border-kiyomi-ink text-kiyomi-ink",
  };
  return (
    <span className={cn("inline-block px-2 py-1 text-[10px] uppercase tracking-wider", tones[tone], className)}>
      {children}
    </span>
  );
}
