"use client";

import { useEffect, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { RequireRole } from "@/components/RequireRole";
import { api } from "@/lib/api";

interface ZoneRow {
  _id: string;
  name: string;
  description?: string;
  restrictedToDepartment?: string;
  totalSeats: number;
}

interface SeatRow {
  id: string;
  seatNumber: string;
  status: "available" | "booked";
}

function ZoneAdmin() {
  const [zones, setZones] = useState<ZoneRow[]>([]);
  const [seatsByZone, setSeatsByZone] = useState<Record<string, SeatRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [seatZoneId, setSeatZoneId] = useState<string | null>(null);
  const [seatNumber, setSeatNumber] = useState("");
  const [expandedZoneId, setExpandedZoneId] = useState<string | null>(null);

  const fetchZones = async () => {
    setLoading(true);
    const [{ data: zoneList }, { data: zonesWithSeats }] = await Promise.all([
      api.get<ZoneRow[]>("/admin/zones"),
      api.get<{ id: string; seats: SeatRow[] }[]>("/bookings/zones"),
    ]);
    setZones(zoneList);
    const map: Record<string, SeatRow[]> = {};
    zonesWithSeats.forEach((z) => {
      map[z.id] = z.seats;
    });
    setSeatsByZone(map);
    setLoading(false);
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleCreateZone = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/zones", { name, restrictedToDepartment: department || undefined });
      toast.success("Zone created");
      setName("");
      setDepartment("");
      fetchZones();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create zone");
    }
  };

  const handleAddSeat = async (zoneId: string) => {
    if (!seatNumber) return;
    try {
      await api.post(`/admin/zones/${zoneId}/seats`, { seatNumber });
      toast.success("Seat added");
      setSeatNumber("");
      setSeatZoneId(null);
      fetchZones();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add seat");
    }
  };

  const handleDeleteSeat = async (zoneId: string, seatId: string) => {
    try {
      await api.delete(`/admin/zones/${zoneId}/seats/${seatId}`);
      toast.success("Seat removed");
      fetchZones();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove seat");
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    try {
      await api.delete(`/admin/zones/${zoneId}`);
      toast.success("Zone deleted");
      fetchZones();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete zone");
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-gray-900 dark:text-white">
        Zones &amp; seats
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Create study zones and add seats to them. Optionally restrict a zone
        to a specific department.
      </p>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleCreateZone}
        className="card mb-8 flex flex-wrap items-end gap-3 p-5"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Zone name
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="e.g. Silent Study Zone"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Restrict to department (optional)
          </label>
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="input-field"
            placeholder="e.g. CSE"
          />
        </div>
        <button className="btn-primary">Create zone</button>
      </motion.form>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {zones.map((zone) => (
            <div key={zone._id} className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{zone.name}</h3>
                  <p className="text-xs text-gray-500">
                    {zone.totalSeats} seat(s)
                    {zone.restrictedToDepartment ? ` · ${zone.restrictedToDepartment} only` : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteZone(zone._id)}
                  className="text-xs font-medium text-red-500 hover:underline"
                >
                  Delete zone
                </button>
              </div>

              {zone.totalSeats > 0 && (
                <button
                  onClick={() => setExpandedZoneId(expandedZoneId === zone._id ? null : zone._id)}
                  className="mb-2 text-xs font-medium text-gray-500 hover:underline"
                >
                  {expandedZoneId === zone._id ? "Hide seats" : "View seats"}
                </button>
              )}

              {expandedZoneId === zone._id && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {(seatsByZone[zone._id] || []).map((seat) => (
                    <div
                      key={seat.id}
                      className="flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800"
                    >
                      <span>{seat.seatNumber}</span>
                      <button
                        onClick={() => handleDeleteSeat(zone._id, seat.id)}
                        className="text-red-400 hover:text-red-500"
                        title="Remove seat"
                        aria-label={`Remove seat ${seat.seatNumber}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {seatZoneId === zone._id ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={seatNumber}
                    onChange={(e) => setSeatNumber(e.target.value)}
                    placeholder="Seat number, e.g. A1"
                    className="input-field !py-1.5 text-sm"
                  />
                  <button onClick={() => handleAddSeat(zone._id)} className="btn-primary !py-1.5 !px-3 text-sm">
                    Add
                  </button>
                  <button onClick={() => setSeatZoneId(null)} className="btn-secondary !py-1.5 !px-3 text-sm">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSeatZoneId(zone._id)}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  + Add seat
                </button>
              )}
            </div>
          ))}
          {zones.length === 0 && <p className="text-sm text-gray-500">No zones yet.</p>}
        </div>
      )}
    </div>
  );
}

export default function AdminZonesPage() {
  return (
    <RequireRole allow={["admin"]}>
      <ZoneAdmin />
    </RequireRole>
  );
}
