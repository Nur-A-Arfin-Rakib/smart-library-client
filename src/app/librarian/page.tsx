"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, BookOpenCheck, Undo2 } from "lucide-react";
import { RequireRole } from "@/components/RequireRole";
import { NoticeBoard } from "@/components/NoticeBoard";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface DailySummary {
  checkInsToday: number;
  booksIssuedToday: number;
  booksReturnedToday: number;
  attendanceToday: number;
}

function LibrarianDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DailySummary | null>(null);

  useEffect(() => {
    api.get<DailySummary>("/librarian/daily-summary").then((res) => setSummary(res.data));
  }, []);

  const stats = [
    { label: "Checked in today", value: summary?.checkInsToday ?? 0, icon: Users, tone: "moss" as const },
    { label: "Books issued today", value: summary?.booksIssuedToday ?? 0, icon: BookOpenCheck, tone: "ink" as const },
    { label: "Books returned today", value: summary?.booksReturnedToday ?? 0, icon: Undo2, tone: "brass" as const },
  ];

  const toneClasses = {
    moss: "bg-moss/10 text-moss dark:bg-moss/15 dark:text-moss-light",
    ink: "bg-ink/[0.06] text-ink dark:bg-white/10 dark:text-white",
    brass: "bg-brass/10 text-brass dark:bg-brass/15",
  };

  return (
    <div>
      <span className="eyebrow">Librarian panel</span>
      <h1 className="mt-1 mb-1 font-serif text-2xl text-ink dark:text-white">
        Today&apos;s desk
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Signed in as {user?.name} — monitor attendance and manage book issue/return.
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
            <p className="font-mono text-2xl text-ink dark:text-white">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function LibrarianPage() {
  return (
    <RequireRole allow={["librarian"]}>
      <LibrarianDashboard />
    </RequireRole>
  );
}
