"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";
import { CalendarCheck, Copy, Clock, CheckCircle2, XCircle } from "lucide-react";
import { RequireRole } from "@/components/RequireRole";
import { api } from "@/lib/api";
import { Booking } from "@/types/library";

function fmt(d: string) {
  return new Date(d).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusBadgeClasses: Record<Booking["status"], string> = {
  booked: "bg-moss/10 text-moss border border-moss/20",
  "checked-in": "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  completed: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  "no-show": "bg-stamp/10 text-stamp border border-stamp/20",
  cancelled: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
};

function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "past" | "all">("active");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Booking[]>("/bookings/my");
      setBookings(data);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCheckIn = async (qrToken: string) => {
    try {
      await api.post(`/bookings/checkin/${qrToken}`);
      toast.success("Checked in successfully!");
      fetchBookings();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Check-in failed");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success("Booking cancelled");
      fetchBookings();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cancel failed");
    }
  };

  const filtered = bookings.filter((b) => {
    if (tab === "active") return b.status === "booked" || b.status === "checked-in";
    if (tab === "past") return b.status === "completed" || b.status === "no-show" || b.status === "cancelled";
    return true;
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="eyebrow">Study Pass</span>
          <h1 className="mt-1 mb-1 font-serif text-2xl text-ink dark:text-white">
            My Bookings &amp; Passes
          </h1>
          <p className="text-sm text-gray-500">
            Show the QR pass at the entrance scanner, or check in directly below.
          </p>
        </div>
        <Link href="/student/booking" className="btn-primary text-xs">
          + Book Another Seat
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-ink/10 pb-3 dark:border-white/10 text-xs">
        <button
          onClick={() => setTab("active")}
          className={`rounded-lg px-3 py-1.5 font-medium transition ${
            tab === "active"
              ? "bg-moss text-white shadow-sm"
              : "text-gray-500 hover:text-ink dark:hover:text-white"
          }`}
        >
          Active &amp; Upcoming
        </button>
        <button
          onClick={() => setTab("past")}
          className={`rounded-lg px-3 py-1.5 font-medium transition ${
            tab === "past"
              ? "bg-moss text-white shadow-sm"
              : "text-gray-500 hover:text-ink dark:hover:text-white"
          }`}
        >
          Past History
        </button>
        <button
          onClick={() => setTab("all")}
          className={`rounded-lg px-3 py-1.5 font-medium transition ${
            tab === "all"
              ? "bg-moss text-white shadow-sm"
              : "text-gray-500 hover:text-ink dark:hover:text-white"
          }`}
        >
          All ({bookings.length})
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading bookings...</p>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center p-12 text-center text-sm text-gray-500">
          <CalendarCheck size={36} className="mb-2 text-gray-300" />
          <p className="font-semibold text-ink dark:text-white">No {tab !== "all" ? tab : ""} bookings found</p>
          <p className="mt-1 text-xs text-gray-400">
            Reserve a seat in your department study zone to get a contactless QR pass.
          </p>
          <Link href="/student/booking" className="btn-primary mt-4 text-xs">
            Reserve a Seat
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b, i) => (
            <motion.div
              key={b._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card flex flex-col items-center p-5 text-center relative"
            >
              <div className="w-full flex items-center justify-between mb-3 text-xs">
                <span className="font-medium text-ink dark:text-white">{b.zone?.name ?? "Zone"}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    statusBadgeClasses[b.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {b.status}
                </span>
              </div>

              <div className="mb-3">
                <div className="font-mono text-3xl font-extrabold text-moss">
                  Seat {b.seat?.seatNumber ?? "N/A"}
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-1 text-xs text-gray-500">
                  <Clock size={12} className="text-gray-400" />
                  {fmt(b.startTime)} → {fmt(b.endTime)}
                </div>
              </div>

              {b.status === "booked" && (
                <div className="mb-4 rounded-xl border border-ink/10 bg-white p-3 shadow-inner dark:bg-white">
                  <QRCodeSVG value={b.qrToken} size={130} />
                  <div className="mt-2 flex items-center justify-center gap-1 font-mono text-[10px] text-gray-500">
                    <span>{b.qrToken.substring(0, 10)}...</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(b.qrToken);
                        toast.success("Token copied!");
                      }}
                      title="Copy QR token"
                      className="p-0.5 hover:text-ink"
                    >
                      <Copy size={11} />
                    </button>
                  </div>
                </div>
              )}

              {b.status === "booked" ? (
                <div className="mt-auto flex w-full gap-2 pt-2 border-t border-ink/5 dark:border-white/5">
                  <button
                    onClick={() => handleCheckIn(b.qrToken)}
                    className="btn-primary flex-1 !py-1.5 text-xs"
                  >
                    Direct Check In
                  </button>
                  <button
                    onClick={() => handleCancel(b._id)}
                    className="btn-secondary !py-1.5 !px-3 text-xs text-stamp hover:text-stamp-light"
                  >
                    Cancel
                  </button>
                </div>
              ) : b.status === "checked-in" ? (
                <div className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-blue-500 pt-2">
                  <CheckCircle2 size={15} /> Currently Checked In
                </div>
              ) : (
                <div className="mt-auto text-xs text-gray-400 pt-2 capitalize">
                  {b.status === "completed" ? "Session completed" : b.status}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <RequireRole allow={["student"]}>
      <MyBookings />
    </RequireRole>
  );
}
