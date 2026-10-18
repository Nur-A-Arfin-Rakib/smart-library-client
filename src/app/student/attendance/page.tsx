"use client";

import { useEffect, useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { LogIn, LogOut, CheckCircle2, Clock, ShieldCheck, Copy, ArrowRight } from "lucide-react";
import { RequireRole } from "@/components/RequireRole";
import { api } from "@/lib/api";
import { AttendanceRecord } from "@/types/library";

function AttendancePage() {
  const [purpose, setPurpose] = useState<"entry" | "exit">("entry");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const { data } = await api.get<AttendanceRecord[]>("/attendance/my");
      setRecords(data);
    } catch {
      toast.error("Failed to load attendance history");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Countdown timer for active OTP
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev && prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleRequestOtp = async () => {
    setSendingOtp(true);
    setDevCode(null);
    setCode("");
    try {
      const { data } = await api.post<{ message: string; devOnlyCode?: string }>(
        "/attendance/send-otp",
        { purpose }
      );
      toast.success(data.message || `OTP sent for ${purpose}!`);
      if (data.devOnlyCode) {
        setDevCode(data.devOnlyCode);
      }
      setTimeLeft(300); // 5 minutes
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    setVerifying(true);
    try {
      const { data } = await api.post("/attendance/verify-otp", { code, purpose });
      toast.success(data.message || `Attendance logged successfully (${purpose})!`);
      setCode("");
      setDevCode(null);
      setTimeLeft(null);
      fetchHistory();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "OTP verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div>
      <span className="eyebrow">Smart Access &amp; Presence</span>
      <h1 className="mt-1 mb-1 font-serif text-2xl text-ink dark:text-white">
        Attendance (OTP)
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Verify your entry or exit securely using a one-time verification code.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Verification Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card flex flex-col p-6"
        >
          <div className="mb-5 flex rounded-xl bg-ink/[0.04] p-1 dark:bg-white/[0.05]">
            <button
              onClick={() => {
                setPurpose("entry");
                setDevCode(null);
                setTimeLeft(null);
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium transition ${
                purpose === "entry"
                  ? "bg-white text-ink shadow-sm dark:bg-paper-dark dark:text-white"
                  : "text-gray-500 hover:text-ink dark:text-gray-400"
              }`}
            >
              <LogIn size={15} className="text-moss" />
              Check-In (Entry)
            </button>
            <button
              onClick={() => {
                setPurpose("exit");
                setDevCode(null);
                setTimeLeft(null);
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium transition ${
                purpose === "exit"
                  ? "bg-white text-ink shadow-sm dark:bg-paper-dark dark:text-white"
                  : "text-gray-500 hover:text-ink dark:text-gray-400"
              }`}
            >
              <LogOut size={15} className="text-stamp" />
              Check-Out (Exit)
            </button>
          </div>

          <div className="mb-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-ink/15 p-5 text-center dark:border-white/15">
            <p className="text-xs text-gray-500">
              Step 1: Request your verification code to log library{" "}
              <span className="font-semibold text-ink dark:text-white uppercase">{purpose}</span>
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={sendingOtp}
              onClick={handleRequestOtp}
              className="btn-primary mt-3 text-xs"
            >
              {sendingOtp ? "Sending code..." : `Send ${purpose.toUpperCase()} Code`}
            </motion.button>

            {timeLeft !== null && timeLeft > 0 && (
              <p className="mt-2.5 flex items-center gap-1.5 font-mono text-xs text-gray-500">
                <Clock size={13} className="text-moss" />
                Code valid for: <span className="font-semibold text-ink dark:text-white">{formatTimer(timeLeft)}</span>
              </p>
            )}
            {timeLeft === 0 && (
              <p className="mt-2.5 text-xs text-stamp">Code expired. Please request a new code.</p>
            )}
          </div>

          <AnimatePresence>
            {devCode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-5 rounded-xl border border-moss/20 bg-moss/5 p-4 text-center dark:bg-moss/10"
              >
                <div className="mb-1 flex items-center justify-center gap-1.5 text-xs font-medium text-moss">
                  <ShieldCheck size={16} />
                  Your One-Time Passcode
                </div>
                <div className="font-mono text-3xl font-bold tracking-widest text-ink dark:text-white">
                  {devCode}
                </div>
                <div className="mt-2 flex justify-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(devCode);
                      toast.success("Code copied!");
                    }}
                    className="inline-flex items-center gap-1 rounded bg-white px-2.5 py-1 text-[11px] font-medium text-ink shadow-sm dark:bg-paper-dark dark:text-white"
                  >
                    <Copy size={12} /> Copy
                  </button>
                  <button
                    onClick={() => setCode(devCode)}
                    className="inline-flex items-center gap-1 rounded bg-moss px-2.5 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-moss-light"
                  >
                    <ArrowRight size={12} /> Auto-fill
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Enter 6-digit Code
              </label>
              <input
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="input-field text-center font-mono text-xl tracking-widest"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={verifying || code.length !== 6}
              className="btn-primary !py-2.5 text-sm"
            >
              {verifying ? "Verifying..." : `Confirm ${purpose === "entry" ? "Entry" : "Exit"}`}
            </motion.button>
          </form>
        </motion.div>

        {/* History Log Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="card flex flex-col p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-ink dark:text-white">Recent Attendance Logs</h2>
            <button
              onClick={fetchHistory}
              className="text-xs font-medium text-moss hover:underline"
            >
              Refresh
            </button>
          </div>

          {loadingHistory ? (
            <p className="text-sm text-gray-500">Loading history...</p>
          ) : records.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-sm text-gray-500">
              <CheckCircle2 size={32} className="mb-2 text-gray-300" />
              No attendance records yet. Request a code above to log your first check-in!
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[380px] pr-1">
              {records.map((r) => (
                <div
                  key={r._id}
                  className="flex items-center justify-between rounded-lg border border-ink/5 bg-ink/[0.02] p-3 dark:border-white/5 dark:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        r.type === "entry"
                          ? "bg-moss/15 text-moss dark:bg-moss/20 dark:text-moss-light"
                          : "bg-stamp/15 text-stamp dark:bg-stamp/20 dark:text-stamp-light"
                      }`}
                    >
                      {r.type === "entry" ? <LogIn size={15} /> : <LogOut size={15} />}
                    </span>
                    <div>
                      <p className="text-xs font-semibold capitalize text-ink dark:text-white">
                        {r.type} Check
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {new Date(r.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-moss/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-moss dark:bg-moss/20 dark:text-moss-light uppercase">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function StudentAttendancePage() {
  return (
    <RequireRole allow={["student"]}>
      <AttendancePage />
    </RequireRole>
  );
}
