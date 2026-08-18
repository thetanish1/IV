"use client";

import Link from"next/link";
import { Signal, Clock, ArrowRight, Award } from"lucide-react";
import { Course } from"@/types";
import { formatINR } from"@/lib/utils";

interface CourseCardProps {
 course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
 return (
 <div 
 className="bg-ink-950 border-2 border-ink-800 p-6 sm:p-8 flex flex-col justify-between hover:border-brand-500 hover:shadow-[6px_6px_0px_#2563eb] transition-all group h-full"
 >
 <div className="space-y-6">
 <div className="flex items-center justify-between text-xs">
 <span className="px-3 py-1 font-bold bg-white text-black uppercase tracking-wider shadow-[2px_2px_0px_#2563eb]">
 {course.level}
 </span>
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
 <div className="flex items-center gap-1.5 text-emerald-400/90 text-[10px] uppercase tracking-wider font-bold mb-1">
 <Award className="w-3 h-3"/> Certificate Included
 </div>
 <div className="text-3xl font-black text-white">{formatINR(course.price_inr)}</div>
 </div>

 <Link
 href={`/courses/${course.slug}`}
 className="px-5 py-3 text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-2 shadow-[2px_2px_0px_#ffffff] hover:translate-y-0.5 hover:shadow-[0px_0px_0px_#ffffff] transition-all"
 >
 View Syllabus
 <ArrowRight className="w-3.5 h-3.5"/>
 </Link>
 </div>
 </div>
 );
}
