"use client";

import { motion } from "framer-motion";

const rows = [
  { label: "S. RAHMAN", date: "12 AUG" },
  { label: "T. AHMED", date: "14 AUG" },
  { label: "N. ISLAM", date: "15 AUG" },
];

export function DueDateCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: -2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-[280px] select-none"
    >
      <div className="rounded-sm border border-ink/15 bg-[#FBFAF6] p-5 shadow-card dark:border-white/15 dark:bg-[#1a2224]">
        <div className="mb-3 flex items-baseline justify-between border-b border-dashed border-ink/25 pb-2 dark:border-white/20">
          <span className="font-mono text-[10px] tracking-[0.2em] text-ink/50 dark:text-white/40">
            DATE DUE
          </span>
          <span className="font-mono text-[10px] text-ink/50 dark:text-white/40">No. 0417</span>
        </div>
        <div className="flex flex-col gap-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between font-mono text-[11px] text-ink/70 dark:text-white/60">
              <span>{r.label}</span>
              <span>{r.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* the "fresh stamp" — slightly rotated, in the stamp-red ink color */}
      <motion.div
        initial={{ opacity: 0, scale: 1.4, rotate: 8 }}
        animate={{ opacity: 1, scale: 1, rotate: 8 }}
        transition={{ delay: 0.5, duration: 0.4, ease: "backOut" }}
        className="absolute -bottom-4 -right-4 rounded border-2 border-stamp/70 px-3 py-1.5 font-mono text-[11px] font-semibold tracking-wide text-stamp/80"
        style={{ transform: "rotate(8deg)" }}
      >
        BOOKED · SEAT A3
      </motion.div>
    </motion.div>
  );
}
