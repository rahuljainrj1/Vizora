import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "outline" | "accent";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[2px] border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
        variant === "default" &&
          "border-hairline bg-surface-card text-body-strong",
        variant === "outline" && "border-hairline bg-transparent text-body",
        variant === "accent" && "border-ink bg-ink text-on-primary",
        className,
      )}
      {...props}
    />
  );
}
