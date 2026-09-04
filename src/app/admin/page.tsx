"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, LibraryBig, BadgeDollarSign, Layers } from "lucide-react";
import { RequireRole } from "@/components/RequireRole";
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

  useEffect(() => {
    api.get<Overview>("/admin/analytics/overview").then((res) => setOverview(res.data));
  }, []);

  const stats = [
    { label: "Total students", value: overview?.totalStudents ?? 0, icon: Users, tone: "moss" as const },
    { label: "Total books", value: overview?.totalBooks ?? 0, icon: LibraryBig, tone: "ink" as const },
    { label: "Pending fines", value: `Tk ${overview?.pendingFineTotal ?? 0}`, icon: BadgeDollarSign, tone: "stamp" as const },
    { label: "Zones", value: overview?.totalZones ?? 0, icon: Layers, tone: "brass" as const },
  ];

  const toneClasses = {
    moss: "bg-moss/10 text-moss dark:bg-moss/15 dark:text-moss-light",
    ink: "bg-ink/[0.06] text-ink dark:bg-white/10 dark:text-white",
    stamp: "bg-stamp/10 text-stamp dark:bg-stamp/15 dark:text-stamp-light",
    brass: "bg-brass/10 text-brass dark:bg-brass/15",
  };

  return (
    <div>
      <span className="eyebrow">Admin control panel</span>
      <h1 className="mt-1 mb-1 font-serif text-2xl text-ink dark:text-white">
        System overview
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Signed in as {user?.name} — full control over the library system.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

export default function AdminPage() {
  return (
    <RequireRole allow={["admin"]}>
      <AdminDashboard />
    </RequireRole>
  );
}
