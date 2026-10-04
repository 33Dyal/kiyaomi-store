import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function CheckoutStepper({ steps, current }) {
  return (
    <ol className="flex items-center justify-between text-xs">
      {steps.map((label, i) => (
        <li key={label} className="flex flex-1 items-center gap-2">
          <span
            className={cn(
              "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-[11px]",
              i < current ? "border-kiyomi-ink bg-kiyomi-ink text-white" :
              i === current ? "border-kiyomi-ink text-kiyomi-ink" : "border-kiyomi-sandDark text-kiyomi-muted"
            )}
          >
            {i < current ? <Check className="h-3 w-3" /> : i + 1}
          </span>
          <span className={cn("hidden sm:inline", i === current ? "text-kiyomi-ink" : "text-kiyomi-muted")}>{label}</span>
          {i < steps.length - 1 && <span className="mx-2 h-px flex-1 bg-kiyomi-sandDark" />}
        </li>
      ))}
    </ol>
  );
}
