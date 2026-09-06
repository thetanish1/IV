"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Award, CheckCircle2 } from "lucide-react";
import { Course } from "@/types";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    try {
      const appliedList: string[] = JSON.parse(localStorage.getItem("applied_courses") || "[]");
      if (appliedList.includes(course.slug) || appliedList.includes(String(course.id))) {
        setIsApplied(true);
      }
    } catch {}
  }, [course]);

  return (
    <div 
      className="bg-ink-950 border-2 border-ink-800 p-6 sm:p-8 flex flex-col justify-between hover:border-brand-500 hover:shadow-[6px_6px_0px_#2563eb] transition-all group h-full"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 font-bold bg-white text-black uppercase tracking-wider shadow-[2px_2px_0px_#2563eb]">
              {course.level}
            </span>
            {isApplied && (
              <span className="px-2 py-0.5 font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded uppercase text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Applied
              </span>
            )}
          </div>
          <span className="text-ink-400 flex items-center gap-1 font-bold uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5"/>
            {course.duration}
          </span>
        </div>

        <h3 className="text-2xl font-black text-white group-hover:text-brand-400 transition leading-tight uppercase tracking-tight">
          {course.title}
        </h3>

        <p className="text-ink-300 text-sm leading-relaxed line-clamp-3">
          {course.description}
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {course.technologies.map((tech) => (
            <span key={tech} className="px-3 py-1 text-[11px] font-bold uppercase bg-ink-900 text-ink-300 border border-ink-700">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-6 mt-8 border-t-2 border-ink-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] uppercase tracking-wider font-bold mb-1">
            <Award className="w-3 h-3"/> 100% Free Scholarship
          </div>
          <div className="text-2xl font-black text-white">
            {isApplied ? (
              <span className="text-emerald-400 text-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" /> Applied
              </span>
            ) : (
              "Free Enrollment"
            )}
          </div>
        </div>

        <Link
          href={`/courses/${course.slug}`}
          className={`px-5 py-3 text-sm font-bold flex items-center gap-2 shadow-[2px_2px_0px_#ffffff] hover:translate-y-0.5 transition-all ${
            isApplied
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-brand-600 hover:bg-brand-500 text-white"
          }`}
        >
          {isApplied ? "View Status" : "View & Enroll"}
          <ArrowRight className="w-3.5 h-3.5"/>
        </Link>
      </div>
    </div>
  );
}
