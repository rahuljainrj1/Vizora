"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, BookOpen, Settings, UsersRound } from "lucide-react";
import { useBootstrapQuery, useSessionsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/products", label: "Products", icon: Boxes, countKey: "products" },
  { href: "/catalog", label: "Catalog", icon: BookOpen, countKey: "catalogs" },
  { href: "/sessions", label: "Sessions", icon: UsersRound, countKey: "sessions" },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

type HeaderCounts = {
  products?: number;
  catalogs?: number;
  sessions?: number;
};

export function AdminNav() {
  const pathname = usePathname();
  const { data: bootstrap } = useBootstrapQuery();
  const { data: sessionData } = useSessionsQuery();
  const counts: HeaderCounts = {
    products: bootstrap?.products.length,
    catalogs: bootstrap?.catalogs.length,
    sessions: sessionData?.sessions.length,
  };

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const count =
          "countKey" in item ? counts[item.countKey as keyof HeaderCounts] : undefined;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-11 items-center gap-2 rounded-[4px] px-3 text-[13px] font-medium text-body transition-colors hover:bg-surface-card hover:text-ink sm:px-4",
              active &&
                "bg-surface-card text-ink shadow-[inset_0_0_0_1px_var(--hairline)]",
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.label}</span>
            {typeof count === "number" ? (
              <span
                className={cn(
                  "grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                  active
                    ? "bg-m-blue-dark text-on-primary"
                    : "bg-surface-elevated text-muted",
                )}
              >
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
