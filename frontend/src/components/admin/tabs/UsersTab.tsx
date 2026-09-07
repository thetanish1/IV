"use client";

import React, { useState, useMemo } from "react";
import { Pagination, AdminSearchBar, StatusBadge } from "../common";
import { User, Shield, Eye, EyeOff, Key, Mail, Calendar } from "lucide-react";

interface UsersTabProps {
  users: any[];
  itemsPerPage?: number;
}

export const UsersTab: React.FC<UsersTabProps> = ({
  users,
  itemsPerPage = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [providerFilter, setProviderFilter] = useState("ALL");
  const [revealedPasswords, setRevealedPasswords] = useState<{ [key: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);

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
        u.id?.toLowerCase().includes(q);

      const matchRole =
        roleFilter === "ALL" ||
        (roleFilter === "ADMIN" && (u.role === "admin" || u.role === "super_admin")) ||
        (roleFilter === "STUDENT" && u.role === "student");

      const matchProvider =
        providerFilter === "ALL" ||
        (providerFilter === "GOOGLE" && (u.auth_provider === "google" || !u.is_password_set)) ||
        (providerFilter === "PASSWORD" && u.auth_provider !== "google" && u.is_password_set);

      return matchSearch && matchRole && matchProvider;
    });
  }, [users, searchTerm, roleFilter, providerFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <AdminSearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Search by name, email, or ID..."
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
            className="bg-slate-800/80 border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500/50"
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
            className="bg-slate-800/80 border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="ALL">All Auth Providers</option>
            <option value="PASSWORD">Email & Password</option>
            <option value="GOOGLE">Google OAuth</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="py-4 px-6">User / Account</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Auth Method</th>
                <th className="py-4 px-6">Security / Credential</th>
                <th className="py-4 px-6">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-normal">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No registered user accounts match the current filter.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isPasswordRevealed = !!revealedPasswords[u.id];
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-white/[0.02] transition-colors duration-150"
                    >
                      {/* User / Account */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold shrink-0">
                            {u.full_name ? u.full_name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {u.full_name || "Unnamed User"}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-500" />
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6">
                        {u.role === "super_admin" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <Shield className="w-3 h-3 text-amber-400" /> Super Admin
                          </span>
                        ) : u.role === "admin" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                            <Shield className="w-3 h-3 text-indigo-400" /> Sub Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                            <User className="w-3 h-3 text-cyan-400" /> Student
                          </span>
                        )}
                      </td>

                      {/* Auth Method */}
                      <td className="py-4 px-6">
                        {u.auth_provider === "google" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-300 border border-red-500/20">
                            Google SSO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-white/10">
                            Email & Password
                          </span>
                        )}
                      </td>

                      {/* Security / Credential */}
                      <td className="py-4 px-6">
                        {u.auth_provider === "google" ? (
                          <span className="text-xs text-slate-500 italic">
                            Managed by Google OAuth
                          </span>
                        ) : u.plain_password_hint ? (
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-black/40 border border-white/10 rounded text-xs text-amber-300 font-mono">
                              {isPasswordRevealed ? u.plain_password_hint : "••••••••"}
                            </code>
                            <button
                              onClick={() => togglePasswordReveal(u.id)}
                              className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded transition-colors"
                              title={isPasswordRevealed ? "Hide password hint" : "Show password hint"}
                            >
                              {isPasswordRevealed ? (
                                <EyeOff className="w-4 h-4 text-slate-400" />
                              ) : (
                                <Eye className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Key className="w-3.5 h-3.5 text-emerald-500/70" />
                            <span>Encrypted / Bcrypt Hash</span>
                          </div>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-6 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {u.created_at
                            ? new Date(u.created_at).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-white/10">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};
