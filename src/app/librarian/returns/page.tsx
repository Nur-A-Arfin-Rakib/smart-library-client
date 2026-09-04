"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { RequireRole } from "@/components/RequireRole";
import { api } from "@/lib/api";

function ReturnTool() {
  const [recordId, setRecordId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ fine: number } | null>(null);

  const [payRecordId, setPayRecordId] = useState("");
  const [payingFine, setPayingFine] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const { data } = await api.patch(`/librarian/borrow/${recordId}/return`);
      toast.success("Book marked as returned");
      setResult({ fine: data.record.fine });
      setRecordId("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Return failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkFinePaid = async (e: FormEvent) => {
    e.preventDefault();
    setPayingFine(true);
    try {
      await api.patch(`/librarian/borrow/${payRecordId}/mark-fine-paid`);
      toast.success("Fine marked as paid — borrowing restriction lifted");
      setPayRecordId("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setPayingFine(false);
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-gray-900 dark:text-white">
        Return a book
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Enter the borrow record ID to mark a book as returned and calculate
        any late fine.
      </p>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="card flex max-w-md flex-col gap-4 p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Borrow record ID
          </label>
          <input
            required
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            className="input-field"
            placeholder="e.g. 665f1c2..."
          />
        </div>
        <button disabled={submitting} className="btn-primary">
          {submitting ? "Processing..." : "Mark as returned"}
        </button>
      </motion.form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mt-4 max-w-md p-4 text-sm"
        >
          {result.fine > 0 ? (
            <p className="text-red-500">
              Late fine of <b>Tk {result.fine}</b> applies. Ask the student to
              pay before their next borrow.
            </p>
          ) : (
            <p className="text-accent">Returned on time — no fine.</p>
          )}
        </motion.div>
      )}

      <div className="mt-10 max-w-md">
        <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
          Collected a fine in cash?
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Mark it paid here to lift the student&apos;s borrowing restriction.
        </p>
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleMarkFinePaid}
          className="card flex flex-col gap-4 p-6"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Borrow record ID
            </label>
            <input
              required
              value={payRecordId}
              onChange={(e) => setPayRecordId(e.target.value)}
              className="input-field"
              placeholder="e.g. 665f1c2..."
            />
          </div>
          <button disabled={payingFine} className="btn-secondary">
            {payingFine ? "Updating..." : "Mark fine as paid"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}

export default function LibrarianReturnPage() {
  return (
    <RequireRole allow={["librarian", "admin"]}>
      <ReturnTool />
    </RequireRole>
  );
}
