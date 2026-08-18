"use client";

import { useEffect, useState } from"react";
import { BookOpen, Search, Filter, Loader2 } from"lucide-react";
import { Course } from"@/types";
import { apiRequest } from"@/lib/api-client";
import { CourseCard } from"@/components/cards/CourseCard";
import { FadeIn } from "@/components/animations/FadeIn";

export default function CoursesPage() {
 const [courses, setCourses] = useState<Course[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [levelFilter, setLevelFilter] = useState("all");

 useEffect(() => {
 fetchCourses();
 }, [levelFilter]);

 const fetchCourses = async () => {
 setLoading(true);
 try {
 let endpoint ="/courses";
 const params = new URLSearchParams();
 if (levelFilter !=="all") params.set("level", levelFilter);
 if (params.toString()) endpoint += `?${params.toString()}`;

 const data = await apiRequest<Course[]>(endpoint);
 setCourses(data);
 } catch (err) {
 console.error("Failed to load courses", err);
 } finally {
 setLoading(false);
 }
 };

 const filteredCourses = courses.filter((c) =>
 c.title.toLowerCase().includes(search.toLowerCase()) ||
 c.description.toLowerCase().includes(search.toLowerCase())
 );

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
 <div className="text-left space-y-4 max-w-4xl border-l-8 border-brand-500 pl-6 sm:pl-10">
 <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight uppercase leading-[0.9]">
 Explore Industry <br/><span className="text-brand-400">Bootcamps</span>
 </h1>
 <p className="text-ink-300 text-lg sm:text-xl font-medium pt-4 max-w-2xl">
 Comprehensive, project-driven training programs engineered to make you job-ready.
 </p>
 </div>

 <div className="bg-ink-950 border-2 border-ink-800 p-6 flex flex-col md:flex-row gap-6 items-end justify-between shadow-[8px_8px_0px_#1a1915]">
 <div className="w-full md:w-[28rem] space-y-2">
 <label className="text-xs font-bold text-ink-400 uppercase tracking-widest">Search</label>
 <div className="relative">
 <Search className="w-5 h-5 absolute left-4 top-3.5 text-ink-500"/>
 <input
 type="text"
 placeholder="Search courses or technologies..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full bg-ink-900 border-2 border-ink-700 pl-12 pr-4 py-3 text-base font-medium text-white focus:outline-none focus:border-brand-500 transition-colors"
 />
 </div>
 </div>

 <div className="w-full md:w-64 space-y-2">
 <label className="text-xs font-bold text-ink-400 uppercase tracking-widest flex items-center gap-2">
 <Filter className="w-3.5 h-3.5"/> Filter by Level
 </label>
 <select
 value={levelFilter}
 onChange={(e) => setLevelFilter(e.target.value)}
 className="w-full bg-ink-900 border-2 border-ink-700 px-4 py-3 text-base font-medium text-white focus:outline-none focus:border-brand-500 transition-colors cursor-pointer appearance-none"
 >
 <option value="all">All Levels</option>
 <option value="Beginner">Beginner</option>
 <option value="Intermediate">Intermediate</option>
 <option value="Advanced">Advanced</option>
 </select>
 </div>
 </div>

 {loading ? (
 <div className="flex justify-center items-center py-32">
 <Loader2 className="w-10 h-10 text-brand-500 animate-spin"/>
 </div>
 ) : filteredCourses.length === 0 ? (
 <div className="bg-ink-950 border-2 border-ink-800 p-16 text-center text-ink-400 space-y-4">
 <BookOpen className="w-12 h-12 mx-auto text-ink-600"/>
 <p className="text-xl font-bold text-white">No courses match your search criteria.</p>
 <p className="text-sm text-ink-400">Try clearing filters or searching for different keywords.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 pt-8">
 {filteredCourses.map((course) => (
 <CourseCard key={course.id} course={course} />
 ))}
 </div>
 )}
 </div>
 );
}
