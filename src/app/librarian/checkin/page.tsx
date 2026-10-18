"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ScanLine, Search, CheckCircle, RefreshCw, UserCheck, Clock } from "lucide-react";
import { RequireRole } from "@/components/RequireRole";
import { api } from "@/lib/api";
import { LibrarianBooking } from "@/types/library";

function CheckInTool() {
  const [tokenOrId, setTokenOrId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookings, setBookings] = useState<LibrarianBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("booked");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<LibrarianBooking[]>("/librarian/bookings", {
        params: {
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: search || undefined,
        },
      });
      setBookings(data);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchBookings, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleDirectCheckIn = async (idOrToken: string) => {
    if (!idOrToken.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.patch(`/librarian/bookings/${idOrToken.trim()}/manual-checkin`);
      toast.success(data?.message || "Student checked in successfully!");
      setTokenOrId("");
      fetchBookings();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Check-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleDirectCheckIn(tokenOrId);
  };

  const statusBadges: Record<string, string> = {
    booked: "bg-moss/10 text-moss dark:bg-moss/20 dark:text-moss-light border border-moss/20",
    "checked-in": "bg-blue-500/10 text-blue-500 border border-blue-500/20",
    completed: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
    "no-show": "bg-stamp/10 text-stamp border border-stamp/20",
    cancelled: "bg-gray-500/10 text-gray-400",
  };

  return (
    <div>
      <span className="eyebrow">Circulation &amp; Entry Desk</span>
      <h1 className="mt-1 mb-1 font-serif text-2xl text-ink dark:text-white">
        Seat Check-In Station
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Scan the student&apos;s QR code, paste their QR token, or 1-click check them in from the live list below.
      </p>

      {/* Quick Scan Input Card */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleFormSubmit}
        className="card mb-8 flex flex-wrap items-end gap-3 p-5"
      >
        <div className="flex-1 min-w-[280px]">
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
            Quick Scan / QR Token or Booking ID
          </label>
          <div className="relative">
            <ScanLine size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              required
              value={tokenOrId}
              onChange={(e) => setTokenOrId(e.target.value)}
              className="input-field pl-9 font-mono text-sm"
              placeholder="e.g. 665f1c... or paste QR token"
            />
          </div>
        </div>
        <button disabled={submitting} className="btn-primary">
          {submitting ? "Checking in..." : "Instant Check-In"}
        </button>
      </motion.form>

      {/* Bookings Queue */}
      <div className="card overflow-hidden p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student, seat, zone..."
                className="input-field pl-8 !py-1.5 text-xs"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-auto !py-1.5 text-xs"
            >
              <option value="booked">Ready for Check-In</option>
              <option value="checked-in">Already Checked-In</option>
              <option value="all">All Statuses</option>
            </select>
          </div>

          <button
            onClick={fetchBookings}
            className="flex items-center gap-1.5 text-xs text-moss hover:underline"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-500">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            <UserCheck size={32} className="mx-auto mb-2 text-gray-300" />
            No bookings found matching the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-ink/10 pb-2 uppercase tracking-wide text-gray-400 dark:border-white/10">
                  <th className="py-2.5 px-3 font-medium">Student</th>
                  <th className="py-2.5 px-3 font-medium">Zone &amp; Seat</th>
                  <th className="py-2.5 px-3 font-medium">Time Slot</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 dark:divide-white/5">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-ink/[0.01] dark:hover:bg-white/[0.01]">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-ink dark:text-white">
                        {b.student?.name || "Student"}
                      </p>
                      <p className="text-[11px] text-gray-400 font-mono">
                        {b.student?.email}
                        {b.student?.department ? ` · ${b.student.department}` : ""}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-ink dark:text-white">
                        Seat {b.seat?.seatNumber || "N/A"}
                      </span>
                      <p className="text-[11px] text-gray-400">{b.zone?.name || "Zone"}</p>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300">
                        <Clock size={12} className="text-gray-400" />
                        {new Date(b.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {" → "}
                        {new Date(b.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {new Date(b.startTime).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          statusBadges[b.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {b.status === "booked" ? (
                        <button
                          disabled={submitting}
                          onClick={() => handleDirectCheckIn(b._id)}
                          className="btn-primary !py-1 !px-2.5 text-xs"
                        >
                          Check In
                        </button>
                      ) : b.status === "checked-in" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-moss font-medium">
                          <CheckCircle size={13} /> Checked In
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400 capitalize">{b.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LibrarianCheckInPage() {
  return (
    <RequireRole allow={["librarian", "admin"]}>
      <CheckInTool />
    </RequireRole>
  );
}
