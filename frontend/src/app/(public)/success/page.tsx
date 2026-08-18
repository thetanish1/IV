"use client";

import { useSearchParams } from"next/navigation";
import Link from"next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Download, Sparkles } from"lucide-react";
import { Suspense } from"react";

function SuccessContent() {
 const searchParams = useSearchParams();
 const type = searchParams.get("type");
 const name = searchParams.get("name");
 const duration = searchParams.get("duration");
 const paymentId = searchParams.get("payment_id");
 const orderId = searchParams.get("order_id");
 const courseName = searchParams.get("course");

 const isApplication = type ==="application";

 return (
 <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-8">
 <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-emerald-500/20">
 <CheckCircle2 className="w-10 h-10"/>
 </div>

 <div className="space-y-3">
 <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
 {isApplication ?"Application Received":"Payment Verified & Enrollment Confirmed"}
 </span>
 <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
 {isApplication ? `Welcome Aboard, ${name ||"Applicant"}!` :"Registration Successful!"}
 </h1>
 <p className="text-ink-400 text-sm max-w-md mx-auto leading-relaxed">
 {isApplication
 ? `Your application for the ${duration ||"3 Months"} Internship Track has been submitted to the admissions team.`
 : `You have successfully enrolled in ${courseName ||"your selected course"}. A receipt and onboarding instructions have been dispatched.`}
 </p>
 </div>

 {/* DETAILS CARD */}
 <div className="glass-card p-6 text-left space-y-3 text-xs border border-ink-800">
 <div className="font-bold text-ink-200 border-b border-ink-800 pb-2 flex justify-between items-center">
 <span>Transaction Summary</span>
 <span className="text-emerald-400 font-mono">STATUS: CONFIRMED</span>
 </div>
 {!isApplication && (
 <>
 <div className="flex justify-between text-ink-400">
 <span>Razorpay Payment ID:</span>
 <span className="font-mono text-ink-200">{paymentId ||"N/A"}</span>
 </div>
 <div className="flex justify-between text-ink-400">
 <span>Razorpay Order ID:</span>
 <span className="font-mono text-ink-200">{orderId ||"N/A"}</span>
 </div>
 <div className="flex justify-between text-ink-400">
 <span>Enrolled Course:</span>
 <span className="text-white font-medium">{courseName}</span>
 </div>
 </>
 )}
 {isApplication && (
 <>
 <div className="flex justify-between text-ink-400">
 <span>Applicant Name:</span>
 <span className="text-white font-medium">{name}</span>
 </div>
 <div className="flex justify-between text-ink-400">
 <span>Internship Track Duration:</span>
 <span className="text-brand-400 font-semibold">{duration}</span>
 </div>
 </>
 )}
 </div>

 <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
 <Link
 href="/courses"
 className="w-full sm:w-auto px-6 py-3 font-semibold bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center gap-2 transition"
 >
 Explore More Courses <ArrowRight className="w-4 h-4"/>
 </Link>
 <Link
 href="/"
 className="w-full sm:w-auto px-6 py-3 font-semibold bg-ink-800 hover:bg-ink-700 text-ink-300 border border-ink-700 transition"
 >
 Return to Home
 </Link>
 </div>
 </div>
 );
}

export default function SuccessPage() {
 return (
 <Suspense fallback={<div className="text-center py-20 text-ink-400">Loading receipt...</div>}>
 <SuccessContent />
 </Suspense>
 );
}
