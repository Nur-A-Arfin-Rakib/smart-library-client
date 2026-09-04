"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const DASHBOARD_PREFIXES = ["/student", "/librarian", "/admin", "/profile"];

export function ContentFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboard = DASHBOARD_PREFIXES.some((p) => pathname?.startsWith(p));

  if (isDashboard) return <>{children}</>;

  return <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>;
}
