"use client";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export function Tabs({ tabs, initial = 0 }) {
  const [active, setActive] = useState(initial);
  return (
    <div>
      <div role="tablist" className="flex gap-6 border-b border-kiyomi-sandDark">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={cn(
              "border-b-2 border-transparent py-3 text-sm uppercase tracking-wide",
              active === i && "border-kiyomi-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="py-6">{tabs[active].content}</div>
    </div>
  );
}
