"use client";

import { useEffect, useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Plus, Trash2, X, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface Notice {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
}

export function NoticeBoard({ canManage }: { canManage?: boolean }) {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = canManage ?? user?.role === "admin";

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Notice[]>("/notices");
      setNotices(data);
    } catch {
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handlePostNotice = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/admin/notices", { title, message });
      toast.success("Notice broadcast to all users!");
      setTitle("");
      setMessage("");
      setShowComposer(false);
      fetchNotices();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to post notice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      await api.delete(`/admin/notices/${id}`);
      toast.success("Notice removed");
      setNotices((prev) => prev.filter((n) => n._id !== id));
    } catch {
      toast.error("Failed to delete notice");
    }
  };

  if (!isAdmin && notices.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-8 p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone size={16} className="text-moss" />
          <h2 className="font-semibold text-ink dark:text-white">Notice Board</h2>
          {notices.length > 0 && (
            <span className="rounded-full bg-moss/10 px-2 py-0.5 text-[10px] font-semibold text-moss">
              {notices.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotices}
            title="Refresh notices"
            className="text-gray-400 hover:text-moss text-xs"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowComposer(!showComposer)}
              className="inline-flex items-center gap-1 rounded-lg bg-moss/10 px-2.5 py-1 text-xs font-medium text-moss hover:bg-moss/20 transition"
            >
              {showComposer ? <X size={13} /> : <Plus size={13} />}
              {showComposer ? "Cancel" : "Post Notice"}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showComposer && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handlePostNotice}
            className="mb-4 flex flex-col gap-2.5 rounded-lg border border-ink/10 bg-ink/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.02]"
          >
            <p className="text-xs font-medium text-ink dark:text-white">Broadcast Announcement</p>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement Title"
              className="input-field !py-1.5 text-xs"
            />
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notice message (appears on all dashboards)..."
              rows={2}
              className="input-field !py-1.5 text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowComposer(false)}
                className="btn-secondary !py-1 !px-2.5 text-xs"
              >
                Cancel
              </button>
              <button disabled={submitting} className="btn-primary !py-1 !px-3 text-xs">
                {submitting ? "Posting..." : "Broadcast"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {notices.length === 0 ? (
        <p className="py-2 text-xs text-gray-500">
          No notices active right now. Click "Post Notice" to broadcast an announcement.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {notices.slice(0, 5).map((n) => (
            <div
              key={n._id}
              className="group flex items-start justify-between border-l-2 border-moss/60 pl-3 transition hover:border-moss"
            >
              <div>
                <p className="text-sm font-medium text-ink dark:text-white">{n.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{n.message}</p>
                <p className="mt-0.5 text-[10px] text-gray-400">
                  {new Date(n.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDeleteNotice(n._id)}
                  title="Delete notice"
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-stamp transition"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
