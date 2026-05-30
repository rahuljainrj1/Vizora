import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<"select">
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-12 w-full rounded-[4px] border border-hairline bg-surface-card px-4 text-[15px] font-normal text-ink outline-none transition-colors focus:border-ink",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
