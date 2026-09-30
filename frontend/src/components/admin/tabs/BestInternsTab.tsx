"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Trophy,
  Award,
  Star,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Search,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  GraduationCap,
  Globe,
  Clock,
  BookOpen,
  Filter,
} from "lucide-react";
import Image from "next/image";
import { apiRequest, getImageUrl } from "@/lib/api-client";
import { AdminSearchBar, Pagination } from "../common";

export interface BestInternItem {
  id: number;
  student_name: string;
  student_email?: string | null;
  course: string;
  month_year: string;
  award_title?: string | null;
  image_url?: string | null;
  college?: string | null;
  duration?: string | null;
  project_name?: string | null;
  project_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  achievement_summary?: string | null;
  testimonial?: string | null;
  grade?: string | null;
  rating?: number | null;
  is_featured: boolean;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

const POPULAR_TRACKS = [
  "Full Stack Web Development",
  "AI & Machine Learning Engineering",
  "Python Development & Automation",
  "Java & Enterprise Spring Boot",
  "Native Android App Development",
  "Data Science & Visual Analytics",
  "Cloud DevOps & Kubernetes",
  "Cyber Security & Ethical Hacking",
  "UI/UX Design & Product Frontend",
];

const INITIAL_FORM: Partial<BestInternItem> = {
  student_name: "",
  student_email: "",
  course: "Full Stack Web Development",
  month_year: "September 2026",
  award_title: "⭐ Star Intern of the Month",
  image_url: "",
  college: "",
  duration: "1 Month",
  project_name: "",
  project_url: "",
  github_url: "",
  linkedin_url: "",
  achievement_summary: "",
  testimonial: "",
  grade: "Distinction (Grade A+)",
  rating: 5.0,
  is_featured: true,
  is_published: true,
};

export default function BestInternsTab() {
  const [interns, setInterns] = useState<BestInternItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BestInternItem | null>(null);
  const [formData, setFormData] = useState<Partial<BestInternItem>>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Photo Upload State
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Detail Drawer / Preview
  const [viewingItem, setViewingItem] = useState<BestInternItem | null>(null);

  const fetchInterns = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<BestInternItem[]>("/best-interns/admin/all");
      setInterns(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load best interns:", err);
      // Fallback to public endpoint if admin route permissions mismatch
      try {
        const publicData = await apiRequest<BestInternItem[]>("/best-interns");
        setInterns(Array.isArray(publicData) ? publicData : []);
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  // Filter & Search
  const filteredInterns = useMemo(() => {
    return interns.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.college && item.college.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.project_name && item.project_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.course.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTrack =
        selectedTrack === "all" ||
        item.course.toLowerCase().includes(selectedTrack.toLowerCase());

      const matchMonth =
        selectedMonth === "all" ||
        item.month_year.toLowerCase().includes(selectedMonth.toLowerCase());

      return matchSearch && matchTrack && matchMonth;
    });
  }, [interns, searchQuery, selectedTrack, selectedMonth]);

  const totalPages = Math.ceil(filteredInterns.length / pageSize) || 1;
  const paginatedInterns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInterns.slice(start, start + pageSize);
  }, [filteredInterns, currentPage, pageSize]);

  // Unique Month options from existing data
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    interns.forEach((i) => {
      if (i.month_year) months.add(i.month_year);
    });
    return Array.from(months);
  }, [interns]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      ...INITIAL_FORM,
      month_year: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    });
    setPhotoPreview("");
    setFormError("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: BestInternItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setPhotoPreview(item.image_url ? getImageUrl(item.image_url) : "");
    setFormError("");
    setIsModalOpen(true);
  };

  // Photo Upload Handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please upload an image file (PNG, JPG, WEBP).");
      return;
    }

    // Local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);

    setUploadingPhoto(true);
    setFormError("");
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await apiRequest<{ success: boolean; url: string }>(
        "/best-interns/upload-photo",
        {
          method: "POST",
          body: uploadFormData,
        }
      );

      if (res?.url) {
        setFormData((prev) => ({ ...prev, image_url: res.url }));
        setPhotoPreview(getImageUrl(res.url));
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setFormError(err.message || "Failed to upload photo. You can also paste an image URL directly.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_name?.trim()) {
      setFormError("Student Name is required.");
      return;
    }
    if (!formData.course?.trim()) {
      setFormError("Course / Internship Track is required.");
      return;
    }
    if (!formData.month_year?.trim()) {
      setFormError("Month & Year is required (e.g. September 2026).");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (editingItem) {
        // Update
        const updated = await apiRequest<BestInternItem>(
          `/best-interns/${editingItem.id}`,
          {
            method: "PUT",
            body: JSON.stringify(formData),
          }
        );
        setInterns((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
      } else {
        // Create
        const created = await apiRequest<BestInternItem>("/best-interns", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        setInterns((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Save error:", err);
      setFormError(err.message || "Failed to save Best Intern details.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (id: number) => {
    try {
      const res = await apiRequest<{ success: boolean; is_featured: boolean }>(
        `/best-interns/${id}/toggle-featured`,
        { method: "PATCH" }
      );
      setInterns((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_featured: res.is_featured } : item
        )
      );
    } catch (err: any) {
      console.error("Toggle featured error:", err);
      alert(err.message || "Failed to toggle featured status");
    }
  };

  // Toggle Publish
  const handleTogglePublish = async (id: number) => {
    try {
      const res = await apiRequest<{ success: boolean; is_published: boolean }>(
        `/best-interns/${id}/toggle-publish`,
        { method: "PATCH" }
      );
      setInterns((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_published: res.is_published } : item
        )
      );
    } catch (err: any) {
      console.error("Toggle publish error:", err);
      alert(err.message || "Failed to toggle publish status");
    }
  };

  // Delete
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from Best Interns?`)) {
      return;
    }
    try {
      await apiRequest(`/best-interns/${id}`, { method: "DELETE" });
      setInterns((prev) => prev.filter((item) => item.id !== id));
      if (viewingItem?.id === id) setViewingItem(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.message || "Failed to delete record");
    }
  };

  // Metrics
  const featuredCount = interns.filter((i) => i.is_featured).length;
  const publishedCount = interns.filter((i) => i.is_published).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-purple-500/10 border border-amber-500/20 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Best Intern of the Month (Hall of Fame)
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-ink-400">
            Showcase top-performing students on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-ink-900 dark:hover:bg-ink-800 text-gray-700 dark:text-ink-300 border border-gray-200 dark:border-ink-700 flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View on Homepage
          </a>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Add Best Intern
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950 shadow-sm">
          <div className="text-xs font-medium text-gray-500 dark:text-ink-400">Total Honored Interns</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{interns.length}</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950 shadow-sm">
          <div className="text-xs font-medium text-amber-500 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Featured on Homepage
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{featuredCount}</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950 shadow-sm">
          <div className="text-xs font-medium text-emerald-500 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> Live Published
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{publishedCount}</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950 shadow-sm">
          <div className="text-xs font-medium text-blue-500 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> Distinct Honor Rate
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">100% Grade A+</div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-ink-950 border border-gray-200 dark:border-ink-800 shadow-sm">
        <div className="flex-1">
          <AdminSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by student name, college, domain track, or project..."
            className="w-full sm:w-full"
            accentColor="brand"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-ink-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedTrack}
              onChange={(e) => {
                setSelectedTrack(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-ink-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Tech Tracks</option>
              {POPULAR_TRACKS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {availableMonths.length > 0 && (
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-ink-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Months</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}

          {(searchQuery || selectedTrack !== "all" || selectedMonth !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTrack("all");
                setSelectedMonth("all");
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Interns Grid View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-gray-100 dark:bg-ink-900 border border-gray-200 dark:border-ink-800"
            />
          ))}
        </div>
      ) : paginatedInterns.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-gray-300 dark:border-ink-800 bg-white dark:bg-ink-950/50 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No Best Intern Records Found</h3>
            <p className="text-xs text-gray-500 dark:text-ink-400">
              {searchQuery || selectedTrack !== "all" || selectedMonth !== "all"
                ? "No matching records found with current filters."
                : "Add your first Star Intern of the Month to showcase them on the homepage!"}
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-black inline-flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" /> Add Intern Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {paginatedInterns.map((item) => {
            const displayImg = item.image_url ? getImageUrl(item.image_url) : null;
            return (
              <div
                key={item.id}
                className={`relative rounded-2xl border transition-all flex flex-col justify-between overflow-hidden group bg-white dark:bg-ink-950 ${
                  item.is_featured
                    ? "border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                    : "border-gray-200 dark:border-ink-800 hover:border-gray-300 dark:hover:border-ink-700 shadow-sm"
                }`}
              >
                {/* Top Spotlight Ribbon if Featured */}
                {item.is_featured && (
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-3 py-1 text-[10px] font-black uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-black" /> Homepage Spotlight
                    </span>
                    <span className="font-mono text-[9px]">{item.month_year}</span>
                  </div>
                )}

                <div className="p-5 space-y-4">
                  {/* Photo & Identity Header */}
                  <div className="flex items-start gap-3.5">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-ink-900 border border-gray-200 dark:border-ink-700 shrink-0">
                      {displayImg ? (
                        <Image
                          src={displayImg}
                          alt={item.student_name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg bg-gradient-to-br from-amber-500/20 to-brand-500/20 text-amber-500">
                          {item.student_name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {item.student_name}
                      </h4>
                      <p className="text-[11px] text-brand-600 dark:text-brand-400 font-medium truncate">
                        {item.course}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-ink-400 mt-0.5 truncate">
                        <GraduationCap className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.college || "College / University"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Award Badge Pill */}
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-ink-900/80 border border-gray-100 dark:border-ink-800 text-[11px] flex items-center justify-between">
                    <span className="font-semibold text-gray-800 dark:text-ink-200 truncate">
                      {item.award_title || "Star Intern of the Month"}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {item.grade || "Grade A+"}
                    </span>
                  </div>

                  {/* Project & Achievement Snippet */}
                  {item.project_name && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-ink-500">
                        Capstone Project
                      </div>
                      <p className="text-xs font-medium text-gray-700 dark:text-ink-300 line-clamp-2">
                        {item.project_name}
                      </p>
                    </div>
                  )}

                  {item.achievement_summary && (
                    <p className="text-[11px] text-gray-500 dark:text-ink-400 line-clamp-2 leading-relaxed italic">
                      "{item.achievement_summary}"
                    </p>
                  )}
                </div>

                {/* Footer Controls & Toggles */}
                <div className="p-3 bg-gray-50/80 dark:bg-ink-900/60 border-t border-gray-100 dark:border-ink-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Homepage Toggle Button */}
                    <button
                      onClick={() => handleToggleFeatured(item.id)}
                      title={item.is_featured ? "Remove from Homepage Spotlight" : "Feature on Homepage"}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                        item.is_featured
                          ? "bg-amber-500 text-black shadow-sm"
                          : "bg-gray-200 dark:bg-ink-800 text-gray-600 dark:text-ink-400 hover:text-amber-500"
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.is_featured ? "fill-black" : ""}`} />
                    </button>

                    {/* Published Visibility Toggle */}
                    <button
                      onClick={() => handleTogglePublish(item.id)}
                      title={item.is_published ? "Published (Click to hide)" : "Draft (Click to publish)"}
                      className={`p-1.5 rounded-lg text-xs transition ${
                        item.is_published
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-gray-200 dark:bg-ink-800 text-gray-400"
                      }`}
                    >
                      {item.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Edit Details"
                      className="p-1.5 rounded-lg text-gray-600 dark:text-ink-300 hover:bg-gray-200 dark:hover:bg-ink-800 hover:text-brand-500 transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.student_name)}
                      title="Delete Record"
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* ─── ADD / EDIT MODAL ────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-ink-950 border border-gray-200 dark:border-ink-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-ink-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editingItem ? "Edit Best Intern Details" : "Add Best Intern of the Month"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-ink-400">
                    Candidate will be showcased on homepage and public Hall of Fame.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-ink-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              {/* Photo Upload Section */}
              <div className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-ink-700 bg-gray-50 dark:bg-ink-900/50 space-y-3">
                <label className="block text-xs font-bold text-gray-700 dark:text-ink-300 uppercase tracking-wider">
                  Candidate Profile Photo / Avatar
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Image Preview Box */}
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-200 dark:bg-ink-800 border-2 border-brand-500/40 shrink-0 shadow-inner flex items-center justify-center">
                    {photoPreview ? (
                      <Image
                        src={photoPreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <span className="text-[11px] text-gray-500 dark:text-ink-400">
                        PNG, JPG or WEBP (Square 1:1 recommended)
                      </span>
                    </div>

                    {/* Direct Image URL input as fallback */}
                    <input
                      type="text"
                      placeholder="Or paste direct image URL (e.g. https://...)"
                      value={formData.image_url || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        setPhotoPreview(getImageUrl(e.target.value));
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Core Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-ink-300">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alice"
                    value={formData.student_name || ""}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-ink-700 bg-gray-50 dark:bg-ink-900 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-ink-300">
                    Student Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. alice@example.com"
                    value={formData.student_email || ""}
                    onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-ink-700 bg-gray-50 dark:bg-ink-900 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-ink-300">
                    Internship Domain Track <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.course || "Full Stack Web Development"}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-ink-700 bg-gray-50 dark:bg-ink-900 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  >
                    {POPULAR_TRACKS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-ink-300">
                    Month & Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. September 2026"
                    value={formData.month_year || ""}
                    onChange={(e) => setFormData({ ...formData, month_year: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-ink-700 bg-gray-50 dark:bg-ink-900 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-ink-300">
                    Award Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ⭐ Star Intern of the Month"
                    value={formData.award_title || ""}
                    onChange={(e) => setFormData({ ...formData, award_title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-ink-700 bg-gray-50 dark:bg-ink-900 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-ink-300">
                    College / University Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Government College of Engineering"
                    value={formData.college || ""}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-ink-700 bg-gray-50 dark:bg-ink-900 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-ink-300">
                    Internship Duration
                  </label>
                  <select
                    value={formData.duration || "1 Month"}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-ink-700 bg-gray-50 dark:bg-ink-900 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="1 Month">1 Month</option>
                    <option value="2 Months">2 Months</option>
                    <option value="3 Months">3 Months</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-ink-300">
                    Grade / Performance
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Distinction (Grade A+)"
                    value={formData.grade || "Distinction (Grade A+)"}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-ink-700 bg-gray-50 dark:bg-ink-900 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Project & Social Links */}
              <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-ink-800">
                <div className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Project & Portfolio Highlights
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-ink-300">
                      Key Capstone Project Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AI-Powered Task Orchestration System"
                      value={formData.project_name || ""}
                      onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-ink-700 bg-gray-50 dark:bg-ink-900 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-ink-300">
                      Live Project / Demo Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.project_url || ""}
                      onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-ink-700 bg-gray-50 dark:bg-ink-900 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-ink-300">
                      GitHub Repository / Profile
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={formData.github_url || ""}
                      onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-ink-700 bg-gray-50 dark:bg-ink-900 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-ink-300">
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      value={formData.linkedin_url || ""}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-ink-700 bg-gray-50 dark:bg-ink-900 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Achievement Summary & Student Review */}
              <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-ink-800">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-ink-300">
                    Mentor Citation & Achievement Highlights
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief review of what the intern achieved, technical milestones met, exemplary dedication..."
                    value={formData.achievement_summary || ""}
                    onChange={(e) => setFormData({ ...formData, achievement_summary: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-ink-700 bg-gray-50 dark:bg-ink-900 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-ink-300">
                    Student Testimonial / Quote
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Quote from the student about their internship learning experience at InternVision..."
                    value={formData.testimonial || ""}
                    onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-ink-700 bg-gray-50 dark:bg-ink-900 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Toggles: Featured & Published */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-ink-800">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-ink-700 bg-gray-50 dark:bg-ink-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured ?? true}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Feature on Homepage Spotlight
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-ink-400">
                      Prominently showcases this intern on homepage
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-ink-700 bg-gray-50 dark:bg-ink-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published ?? true}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400"
                  />
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-emerald-500" /> Publicly Visible
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-ink-400">
                      Published on Hall of Fame gallery
                    </div>
                  </div>
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-ink-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-600 dark:text-ink-300 hover:bg-gray-100 dark:hover:bg-ink-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingPhoto}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1.5 shadow transition disabled:opacity-50"
                >
                  {saving ? (
                    <span>Saving Record...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {editingItem ? "Update Best Intern" : "Create Best Intern"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
