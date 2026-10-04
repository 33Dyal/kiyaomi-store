import { cn } from "@/lib/utils/cn";

export function Card({ className, children }) {
  return <div className={cn("bg-white border border-kiyomi-sandDark", className)}>{children}</div>;
}
