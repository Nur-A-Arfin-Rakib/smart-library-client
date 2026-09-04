"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone } from "lucide-react";
import { api } from "@/lib/api";

interface Notice {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
}

export function NoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    api
      .get<Notice[]>("/notices")
      .then((res) => setNotices(res.data))
      .catch(() => setNotices([]));
  }, []);

  if (notices.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-8 p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <Megaphone size={16} className="text-accent" />
        <h2 className="font-semibold text-gray-900 dark:text-white">Notices</h2>
      </div>
      <div className="flex flex-col gap-3">
        {notices.slice(0, 5).map((n) => (
          <div key={n._id} className="border-l-2 border-accent/40 pl-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
            <p className="text-sm text-gray-500">{n.message}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
