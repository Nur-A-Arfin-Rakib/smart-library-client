"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";
import { RequireRole } from "@/components/RequireRole";
import { api } from "@/lib/api";
import { Booking } from "@/types/library";

function fmt(d: string) {
  return new Date(d).toLocaleString();
}

const statusColor: Record<Booking["status"], string> = {
  booked: "text-accent",
  "checked-in": "text-blue-500",
  completed: "text-gray-400",
  "no-show": "text-red-500",
  cancelled: "text-gray-400",
};

function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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
      toast.success("Checked in!");
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

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-gray-900 dark:text-white">
        My bookings
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Show the QR code at the entrance, or check in here directly.
      </p>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-gray-500">
          You don&apos;t have any bookings yet — go to{" "}
          <span className="font-medium text-accent">Book a seat</span> to
          reserve one.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((b, i) => (
            <motion.div
              key={b._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card flex flex-col items-center p-5 text-center"
            >
              <p className="mb-1 font-semibold text-gray-900 dark:text-white">
                {b.zone?.name ?? "Unknown zone"} · Seat {b.seat?.seatNumber ?? "N/A"}
              </p>
              <p className="mb-3 text-xs text-gray-500">
                {fmt(b.startTime)} → {fmt(b.endTime)}
              </p>

              {b.status === "booked" && (
                <div className="mb-3 rounded-xl bg-white p-3">
                  <QRCodeSVG value={b.qrToken} size={120} />
                </div>
              )}

              <p className={`mb-3 text-xs font-medium uppercase tracking-wide ${statusColor[b.status]}`}>
                {b.status}
              </p>

              {b.status === "booked" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCheckIn(b.qrToken)}
                    className="btn-primary !py-1.5 !px-3 text-xs"
                  >
                    Check in
                  </button>
                  <button
                    onClick={() => handleCancel(b._id)}
                    className="btn-secondary !py-1.5 !px-3 text-xs"
                  >
                    Cancel
                  </button>
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
