"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarCheck, Clock, MapPin, CheckCircle, X, ShieldAlert } from "lucide-react";
import { RequireRole } from "@/components/RequireRole";
import { api } from "@/lib/api";
import { ZoneWithSeats } from "@/types/library";

function todayPlusHoursISO(hours: number) {
  const d = new Date(Date.now() + hours * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

interface SelectedSeat {
  seatId: string;
  seatNumber: string;
  zoneName: string;
  restrictedToDepartment?: string;
}

function BookingPage() {
  const router = useRouter();
  const [zones, setZones] = useState<ZoneWithSeats[]>([]);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState(todayPlusHoursISO(1));
  const [end, setEnd] = useState(todayPlusHoursISO(3));
  const [selectedSeat, setSelectedSeat] = useState<SelectedSeat | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<ZoneWithSeats[]>("/bookings/zones", {
        params: { start: new Date(start).toISOString(), end: new Date(end).toISOString() },
      });
      setZones(data);
    } catch {
      toast.error("Failed to load zones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced auto-fetch on time changes
  useEffect(() => {
    const t = setTimeout(() => {
      if (start && end && new Date(start) < new Date(end)) {
        fetchZones();
      }
    }, 500);
    return () => clearTimeout(t);
  }, [start, end]);

  const handleConfirmBooking = async () => {
    if (!selectedSeat) return;

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate >= endDate) {
      toast.error("End time must be after start time");
      return;
    }
    if (startDate < new Date(Date.now() - 60000)) {
      toast.error("Start time can't be in the past");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/bookings", {
        seatId: selectedSeat.seatId,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      });
      toast.success("Seat booked successfully! View your QR pass.");
      setSelectedSeat(null);
      router.push("/student/my-bookings");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateDuration = () => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    if (isNaN(s) || isNaN(e) || e <= s) return "0 min";
    const diffHours = (e - s) / (1000 * 60 * 60);
    return diffHours === 1 ? "1 hour" : `${diffHours.toFixed(1)} hours`;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span className="eyebrow">Study Space Reservation</span>
          <h1 className="mt-1 mb-1 font-serif text-2xl text-ink dark:text-white">
            Book a Study Seat
          </h1>
          <p className="text-sm text-gray-500">
            Select your preferred time slot, then click on an available seat to reserve it.
          </p>
        </div>
        <Link href="/student/my-bookings" className="btn-secondary text-xs">
          My Active Bookings
        </Link>
      </div>

      {/* Time Slot Picker Card */}
      <div className="card mb-8 flex flex-wrap items-end gap-4 p-5">
        <div className="min-w-[210px] flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
            Start Time
          </label>
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="input-field text-xs font-mono"
          />
        </div>
        <div className="min-w-[210px] flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
            End Time
          </label>
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="input-field text-xs font-mono"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-ink/[0.04] px-3.5 py-2.5 text-xs text-gray-600 dark:bg-white/[0.05] dark:text-gray-300 font-medium">
            Duration: <span className="text-moss font-bold">{calculateDuration()}</span>
          </div>
          <button onClick={fetchZones} className="btn-secondary !py-2.5 text-xs">
            Refresh Seats
          </button>
        </div>
      </div>

      {/* Zones and Seats Display */}
      {loading ? (
        <p className="py-12 text-center text-sm text-gray-500">Updating seat availability...</p>
      ) : zones.length === 0 ? (
        <div className="card p-10 text-center text-sm text-gray-500">
          No library zones configured yet. Ask an administrator to set up study zones and seats.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {zones.map((zone) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-ink dark:text-white">{zone.name}</h2>
                  <p className="text-xs text-gray-500">
                    {zone.description || "Open quiet reading and study zone."}
                  </p>
                </div>
                {zone.restrictedToDepartment && (
                  <span className="flex items-center gap-1 rounded-full bg-moss/10 px-2.5 py-1 text-xs font-medium text-moss dark:bg-moss/20 dark:text-moss-light">
                    <ShieldAlert size={13} />
                    {zone.restrictedToDepartment} Only
                  </span>
                )}
              </div>

              {/* Seat Legend */}
              <div className="mb-3 flex items-center gap-4 text-[11px] text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-moss/20 border border-moss" /> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-stamp/20 border border-stamp" /> Booked / Occupied
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {zone.seats.map((seat) => (
                  <motion.button
                    key={seat.id}
                    whileTap={{ scale: 0.93 }}
                    disabled={seat.status === "booked"}
                    onClick={() =>
                      setSelectedSeat({
                        seatId: seat.id,
                        seatNumber: seat.seatNumber,
                        zoneName: zone.name,
                        restrictedToDepartment: zone.restrictedToDepartment,
                      })
                    }
                    className={`h-11 w-11 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center ${
                      seat.status === "available"
                        ? selectedSeat?.seatId === seat.id
                          ? "bg-moss text-white ring-2 ring-moss ring-offset-2"
                          : "bg-moss/15 text-moss hover:bg-moss hover:text-white"
                        : "cursor-not-allowed bg-stamp/10 text-stamp/50 dark:bg-stamp/15 dark:text-stamp/40"
                    }`}
                    title={seat.status === "available" ? `Seat ${seat.seatNumber} — Click to reserve` : "Booked"}
                  >
                    {seat.seatNumber}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedSeat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card max-w-md w-full p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="stat-icon bg-moss/10 text-moss">
                    <CalendarCheck size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink dark:text-white">Confirm Reservation</h3>
                    <p className="text-xs text-gray-500">Review your selected seat details</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSeat(null)}
                  className="p-1 text-gray-400 hover:text-ink dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mb-5 flex flex-col gap-2.5 rounded-xl border border-ink/10 bg-ink/[0.02] p-4 text-xs dark:border-white/10 dark:bg-white/[0.02]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Zone:</span>
                  <span className="font-semibold text-ink dark:text-white">{selectedSeat.zoneName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Seat Number:</span>
                  <span className="font-mono font-bold text-moss">{selectedSeat.seatNumber}</span>
                </div>
                {selectedSeat.restrictedToDepartment && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Restricted To:</span>
                    <span className="font-medium text-stamp">{selectedSeat.restrictedToDepartment}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-ink/5 pt-2 dark:border-white/5">
                  <span className="text-gray-500">Start Time:</span>
                  <span className="font-mono">{new Date(start).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">End Time:</span>
                  <span className="font-mono">{new Date(end).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium text-moss">{calculateDuration()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setSelectedSeat(null)}
                  className="btn-secondary !py-2 !px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  onClick={handleConfirmBooking}
                  className="btn-primary !py-2 !px-5 text-xs"
                >
                  {submitting ? "Booking Seat..." : "Confirm & Get QR Pass"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StudentBookingPage() {
  return (
    <RequireRole allow={["student"]}>
      <BookingPage />
    </RequireRole>
  );
}
