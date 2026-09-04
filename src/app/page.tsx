"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarCheck, QrCode, BookMarked } from "lucide-react";
import { DueDateCard } from "@/components/DueDateCard";

const features = [
  {
    icon: CalendarCheck,
    title: "Seat & zone booking",
    desc: "Reserve a study seat or zone in advance with live, color-coded availability.",
  },
  {
    icon: QrCode,
    title: "OTP & QR attendance",
    desc: "Secure, contactless check-in with a single digital library card.",
  },
  {
    icon: BookMarked,
    title: "Book lending",
    desc: "Borrow, renew, and reserve books with automatic fine tracking.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="grid items-center gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="eyebrow">Campus library, digitized</span>
          <h1 className="mt-3 font-serif text-4xl leading-[1.1] text-ink dark:text-white sm:text-5xl">
            Every seat, every book,
            <br />
            tracked to the minute.
          </h1>
          <p className="mt-4 max-w-md text-gray-600 dark:text-gray-400">
            Book a seat, check in with a code, and manage what you've
            borrowed — no queues, no paper slips.
          </p>
          <div className="mt-7 flex gap-3">
            <Link href="/register" className="btn-primary">
              Get started
            </Link>
            <Link href="/login" className="btn-secondary">
              I already have an account
            </Link>
          </div>
        </motion.div>

        <div className="flex justify-center lg:justify-end">
          <DueDateCard />
        </div>
      </section>

      <section className="grid gap-5 border-t border-ink/10 py-10 dark:border-white/10 sm:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="card card-hover p-6"
          >
            <div className="stat-icon mb-4 bg-moss/10 text-moss dark:bg-moss/15 dark:text-moss-light">
              <f.icon size={20} />
            </div>
            <h3 className="mb-1 font-medium text-ink dark:text-white">
              {f.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
