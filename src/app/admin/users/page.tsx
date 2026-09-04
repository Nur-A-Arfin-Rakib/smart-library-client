"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { RequireRole } from "@/components/RequireRole";
import { SearchBar } from "@/components/SearchBar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { UserRole } from "@/types/user";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  createdAt: string;
}

const roleStyles: Record<UserRole, string> = {
  student: "bg-moss/10 text-moss dark:bg-moss/15 dark:text-moss-light",
  librarian: "bg-brass/10 text-brass dark:bg-brass/15",
  admin: "bg-stamp/10 text-stamp dark:bg-stamp/15 dark:text-stamp-light",
};

function UsersAdmin() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | UserRole>("");

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await api.get<AdminUser[]>("/admin/users", {
      params: { search: query || undefined, role: roleFilter || undefined },
    });
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, roleFilter]);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      toast.success("Role updated");
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role } : u)));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update role");
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("User removed");
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove user");
    }
  };

  return (
    <div>
      <span className="eyebrow">User management</span>
      <h1 className="mt-1 mb-1 font-serif text-2xl text-ink dark:text-white">
        Users &amp; roles
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Promote a student to librarian or admin, or demote/remove an account.
      </p>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="min-w-[240px] flex-1">
          <SearchBar value={query} onChange={setQuery} placeholder="Search by name or email..." />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "" | UserRole)}
          className="input-field w-auto"
        >
          <option value="">All roles</option>
          <option value="student">Student</option>
          <option value="librarian">Librarian</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-gray-500">No users found.</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-gray-400 dark:border-white/10">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Change role</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <motion.tr
                  key={u._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-ink/5 last:border-0 dark:border-white/5"
                >
                  <td className="px-5 py-3 font-medium text-ink dark:text-white">
                    {u.name}
                    {u._id === currentUser?.id && (
                      <span className="ml-2 text-xs text-gray-400">(you)</span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${roleStyles[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value as UserRole)}
                      disabled={u._id === currentUser?.id}
                      className="input-field !py-1.5 text-xs disabled:opacity-40"
                    >
                      <option value="student">Student</option>
                      <option value="librarian">Librarian</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {u._id !== currentUser?.id && (
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="text-xs font-medium text-stamp hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <RequireRole allow={["admin"]}>
      <UsersAdmin />
    </RequireRole>
  );
}
