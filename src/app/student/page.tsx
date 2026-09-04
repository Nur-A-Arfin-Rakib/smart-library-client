"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, BookMarked, AlertCircle } from "lucide-react";
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

  useEffect(() => {
    (async () => {
      const [{ data: bookings }, { data: borrows }] = await Promise.all([
        api.get<Booking[]>("/bookings/my"),
        api.get<BorrowRecord[]>("/books/my-borrows"),
      ]);
      setActiveBookings(bookings.filter((b) => b.status === "booked" || b.status === "checked-in").length);
      setBooksBorrowed(borrows.filter((r) => r.status === "borrowed" || r.status === "overdue").length);
      setPendingFine(borrows.reduce((sum, r) => sum + (r.finePaid ? 0 : r.liveFine || 0), 0));
    })();
  }, []);

  const stats = [
    { label: "Active bookings", value: activeBookings, icon: CalendarCheck, tone: "moss" as const },
    { label: "Books borrowed", value: booksBorrowed, icon: BookMarked, tone: "ink" as const },
    { label: "Pending fine", value: `Tk ${pendingFine}`, icon: AlertCircle, tone: "stamp" as const },
  ];

  const toneClasses = {
    moss: "bg-moss/10 text-moss dark:bg-moss/15 dark:text-moss-light",
    ink: "bg-ink/[0.06] text-ink dark:bg-white/10 dark:text-white",
    stamp: "bg-stamp/10 text-stamp dark:bg-stamp/15 dark:text-stamp-light",
  };

  return (
    <div>
      <span className="eyebrow">Student dashboard</span>
      <h1 className="mt-1 mb-1 font-serif text-2xl text-ink dark:text-white">
        Welcome, {user?.name}
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Here&apos;s an overview of your library activity.
      </p>

      <NoticeBoard />

      <div className="grid gap-4 sm:grid-cols-3">
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
              {s.value}
            </p>
            <p className="text-sm text-gray-500">{s.label}</p>
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
