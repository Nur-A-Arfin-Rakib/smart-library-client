"use client";

import { useEffect, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (user) {
      setName(user.name);
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password && !currentPassword) {
      toast.error("Enter your current password to set a new one");
      return;
    }

    setSubmitting(true);
    try {
      await api.put("/auth/me", {
        name,
        avatarUrl: avatarUrl || undefined,
        password: password || undefined,
        currentPassword: password ? currentPassword : undefined,
      });
      await refreshUser();
      setPassword("");
      setCurrentPassword("");
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return <div className="py-20 text-center text-sm text-gray-500">Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-md"
    >
      <h1 className="mb-1 text-2xl font-semibold text-gray-900 dark:text-white">
        Profile settings
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Update your name, avatar, or password.
      </p>

      <div className="card p-6">
        <div className="mb-6 flex items-center gap-4">
          <img
            src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
            alt="Avatar preview"
            className="h-14 w-14 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
          />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
            <p className="text-xs uppercase tracking-wide text-accent">{user.role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Avatar URL
            </label>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="input-field"
            />
            <p className="mt-1 text-xs text-gray-400">
              Cloudinary image upload can replace this field later.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="input-field"
            />
          </div>

          {password && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required to confirm the change"
                className="input-field"
              />
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={submitting}
            className="btn-primary mt-2"
          >
            {submitting ? "Saving..." : "Save changes"}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
