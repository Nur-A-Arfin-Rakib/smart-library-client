"use client";

import { useEffect, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { RequireRole } from "@/components/RequireRole";
import { api } from "@/lib/api";

interface Overview {
  totalStudents: number;
  totalBooks: number;
  totalZones: number;
  activeBorrows: number;
  pendingFineTotal: number;
}

interface TrendPoint {
  date: string;
  bookings: number;
}

interface ZonePopularity {
  name: string;
  bookings: number;
}

interface Notice {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
}

function AnalyticsDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [popularZones, setPopularZones] = useState<ZonePopularity[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchAll = async () => {
    const [o, t, z, n] = await Promise.all([
      api.get<Overview>("/admin/analytics/overview"),
      api.get<TrendPoint[]>("/admin/analytics/occupancy-trend"),
      api.get<ZonePopularity[]>("/admin/analytics/popular-zones"),
      api.get<Notice[]>("/notices"),
    ]);
    setOverview(o.data);
    setTrend(t.data);
    setPopularZones(z.data);
    setNotices(n.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handlePostNotice = async (e: FormEvent) => {
    e.preventDefault();
    setPosting(true);
    try {
      await api.post("/admin/notices", { title, message });
      toast.success("Notice broadcast to all users");
      setTitle("");
      setMessage("");
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to post notice");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      await api.delete(`/admin/notices/${id}`);
      toast.success("Notice removed");
      setNotices((prev) => prev.filter((n) => n._id !== id));
    } catch {
      toast.error("Failed to delete notice");
    }
  };

  const cards = overview
    ? [
        { label: "Total students", value: overview.totalStudents },
        { label: "Total books", value: overview.totalBooks },
        { label: "Total zones", value: overview.totalZones },
        { label: "Active borrows", value: overview.activeBorrows },
        { label: "Pending fines", value: `Tk ${overview.pendingFineTotal}` },
      ]
    : [];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-gray-900 dark:text-white">
        Analytics
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Live usage stats across the library system.
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card p-5"
          >
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{c.value}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mb-8 grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">
            Bookings — last 7 days
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="bookings" fill="#2E7D6B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">
            Most popular zones
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={popularZones} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="bookings" fill="#1F3B57" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card max-w-xl p-6">
        <h2 className="mb-1 font-semibold text-gray-900 dark:text-white">
          Broadcast a notice
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Sent to every logged-in user's notice board.
        </p>
        <form onSubmit={handlePostNotice} className="flex flex-col gap-3">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="input-field"
          />
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            rows={3}
            className="input-field"
          />
          <button disabled={posting} className="btn-primary self-start">
            {posting ? "Posting..." : "Post notice"}
          </button>
        </form>

        {notices.length > 0 && (
          <div className="mt-6 flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
            {notices.map((n) => (
              <div key={n._id} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{n.title}</p>
                  <p className="text-gray-500">{n.message}</p>
                </div>
                <button
                  onClick={() => handleDeleteNotice(n._id)}
                  className="shrink-0 text-xs font-medium text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <RequireRole allow={["admin"]}>
      <AnalyticsDashboard />
    </RequireRole>
  );
}
