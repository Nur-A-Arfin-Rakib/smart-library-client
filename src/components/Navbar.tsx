"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";

const DASHBOARD_PREFIXES = ["/student", "/librarian", "/admin", "/profile"];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (DASHBOARD_PREFIXES.some((p) => pathname?.startsWith(p))) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 dark:border-white/10 bg-paper/80 dark:bg-paper-dark/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg text-ink dark:text-white">
          <BookOpen size={19} className="text-moss" />
          Smart Library
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <>
              <Link
                href={`/${user.role}`}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-moss"
              >
                Dashboard
              </Link>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => logout()}
                className="btn-secondary !py-1.5 !px-3 text-sm"
              >
                Logout
              </motion.button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary !py-1.5 !px-3 text-sm">
                Login
              </Link>
              <Link href="/register" className="btn-primary !py-1.5 !px-3 text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
