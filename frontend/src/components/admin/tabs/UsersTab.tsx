"use client";

import React, { useState, useMemo } from "react";
import { Pagination, AdminSearchBar, StatusBadge } from "../common";
import { User, Shield, Eye, EyeOff, Key, Mail, Calendar, Trash2, UserCheck, ShieldAlert } from "lucide-react";

interface UsersTabProps {
  users: any[];
  onDeleteUser?: (userId: string | number) => Promise<void>;
  onUpdateUserRole?: (userId: string | number, newRole: string) => Promise<void>;
  itemsPerPage?: number;
}

export const UsersTab: React.FC<UsersTabProps> = ({
  users,
  onDeleteUser,
  onUpdateUserRole,
  itemsPerPage = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [providerFilter, setProviderFilter] = useState("ALL");
  const [revealedPasswords, setRevealedPasswords] = useState<{ [key: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const togglePasswordReveal = (userId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        String(u.id)?.toLowerCase().includes(q);

      const matchRole =
        roleFilter === "ALL" ||
        (roleFilter === "ADMIN" && (u.role === "admin" || u.role === "super_admin")) ||
        (roleFilter === "STUDENT" && (u.role === "student" || !u.role || u.role === "user"));

      const matchProvider =
        providerFilter === "ALL" ||
        (providerFilter === "GOOGLE" && (u.auth_provider === "google" || u.provider === "google" || !u.is_password_set)) ||
        (providerFilter === "PASSWORD" && u.auth_provider !== "google" && u.provider !== "google" && u.is_password_set);

      return matchSearch && matchRole && matchProvider;
    });
  }, [users, searchTerm, roleFilter, providerFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleDelete = async (userId: string | number, userEmail: string) => {
    if (!onDeleteUser) return;
    if (confirm(`Are you sure you want to permanently delete user account '${userEmail}'?`)) {
      try {
        setDeletingId(userId);
        await onDeleteUser(userId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-4 pt-1">
      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="w-full md:w-80">
          <AdminSearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Search by name, email, or ID..."
            accentColor="blue"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] text-xs text-gray-800 dark:text-[#EDEDED] font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-colors cursor-pointer"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="STUDENT">Students Only</option>
            <option value="ADMIN">Admins / Staff</option>
          </select>

          {/* Provider Filter */}
          <select
            value={providerFilter}
            onChange={(e) => {
              setProviderFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] text-xs text-gray-800 dark:text-[#EDEDED] font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-colors cursor-pointer"
          >
            <option value="ALL">All Auth Providers</option>
            <option value="PASSWORD">Email & Password</option>
            <option value="GOOGLE">Google SSO</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-[#151518] border-b border-gray-200 dark:border-[#27272A] text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 font-semibold">
              <tr>
                <th className="py-3.5 px-6 font-semibold">User / Account</th>
                <th className="py-3.5 px-6 font-semibold">Role</th>
                <th className="py-3.5 px-6 font-semibold">Auth Method</th>
                <th className="py-3.5 px-6 font-semibold">Security / Credential</th>
                <th className="py-3.5 px-6 font-semibold">Joined Date</th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#27272A]">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No registered user accounts match the current filter.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isPasswordRevealed = !!revealedPasswords[u.id];
                  const isGoogle = u.auth_provider === "google" || u.provider === "google";
                  const isSuper = u.role === "super_admin";

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-[#1F1F23]/60 transition-colors"
                    >
                      {/* User / Account */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                            {u.full_name ? u.full_name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {u.full_name || "Unnamed User"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5 font-mono">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30">
                            <Shield className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Super Admin
                          </span>
                        ) : u.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30">
                            <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Sub Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200 dark:bg-[#222226] dark:text-gray-300 dark:border-[#2E2E33]">
                            <User className="w-3 h-3 text-gray-500 dark:text-gray-400" /> Student
                          </span>
                        )}
                      </td>

                      {/* Auth Method */}
                      <td className="py-4 px-6">
                        {isGoogle ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20">
                            Google SSO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 dark:bg-[#222226] dark:text-gray-300 dark:border-[#2E2E33]">
                            Email & Password
                          </span>
                        )}
                      </td>

                      {/* Security / Credential */}
                      <td className="py-4 px-6">
                        {isGoogle ? (
                          <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                            Managed by Google OAuth
                          </span>
                        ) : u.plain_password_hint ? (
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-gray-100 dark:bg-[#121214] border border-gray-200 dark:border-zinc-800 rounded text-xs text-amber-700 dark:text-amber-300 font-mono">
                              {isPasswordRevealed ? u.plain_password_hint : "••••••••"}
                            </code>
                            <button
                              onClick={() => togglePasswordReveal(u.id)}
                              className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded transition-colors"
                              title={isPasswordRevealed ? "Hide password hint" : "Show password hint"}
                            >
                              {isPasswordRevealed ? (
                                <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              ) : (
                                <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <Key className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                            <span>Encrypted / Bcrypt Hash</span>
                          </div>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-6 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {u.created_at
                            ? new Date(u.created_at).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        {!isSuper && onDeleteUser && (
                          <button
                            type="button"
                            onClick={() => handleDelete(u.id, u.email)}
                            disabled={deletingId === u.id}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/20 transition-colors shadow-sm"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
