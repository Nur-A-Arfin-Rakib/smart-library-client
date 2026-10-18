"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, LibraryBig, BadgeDollarSign, Layers, ArrowUpRight, BarChart3, Undo2 } from "lucide-react";
import { RequireRole } from "@/components/RequireRole";
import { NoticeBoard } from "@/components/NoticeBoard";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface Overview {
  totalStudents: number;
  totalBooks: number;
  totalZones: number;
  activeBorrows: number;
  pendingFineTotal: number;
}

function AdminDashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<Overview>("/admin/analytics/overview");
        setOverview(res.data);
      } catch (err) {
        console.error("Failed to load overview stats:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = [
    { label: "Total students", value: overview?.totalStudents ?? 0, icon: Users, tone: "moss" as const },
    { label: "Total books", value: overview?.totalBooks ?? 0, icon: LibraryBig, tone: "ink" as const },
    { label: "Pending fines", value: `Tk ${overview?.pendingFineTotal ?? 0}`, icon: BadgeDollarSign, tone: "stamp" as const },
    { label: "Active zones", value: overview?.totalZones ?? 0, icon: Layers, tone: "brass" as const },
  ];

  const toneClasses = {
    moss: "bg-moss/10 text-moss dark:bg-moss/15 dark:text-moss-light",
    ink: "bg-ink/[0.06] text-ink dark:bg-white/10 dark:text-white",
    stamp: "bg-stamp/10 text-stamp dark:bg-stamp/15 dark:text-stamp-light",
    brass: "bg-brass/10 text-brass dark:bg-brass/15",
  };

  const quickLinks = [
    { href: "/admin/analytics", title: "Analytics & Trends", desc: "View 7-day bookings chart and most popular study zones.", icon: BarChart3 },
    { href: "/admin/users", title: "Users & Roles", desc: "Promote/demote accounts between Student, Librarian, and Admin.", icon: Users },
    { href: "/admin/zones", title: "Zones & Seats", desc: "Create study zones, add seats, and set department access limits.", icon: Layers },
    { href: "/admin/books", title: "Manage Books", desc: "Catalog management, shelf locations, and book inventories.", icon: LibraryBig },
    { href: "/librarian", title: "Librarian Desk", desc: "Direct access to desk check-in, returns, and cash collection.", icon: Undo2 },
  ];

  return (
    <div>
      <span className="eyebrow">Admin control panel</span>
      <h1 className="mt-1 mb-1 font-serif text-2xl text-ink dark:text-white">
        System Overview
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Signed in as {user?.name} — complete management of campus library services.
      </p>

      {/* Notice Board with broadcast composer */}
      <NoticeBoard canManage={true} />

      {/* Metrics Row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Quick Navigation Cards */}
      <h2 className="mb-3 text-base font-semibold text-ink dark:text-white">Management Modules</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((ql, i) => (
          <motion.div
            key={ql.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={ql.href}
              className="card card-hover flex h-full flex-col justify-between p-5 transition"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="stat-icon bg-ink/[0.05] text-ink dark:bg-white/10 dark:text-white">
                    <ql.icon size={18} />
                  </div>
                  <ArrowUpRight size={16} className="text-gray-400 group-hover:text-moss" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-ink dark:text-white">{ql.title}</h3>
                <p className="text-xs text-gray-500">{ql.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireRole allow={["admin"]}>
      <AdminDashboard />
    </RequireRole>
  );
}
