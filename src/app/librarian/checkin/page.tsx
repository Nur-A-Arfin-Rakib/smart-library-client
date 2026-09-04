"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { RequireRole } from "@/components/RequireRole";
import { api } from "@/lib/api";

function CheckInTool() {
  const [bookingId, setBookingId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/librarian/bookings/${bookingId}/manual-checkin`);
      toast.success("Student checked in");
      setBookingId("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Check-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-gray-900 dark:text-white">
        Manual check-in
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Use this when a student can&apos;t scan their own QR code. Enter the
        booking ID shown on their confirmation.
      </p>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="card flex max-w-md flex-col gap-4 p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Booking ID
          </label>
          <input
            required
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            className="input-field"
            placeholder="e.g. 665f1c2..."
          />
        </div>
        <button disabled={submitting} className="btn-primary">
          {submitting ? "Checking in..." : "Check in"}
        </button>
      </motion.form>
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
