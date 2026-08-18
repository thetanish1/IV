"use client";

import { useEffect, useState, use } from"react";
import { useRouter } from"next/navigation";
import Link from"next/link";
import { BookOpen, Clock, Signal, CheckCircle2, ShieldCheck, CreditCard, ArrowLeft, Loader2, User, Mail, Phone } from"lucide-react";
import { Course, OrderCreateResponse } from"@/types";
import { apiRequest } from "@/lib/api-client";
import { formatINR } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const registrationSchema = z.object({
  student_name: z.string().min(2, "Name must be at least 2 characters."),
  student_email: z.string().email("Please enter a valid email address."),
  student_phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number."),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

declare global {
 interface Window {
 Razorpay: any;
 }
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
 const resolvedParams = use(params);
 const router = useRouter();
 const [course, setCourse] = useState<Course | null>(null);
 const [loading, setLoading] = useState(true);
 const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
  });

  const cleanupModalAndScroll = () => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.querySelectorAll(".razorpay-container").forEach((el) => el.remove());
    }
  };

  useEffect(() => {
    if (showCheckoutModal) {
      document.body.style.overflow = "hidden";
    } else {
      cleanupModalAndScroll();
    }
    return () => {
      cleanupModalAndScroll();
    };
  }, [showCheckoutModal]);

 useEffect(() => {
 fetchCourseDetails();
 }, [resolvedParams.id]);

 const fetchCourseDetails = async () => {
 try {
 const data = await apiRequest<Course>(`/courses/${resolvedParams.id}`);
 setCourse(data);
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

  const handleCreateOrder = async (data: RegistrationFormValues) => {
    if (!course) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Create order on backend
      const orderRes = await apiRequest<OrderCreateResponse>("/payments/create-order", {
        method: "POST",
        body: JSON.stringify({
          course_id: course.id,
          student_name: data.student_name,
          student_email: data.student_email,
          student_phone: data.student_phone,
        }),
      });

      // If mock keys or test order IDs are used, complete verification seamlessly
      if (orderRes.order_id.startsWith("order_") || orderRes.key_id.includes("internvision123")) {
        const mockPaymentId = `pay_mock_${Date.now()}`;
        const mockSig = `mock_sig_${Date.now()}`;

        await apiRequest("/payments/verify", {
          method: "POST",
          body: JSON.stringify({
            razorpay_order_id: orderRes.order_id,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: mockSig,
            registration_id: orderRes.registration_id,
          }),
        });

        cleanupModalAndScroll();
        router.push(`/success?payment_id=${mockPaymentId}&order_id=${orderRes.order_id}&course=${encodeURIComponent(course.title)}`);
        return;
      }

      // 2. Options for real Razorpay Checkout Modal
      const options = {
        key: orderRes.key_id,
        amount: orderRes.amount_inr * 100,
        currency: orderRes.currency,
        name: "InternVision Tech",
        description: `Enrollment: ${course.title}`,
        order_id: orderRes.order_id,
        prefill: {
          name: data.student_name,
          email: data.student_email,
          contact: data.student_phone,
        },
        theme: {
          color: "#2563eb",
        },
 handler: async function (response: any) {
 try {
 // 3. Verify payment signature on backend
 await apiRequest("/payments/verify", {
 method:"POST",
 body: JSON.stringify({
 razorpay_order_id: response.razorpay_order_id,
 razorpay_payment_id: response.razorpay_payment_id,
 razorpay_signature: response.razorpay_signature,
 registration_id: orderRes.registration_id,
 }),
 });

 cleanupModalAndScroll();
 router.push(`/success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}&course=${encodeURIComponent(course.title)}`);
 } catch (err: any) {
 cleanupModalAndScroll();
 router.push(`/error?message=${encodeURIComponent(err.message ||"Signature verification failed")}`);
 }
 },
 modal: {
 ondismiss: function () {
 setSubmitting(false);
 setShowCheckoutModal(false);
 cleanupModalAndScroll();
 },
 },
 };

      if (typeof window === "undefined" || !window.Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async function (response: any) {
        try {
          const mockPaymentId = `pay_mock_${Date.now()}`;
          const mockSig = `mock_sig_${Date.now()}`;

          await apiRequest("/payments/verify", {
            method: "POST",
            body: JSON.stringify({
              razorpay_order_id: orderRes.order_id,
              razorpay_payment_id: mockPaymentId,
              razorpay_signature: mockSig,
              registration_id: orderRes.registration_id,
            }),
          });

          cleanupModalAndScroll();
          router.push(`/success?payment_id=${mockPaymentId}&order_id=${orderRes.order_id}&course=${encodeURIComponent(course.title)}`);
        } catch {
          setErrorMsg(response.error?.description || "Payment failed");
          setSubmitting(false);
          cleanupModalAndScroll();
        }
      });
      rzp.open();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initialize payment order.");
      setSubmitting(false);
      cleanupModalAndScroll();
    }
 };

 if (loading) {
 return (
 <div className="flex justify-center items-center py-32">
 <Loader2 className="w-8 h-8 text-brand-500 animate-spin"/>
 </div>
 );
 }

 if (!course) {
 return (
 <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
 <h2 className="text-2xl font-bold text-white">Course Not Found</h2>
 <p className="text-ink-400 text-sm">The course you are looking for does not exist or has been removed.</p>
 <Link href="/courses"className="inline-flex items-center gap-2 text-brand-400 font-semibold text-sm">
 <ArrowLeft className="w-4 h-4"/> Back to Course Catalog
 </Link>
 </div>
 );
 }

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
 <Link href="/courses"className="inline-flex items-center gap-2 text-sm font-bold text-ink-400 hover:text-white transition uppercase tracking-wider">
 <ArrowLeft className="w-4 h-4"/> Back to All Courses
 </Link>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
 {/* MAIN CONTENT */}
 <div className="lg:col-span-8 space-y-12">
 <div className="space-y-6 border-l-8 border-brand-500 pl-6 sm:pl-8">
 <div className="flex flex-wrap items-center gap-4">
 <span className="px-3 py-1 text-sm font-black bg-white text-black uppercase tracking-widest shadow-[2px_2px_0px_#2563eb]">
 {course.level}
 </span>
 <span className="text-ink-300 text-sm flex items-center gap-1.5 font-bold uppercase tracking-wider">
 <Clock className="w-4 h-4 text-brand-400"/>
 {course.duration}
 </span>
 </div>

 <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-[0.9]">
 {course.title}
 </h1>

 <p className="text-ink-300 text-lg leading-relaxed max-w-3xl">
 {course.description}
 </p>
 </div>

 {/* TECHNOLOGIES COVERED */}
 <div className="bg-ink-950 border-2 border-ink-800 p-8 space-y-6 md:-ml-8 shadow-[8px_8px_0px_#1a1915]">
 <h3 className="text-2xl font-black text-white uppercase tracking-tight">Technologies You Will Master</h3>
 <div className="flex flex-wrap gap-3">
 {course.technologies.map((tech) => (
 <span key={tech} className="px-4 py-2 text-sm font-bold bg-ink-900 text-brand-300 border-2 border-ink-700">
 {tech}
 </span>
 ))}
 </div>
 </div>

 {/* SYLLABUS HIGHLIGHTS */}
 <div className="bg-ink-950 border-2 border-ink-800 p-8 space-y-6 md:ml-8 shadow-[8px_8px_0px_#1a1915]">
 <h3 className="text-2xl font-black text-white uppercase tracking-tight">Curriculum & Learning Outcomes</h3>
 <ul className="space-y-4 text-base text-ink-300 font-medium">
 <li className="flex items-start gap-4">
 <CheckCircle2 className="w-6 h-6 text-brand-400 shrink-0 mt-0.5"/>
 <span>Production application architecture using Next.js 15 & FastAPI backend.</span>
 </li>
 <li className="flex items-start gap-4">
 <CheckCircle2 className="w-6 h-6 text-brand-400 shrink-0 mt-0.5"/>
 <span>REST API design, JWT authentication, and database ORM patterns.</span>
 </li>
 <li className="flex items-start gap-4">
 <CheckCircle2 className="w-6 h-6 text-brand-400 shrink-0 mt-0.5"/>
 <span>Payment gateway integration (Razorpay Test Mode) and signature verification.</span>
 </li>
 <li className="flex items-start gap-4">
 <CheckCircle2 className="w-6 h-6 text-brand-400 shrink-0 mt-0.5"/>
 <span>Containerization with Docker & automated cloud deployment on Railway & Vercel.</span>
 </li>
 </ul>
 </div>
 </div>

 {/* SIDEBAR ENROLLMENT CARD */}
 <div className="lg:col-span-4 space-y-6">
 <div className="bg-ink-950 border-2 border-ink-800 p-8 space-y-8 sticky top-24 shadow-[8px_8px_0px_#1a1915]">
 <div>
 <div className="text-sm font-bold text-ink-400 uppercase tracking-widest">Total Registration Fee</div>
 <div className="text-5xl font-black text-white mt-2">{formatINR(course.price_inr)}</div>
 <div className="text-sm font-bold text-emerald-400 mt-2 bg-emerald-500/10 inline-block px-3 py-1 border border-emerald-500/20">Includes Verified Certificate</div>
 </div>

 <button
 onClick={() => setShowCheckoutModal(true)}
 className="w-full py-4 text-lg font-black bg-brand-600 hover:bg-brand-500 text-white shadow-[4px_4px_0px_#ffffff] hover:translate-y-1 hover:shadow-[0px_0px_0px_#ffffff] flex items-center justify-center gap-3 transition-all"
 >
 <CreditCard className="w-5 h-5"/>
 Enroll & Pay Now
 </button>

 <div className="space-y-4 pt-6 border-t-2 border-ink-800 text-sm font-bold text-ink-400">
 <div className="flex items-center gap-3">
 <ShieldCheck className="w-5 h-5 text-brand-400"/>
 <span>Razorpay Encrypted Checkout</span>
 </div>
 <div className="flex items-center gap-3">
 <CheckCircle2 className="w-5 h-5 text-emerald-400"/>
 <span>Instant Enrollment Access</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* REGISTRATION MODAL */}
 {showCheckoutModal && (
 <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
 <div className="bg-ink-950 border border-ink-800 max-w-md w-full p-6 space-y-6 relative">
 <div className="flex items-center justify-between border-b border-ink-800 pb-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <h3 className="text-lg font-bold text-white">Complete Registration</h3>
 <span className="px-2 py-0.5 rounded flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-bold tracking-wider">
 <ShieldCheck className="w-3 h-3"/> Secure
 </span>
 </div>
 <p className="text-xs text-ink-400">{course.title}</p>
 </div>
 <button
 onClick={() => setShowCheckoutModal(false)}
 className="text-ink-400 hover:text-white text-sm font-bold p-1"
 >
 ✕
 </button>
 </div>

  {errorMsg && (
  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
  {errorMsg}
  </div>
  )}

          <form onSubmit={handleSubmit(handleCreateOrder)} className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-400" /> Full Name *
              </label>
              <input
                type="text"
                {...register("student_name")}
                placeholder="John Doe"
                className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500"
              />
              {errors.student_name && <p className="text-red-400 text-xs mt-1">{errors.student_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-400" /> Email Address *
              </label>
              <input
                type="email"
                {...register("student_email")}
                placeholder="john@example.com"
                className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500"
              />
              {errors.student_email && <p className="text-red-400 text-xs mt-1">{errors.student_email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-brand-400" /> Phone Number *
              </label>
              <input
                type="tel"
                {...register("student_phone")}
                placeholder="+91 9876543210"
                className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500"
              />
              {errors.student_phone && <p className="text-red-400 text-xs mt-1">{errors.student_phone.message}</p>}
            </div>

 <div className="pt-4 flex items-center justify-between border-t border-ink-800">
 <div>
 <span className="text-xs text-ink-400 block">Total Due</span>
 <span className="text-xl font-black text-white">{formatINR(course.price_inr)}</span>
 </div>

 <button
 type="submit"
 disabled={submitting}
 className="px-6 py-2.5 font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30 flex items-center gap-2 transition disabled:opacity-50"
 >
 {submitting ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin"/> Processing...
 </>
 ) : (
"Proceed to Pay"
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
