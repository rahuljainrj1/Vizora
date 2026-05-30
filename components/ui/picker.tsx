"use client";

import { Check, ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export type PickerOption = {
  value: string;
  label: string;
  meta?: string;
};

export function Picker({
  label,
  value,
  options,
  onChange,
  placeholder = "Select",
  className,
}: {
  label: string;
  value: string;
  options: PickerOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex h-14 w-full items-center justify-between gap-3 rounded-[12px] border border-hairline bg-surface-soft px-4 text-left shadow-[0_1px_2px_rgba(40,44,63,0.05)] outline-none transition-colors hover:border-hairline-strong focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/10",
            className,
          )}
          aria-label={label}
        >
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              {label}
            </span>
            <span className="mt-0.5 block truncate text-[15px] font-medium text-ink">
              {selected?.label ?? placeholder}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-body transition-transform",
              open ? "rotate-180" : "",
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="max-h-72 w-[var(--radix-popover-trigger-width)] overflow-y-auto"
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "flex min-h-11 w-full items-center justify-between gap-3 rounded-[8px] px-3 py-2 text-left text-[14px] transition-colors hover:bg-surface-card",
                active ? "bg-surface-card text-ink" : "text-body",
              )}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{option.label}</span>
                {option.meta ? (
                  <span className="mt-0.5 block text-xs text-muted">
                    {option.meta}
                  </span>
                ) : null}
              </span>
              {active ? <Check className="h-4 w-4 shrink-0 text-m-blue-dark" /> : null}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
