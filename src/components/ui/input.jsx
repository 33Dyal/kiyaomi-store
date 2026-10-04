"use client";
import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

export const Input = forwardRef(function Input({ label, error, className, id, ...props }, ref) {
  const inputId = id || props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm text-kiyomi-muted">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          "border border-kiyomi-sandDark bg-white px-4 py-3 text-sm focus-visible:ring-0",
          error && "border-red-600",
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
