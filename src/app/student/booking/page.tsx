"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { RequireRole } from "@/components/RequireRole";
import { api } from "@/lib/api";
import { ZoneWithSeats } from "@/types/library";

function todayPlusHoursISO(hours: number) {
  const d = new Date(Date.now() + hours * 60 * 60 * 1000);
  // Build a local-time "YYYY-MM-DDTHH:mm" string (datetime-local inputs expect
  // local wall-clock time, not UTC — using toISOString() here would show the
  // wrong time for any user outside UTC).
  const pad = (n: number) => String(n).padStart(2, "0");
  const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
  return local;
}

function BookingPage() {
  const [zones, setZones] = useState<ZoneWithSeats[]>([]);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState(todayPlusHoursISO(1));
  const [end, setEnd] = useState(todayPlusHoursISO(3));
  const [bookingSeatId, setBookingSeatId] = useState<string | null>(null);

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

  const handleBook = async (seatId: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate >= endDate) {
      toast.error("End time must be after start time");
      return;
    }
    if (startDate < new Date()) {
      toast.error("Start time can't be in the past");
      return;
    }

    setBookingSeatId(seatId);
    try {
      await api.post("/bookings", {
        seatId,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      });
      toast.success("Seat booked! Check 'My Bookings' for your QR code.");
      fetchZones();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Booking failed");
    } finally {
      setBookingSeatId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-gray-900 dark:text-white">
            Book a seat
          </h1>
          <p className="text-sm text-gray-500">
            Pick a time range, then choose an available seat below.
          </p>
        </div>
        <Link href="/student/my-bookings" className="btn-secondary text-sm">
          My bookings
        </Link>
      </div>

      <div className="card mb-8 flex flex-wrap items-end gap-4 p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Start
          </label>
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            End
          </label>
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="input-field"
          />
        </div>
        <button onClick={fetchZones} className="btn-secondary">
          Check availability
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading zones...</p>
      ) : zones.length === 0 ? (
        <p className="text-sm text-gray-500">
          No zones yet — an admin needs to create zones and seats first.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {zones.map((zone) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-white">{zone.name}</h2>
                {zone.restrictedToDepartment && (
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    {zone.restrictedToDepartment} only
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {zone.seats.map((seat) => (
                  <motion.button
                    key={seat.id}
                    whileTap={{ scale: 0.93 }}
                    disabled={seat.status === "booked" || bookingSeatId === seat.id}
                    onClick={() => handleBook(seat.id)}
                    className={`h-11 w-11 rounded-lg text-xs font-medium transition ${
                      seat.status === "available"
                        ? "bg-accent/15 text-accent hover:bg-accent hover:text-white"
                        : "cursor-not-allowed bg-red-100 text-red-400 dark:bg-red-950 dark:text-red-500"
                    }`}
                    title={seat.status === "available" ? "Available — click to book" : "Booked"}
                  >
                    {seat.seatNumber}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
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
