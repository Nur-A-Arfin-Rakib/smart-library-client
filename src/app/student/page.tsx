"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarCheck, BookMarked, AlertCircle, ClipboardCheck, ArrowUpRight, Heart, AlertTriangle } from "lucide-react";
import { RequireRole } from "@/components/RequireRole";
import { NoticeBoard } from "@/components/NoticeBoard";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Booking, BorrowRecord } from "@/types/library";

function StudentDashboard() {
  const { user } = useAuth();
  const [activeBookings, setActiveBookings] = useState(0);
  const [booksBorrowed, setBooksBorrowed] = useState(0);
  const [pendingFine, setPendingFine] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [{ data: bookings }, { data: borrows }] = await Promise.all([
          api.get<Booking[]>("/bookings/my").catch(() => ({ data: [] as Booking[] })),
          api.get<BorrowRecord[]>("/books/my-borrows").catch(() => ({ data: [] as BorrowRecord[] })),
        ]);
        setActiveBookings(
          bookings.filter((b) => b.status === "booked" || b.status === "checked-in").length
        );
        setBooksBorrowed(
          borrows.filter((r) => r.status === "borrowed" || r.status === "overdue").length
        );
        setPendingFine(
          borrows.reduce(
            (sum, r) => sum + (r.finePaid ? 0 : r.liveFine || r.fine || 0),
            0
          )
        );
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = [
    { label: "Active bookings", value: activeBookings, icon: CalendarCheck, tone: "moss" as const },
    { label: "Books borrowed", value: booksBorrowed, icon: BookMarked, tone: "ink" as const },
    { label: "Pending fine", value: `Tk ${pendingFine}`, icon: AlertCircle, tone: pendingFine > 0 ? "stamp" as const : "moss" as const },
  ];

  const toneClasses = {
    moss: "bg-moss/10 text-moss dark:bg-moss/15 dark:text-moss-light",
    ink: "bg-ink/[0.06] text-ink dark:bg-white/10 dark:text-white",
    stamp: "bg-stamp/10 text-stamp dark:bg-stamp/15 dark:text-stamp-light",
  };

  const quickActions = [
    { href: "/student/booking", title: "Book a Study Seat", desc: "Select time slots and reserve a seat in your department zone.", icon: CalendarCheck },
    { href: "/student/attendance", title: "Library Attendance", desc: "Generate OTP or enter verification code for entry and exit.", icon: ClipboardCheck },
    { href: "/student/books", title: "Browse Catalog", desc: "Borrow up to 3 books, renew active borrows, or join hold lists.", icon: BookMarked },
    { href: "/student/wishlist", title: "My Wishlist", desc: "View all books you saved for future study and reading.", icon: Heart },
  ];

  return (
    <div>
      <span className="eyebrow">Student dashboard</span>
      <h1 className="mt-1 mb-1 font-serif text-2xl text-ink dark:text-white">
        Welcome, {user?.name}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Here&apos;s an overview of your active library activity.
      </p>

      {/* Overdue Fine Alert */}
      {pendingFine > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6 flex items-center justify-between border-stamp/40 bg-stamp/5 p-4 text-sm"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-stamp shrink-0" size={20} />
            <div>
              <p className="font-semibold text-stamp">You have an outstanding fine of Tk {pendingFine}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Unpaid fines block new borrowings. Please pay online or at the librarian desk.
              </p>
            </div>
          </div>
          <Link
            href="/student/books"
            className="btn-primary !bg-stamp hover:!bg-stamp-light !py-1.5 !px-3 text-xs shrink-0"
          >
            Pay Now
          </Link>
        </motion.div>
      )}

      <NoticeBoard />

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            className="card p-5"
          >
            <div className={`stat-icon mb-3 ${toneClasses[s.tone]}`}>
              <s.icon size={19} />
            </div>
            <p className="font-mono text-2xl text-ink dark:text-white">
              {loading ? "..." : s.value}
            </p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Action Navigation */}
      <h2 className="mb-3 text-base font-semibold text-ink dark:text-white">Quick Shortcuts</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((qa, i) => (
          <motion.div
            key={qa.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={qa.href}
              className="card card-hover flex h-full flex-col justify-between p-5 transition"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="stat-icon bg-moss/10 text-moss dark:bg-moss/15 dark:text-moss-light">
                    <qa.icon size={18} />
                  </div>
                  <ArrowUpRight size={16} className="text-gray-400" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-ink dark:text-white">{qa.title}</h3>
                <p className="text-xs text-gray-500">{qa.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function StudentPage() {
  return (
    <RequireRole allow={["student"]}>
      <StudentDashboard />
    </RequireRole>
  );
}
