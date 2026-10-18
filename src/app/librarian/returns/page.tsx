"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Undo2, Search, RefreshCw, BadgeDollarSign, BookOpen, AlertTriangle, CheckCircle } from "lucide-react";
import { RequireRole } from "@/components/RequireRole";
import { api } from "@/lib/api";
import { LibrarianBorrowRecord } from "@/types/library";

function ReturnTool() {
  const [borrows, setBorrows] = useState<LibrarianBorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [quickId, setQuickId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastReturnResult, setLastReturnResult] = useState<{
    bookTitle?: string;
    studentName?: string;
    fine: number;
  } | null>(null);

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      const queryStatus =
        statusFilter === "active" ? undefined : statusFilter !== "all" ? statusFilter : undefined;
      const { data } = await api.get<LibrarianBorrowRecord[]>("/librarian/borrows", {
        params: { status: queryStatus, search: search || undefined },
      });

      let results = data;
      if (statusFilter === "active") {
        results = data.filter((r) => r.status === "borrowed" || r.status === "overdue");
      } else if (statusFilter === "unpaid") {
        results = data.filter((r) => !r.finePaid && (r.liveFine > 0 || r.fine > 0));
      }
      setBorrows(results);
    } catch {
      toast.error("Failed to load borrow records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, [statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchBorrows, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleReturn = async (recordId: string, bookTitle?: string, studentName?: string) => {
    setSubmitting(true);
    setLastReturnResult(null);
    try {
      const { data } = await api.patch(`/librarian/borrow/${recordId}/return`);
      const fine = data.record?.fine ?? 0;
      toast.success(fine > 0 ? `Returned with late fine of Tk ${fine}` : "Returned on time — no fine!");
      setLastReturnResult({
        bookTitle: bookTitle || data.record?.book?.title,
        studentName: studentName || data.record?.student?.name,
        fine,
      });
      fetchBorrows();
      setQuickId("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Return failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkFinePaid = async (recordId: string) => {
    setSubmitting(true);
    try {
      await api.patch(`/librarian/borrow/${recordId}/mark-fine-paid`);
      toast.success("Fine marked as paid — borrowing restriction lifted!");
      fetchBorrows();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update fine status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!quickId.trim()) return;
    handleReturn(quickId.trim());
  };

  const statusBadges: Record<string, string> = {
    borrowed: "bg-moss/10 text-moss border border-moss/20",
    overdue: "bg-stamp/10 text-stamp border border-stamp/20",
    returned: "bg-gray-500/10 text-gray-500 border border-gray-500/20",
    purchased: "bg-brass/10 text-brass border border-brass/20",
  };

  return (
    <div>
      <span className="eyebrow">Circulation &amp; Fines Desk</span>
      <h1 className="mt-1 mb-1 font-serif text-2xl text-ink dark:text-white">
        Book Returns &amp; Cash Fine Collection
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Process book returns with automatic late fine calculation, or mark in-person cash fines as paid.
      </p>

      {/* Return confirmation banner */}
      <AnimatePresence>
        {lastReturnResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`card mb-6 p-4 text-sm ${
              lastReturnResult.fine > 0
                ? "border-stamp/40 bg-stamp/5 text-stamp"
                : "border-moss/40 bg-moss/5 text-moss"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {lastReturnResult.fine > 0 ? (
                  <AlertTriangle size={18} className="shrink-0" />
                ) : (
                  <CheckCircle size={18} className="shrink-0" />
                )}
                <div>
                  <span className="font-semibold">
                    {lastReturnResult.bookTitle ? `"${lastReturnResult.bookTitle}"` : "Book"} successfully returned.
                  </span>{" "}
                  {lastReturnResult.fine > 0 ? (
                    <span>
                      Late fine incurred: <b>Tk {lastReturnResult.fine}</b>. Collect cash at the desk or ask student to pay online.
                    </span>
                  ) : (
                    <span>Returned on time. No late fine applied.</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setLastReturnResult(null)}
                className="text-xs font-semibold underline ml-3"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Return by ID form */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleQuickSubmit}
        className="card mb-8 flex flex-wrap items-end gap-3 p-5"
      >
        <div className="flex-1 min-w-[280px]">
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
            Quick Return / Borrow Record ID
          </label>
          <div className="relative">
            <Undo2 size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              required
              value={quickId}
              onChange={(e) => setQuickId(e.target.value)}
              className="input-field pl-9 font-mono text-sm"
              placeholder="e.g. 665f1c2... or paste record ID"
            />
          </div>
        </div>
        <button disabled={submitting} className="btn-primary">
          {submitting ? "Processing..." : "Process Return"}
        </button>
      </motion.form>

      {/* Circulation Table */}
      <div className="card overflow-hidden p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, student, isbn..."
                className="input-field pl-8 !py-1.5 text-xs"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-auto !py-1.5 text-xs"
            >
              <option value="active">Active &amp; Overdue</option>
              <option value="unpaid">Unpaid Fines Only</option>
              <option value="returned">Returned History</option>
              <option value="all">All Records</option>
            </select>
          </div>

          <button
            onClick={fetchBorrows}
            className="flex items-center gap-1.5 text-xs text-moss hover:underline"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-500">Loading records...</p>
        ) : borrows.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            <BookOpen size={32} className="mx-auto mb-2 text-gray-300" />
            No borrow records found matching the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-ink/10 pb-2 uppercase tracking-wide text-gray-400 dark:border-white/10">
                  <th className="py-2.5 px-3 font-medium">Book</th>
                  <th className="py-2.5 px-3 font-medium">Student</th>
                  <th className="py-2.5 px-3 font-medium">Due Date</th>
                  <th className="py-2.5 px-3 font-medium">Fine Status</th>
                  <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 dark:divide-white/5">
                {borrows.map((r) => {
                  const isOverdue =
                    r.status === "overdue" ||
                    (r.status === "borrowed" && new Date(r.dueDate) < new Date());
                  const hasFine = r.liveFine > 0 || r.fine > 0;

                  return (
                    <tr key={r._id} className="hover:bg-ink/[0.01] dark:hover:bg-white/[0.01]">
                      <td className="py-3 px-3">
                        <p className="font-semibold text-ink dark:text-white">
                          {r.book?.title || "Book"}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {r.book?.author} {r.book?.shelfLocation ? `· Shelf ${r.book.shelfLocation}` : ""}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-ink dark:text-white">
                          {r.student?.name || "Student"}
                        </p>
                        <p className="text-[11px] text-gray-400 font-mono">
                          {r.student?.email}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-medium ${
                            isOverdue && r.status !== "returned" ? "text-stamp font-semibold" : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {new Date(r.dueDate).toLocaleDateString()}
                        </span>
                        <div className="mt-0.5">
                          <span
                            className={`inline-block rounded-full px-2 py-0.2 text-[9px] font-semibold uppercase ${
                              statusBadges[r.status] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {hasFine ? (
                          r.finePaid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-moss">
                              <CheckCircle size={12} /> Tk {r.fine} Paid
                            </span>
                          ) : (
                            <div className="flex items-center gap-1 font-semibold text-stamp">
                              <BadgeDollarSign size={13} />
                              Tk {r.liveFine || r.fine} (Unpaid)
                            </div>
                          )
                        ) : (
                          <span className="text-[11px] text-gray-400">No fine</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(r.status === "borrowed" || r.status === "overdue") && (
                            <button
                              disabled={submitting}
                              onClick={() => handleReturn(r._id, r.book?.title, r.student?.name)}
                              className="btn-primary !py-1 !px-2.5 text-xs"
                            >
                              Mark Returned
                            </button>
                          )}
                          {!r.finePaid && hasFine && (
                            <button
                              disabled={submitting}
                              onClick={() => handleMarkFinePaid(r._id)}
                              className="btn-secondary !py-1 !px-2.5 text-xs"
                              title="Mark fine paid if collected cash at desk"
                            >
                              Cash Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
