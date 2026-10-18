"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CalendarCheck,
  BookMarked,
  ClipboardCheck,
  ScanLine,
  Undo2,
  Layers,
  LibraryBig,
  BarChart3,
  UserRound,
  Users,
  LogOut,
  BookOpen,
  Heart,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/user";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  student: [
    { href: "/student", label: "Overview", icon: LayoutDashboard },
    { href: "/student/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/student/booking", label: "Book a seat", icon: CalendarCheck },
    { href: "/student/my-bookings", label: "My bookings", icon: Layers },
    { href: "/student/books", label: "Books", icon: BookMarked },
    { href: "/student/wishlist", label: "Wishlist", icon: Heart },
  ],
  librarian: [
    { href: "/librarian", label: "Overview", icon: LayoutDashboard },
    { href: "/librarian/checkin", label: "Desk Check-in", icon: ScanLine },
    { href: "/librarian/returns", label: "Returns & Fines", icon: Undo2 },
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/users", label: "Users & roles", icon: Users },
    { href: "/admin/zones", label: "Zones & seats", icon: Layers },
    { href: "/admin/books", label: "Books", icon: LibraryBig },
    { href: "/librarian", label: "Librarian desk", icon: Undo2 },
  ],
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;
  const items = NAV_BY_ROLE[user.role];

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-ink/10 bg-white dark:border-white/10 dark:bg-paper-dark">
      <Link href="/" className="flex items-center gap-2 px-5 py-5 font-serif text-lg text-ink dark:text-white">
        <BookOpen size={18} className="text-moss" />
        Smart Library
      </Link>

      <span className="eyebrow px-5 pb-2">{user.role}</span>

      <nav className="flex-1 px-3">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="relative block">
              <div
                className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-moss/10 font-medium text-moss dark:bg-moss/15 dark:text-moss-light"
                    : "text-gray-600 hover:bg-ink/[0.04] dark:text-gray-400 dark:hover:bg-white/[0.05]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute left-0 h-6 w-0.5 rounded-full bg-moss"
                  />
                )}
                <item.icon size={17} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ink/10 p-3 dark:border-white/10">
        <Link
          href="/profile"
          className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
            pathname === "/profile"
              ? "bg-moss/10 font-medium text-moss dark:bg-moss/15 dark:text-moss-light"
              : "text-gray-600 hover:bg-ink/[0.04] dark:text-gray-400 dark:hover:bg-white/[0.05]"
          }`}
        >
          <UserRound size={17} />
          {user.name}
        </Link>
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-500 transition-colors hover:bg-stamp/[0.06] hover:text-stamp dark:text-gray-400"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
