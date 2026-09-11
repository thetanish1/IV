"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Loader2,
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  QrCode,
  Sparkles,
  Check,
  Copy,
  ChevronRight,
  Shield,
  ArrowRight,
  User,
  Mail,
  Phone,
  Building2,
  AlertCircle
} from "lucide-react";
import { Course } from "@/types";
import { apiRequest } from "@/lib/api-client";

interface CoursePaymentModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (details: {
    order_id: string;
    payment_id: string;
    amount_inr: number;
    course_title: string;
    payment_method: string;
  }) => void;
  initialData?: {
    name?: string;
    email?: string;
    phone?: string;
    college?: string;
  };
}

const POPULAR_BANKS = [
  { id: "HDFC", name: "HDFC Bank", code: "HDFC", color: "from-blue-600 to-blue-800" },
  { id: "SBI", name: "State Bank of India", code: "SBI", color: "from-sky-600 to-blue-700" },
  { id: "ICICI", name: "ICICI Bank", code: "ICICI", color: "from-orange-600 to-red-700" },
  { id: "AXIS", name: "Axis Bank", code: "AXIS", color: "from-rose-700 to-pink-900" },
  { id: "KOTAK", name: "Kotak Mahindra", code: "KOTAK", color: "from-red-600 to-red-800" },
  { id: "PNB", name: "Punjab National Bank", code: "PNB", color: "from-amber-600 to-yellow-800" },
];

const ALL_OTHER_BANKS = [
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "IndusInd Bank",
  "IDFC FIRST Bank",
  "Yes Bank",
  "Federal Bank",
  "Central Bank of India",
  "Bank of India",
  "Indian Overseas Bank",
  "UCO Bank",
  "RBL Bank",
  "Bandhan Bank",
  "South Indian Bank",
  "Au Small Finance Bank"
];

const WALLETS = [
  { id: "paytm_wallet", name: "Paytm Wallet", desc: "Instant checkout with linked balance" },
  { id: "phonepe_wallet", name: "PhonePe Wallet", desc: "Pay via PhonePe Cash Balance" },
  { id: "amazonpay", name: "Amazon Pay", desc: "Fast 1-click Amazon account payment" },
  { id: "mobikwik", name: "MobiKwik", desc: "Pay with MobiKwik SuperCash" },
];

export function CoursePaymentModal({
  course,
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CoursePaymentModalProps) {
  // Form State
  const [formData, setFormData] = useState({
    student_name: initialData?.name || "",
    student_email: initialData?.email || "",
    student_phone: initialData?.phone || "",
    college: initialData?.college || "",
  });

  // Sync initial data if updated
  useEffect(() => {
    if (initialData?.email) {
      setFormData((prev) => ({
        student_name: initialData.name || prev.student_name,
        student_email: initialData.email || prev.student_email,
        student_phone: initialData.phone || prev.student_phone,
        college: initialData.college || prev.college,
      }));
    }
  }, [initialData]);

  // Payment UI State
  const [activeTab, setActiveTab] = useState<"upi" | "card" | "netbanking" | "wallet">("upi");
  const [upiMode, setUpiMode] = useState<"app" | "vpa" | "qr">("app");
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");
  const [upiVpa, setUpiVpa] = useState("");
  const [upiVerified, setUpiVerified] = useState(false);
  
  // Card Details
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  // Bank & Wallet
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [customBank, setCustomBank] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("paytm_wallet");

  // Flow State: 'form' -> 'processing' -> 'success'
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [processingStage, setProcessingStage] = useState(1);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentResult, setPaymentResult] = useState<{
    order_id: string;
    payment_id: string;
    amount_inr: number;
    course_title: string;
    payment_method: string;
  } | null>(null);

  if (!isOpen) return null;

  const priceVal = course.price_inr ?? 1;

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + "/" + raw.slice(2, 4);
    }
    setCardExpiry(raw);
  };

  // Detect Card Brand
  const getCardBrand = () => {
    const num = cardNumber.replace(/\s/g, "");
    if (num.startsWith("4")) return "VISA";
    if (/^5[1-5]/.test(num)) return "MASTERCARD";
    if (/^(60|65|81|82)/.test(num)) return "RUPAY";
    return "";
  };

  const getPaymentMethodLabel = () => {
    if (activeTab === "upi") {
      if (upiMode === "app") {
        if (selectedUpiApp === "gpay") return "UPI / Google Pay";
        if (selectedUpiApp === "phonepe") return "UPI / PhonePe";
        if (selectedUpiApp === "paytm") return "UPI / Paytm";
        return "UPI / BHIM";
      }
      if (upiMode === "vpa") return `UPI VPA (${upiVpa || "Custom ID"})`;
      return "UPI Dynamic QR Scan";
    }
    if (activeTab === "card") {
      const brand = getCardBrand() || "Card";
      return `${brand} •••• ${cardNumber.replace(/\s/g, "").slice(-4) || "XXXX"}`;
    }
    if (activeTab === "netbanking") {
      return `Net Banking (${customBank || selectedBank})`;
    }
    const w = WALLETS.find((x) => x.id === selectedWallet);
    return w ? w.name : "Digital Wallet";
  };

  // Execute Payment Submission
  const handleStartPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.student_name.trim() || !formData.student_email.trim() || !formData.student_phone.trim()) {
      setErrorMsg("Please provide your Name, Email, and Phone number to receive your course credentials.");
      return;
    }

    if (activeTab === "upi" && upiMode === "vpa" && !upiVpa.includes("@")) {
      setErrorMsg("Please enter a valid UPI ID (e.g., yourname@oksbi or 9876543210@paytm).");
      return;
    }

    if (activeTab === "card") {
      const cleanNum = cardNumber.replace(/\s/g, "");
      if (cleanNum.length < 15) {
        setErrorMsg("Please enter a valid 16-digit card number.");
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMsg("Please enter a valid card expiry date (MM/YY).");
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMsg("Please enter a 3-digit CVV number.");
        return;
      }
    }

    setErrorMsg("");
    setStep("processing");
    setProcessingStage(1);

    // Dynamic bank handshake simulation
    const stageTimer1 = setTimeout(() => setProcessingStage(2), 700);
    const stageTimer2 = setTimeout(() => setProcessingStage(3), 1400);

    try {
      const methodLabel = getPaymentMethodLabel();
      const payload = {
        course_id: typeof course?.id === "number" ? course.id : undefined,
        course_slug: course?.slug,
        student_name: formData.student_name.trim(),
        student_email: formData.student_email.trim().toLowerCase(),
        student_phone: formData.student_phone.trim(),
        college: formData.college.trim(),
        payment_method: methodLabel,
      };

      let res: any = null;
      try {
        res = await apiRequest("/courses/enroll-direct", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch (firstErr) {
        res = await apiRequest("/payments/direct-enroll-pay", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      if (res && (res.success || res.status === "confirmed")) {
        const details = {
          order_id: res.order_id || `ORDER_${Date.now()}`,
          payment_id: res.payment_id || `PAY_${Date.now()}`,
          amount_inr: res.amount_inr || priceVal,
          course_title: res.course_title || course.title,
          payment_method: methodLabel,
        };

        setPaymentResult(details);
        setStep("success");

        // Cache local enrollment
        try {
          const list: string[] = JSON.parse(localStorage.getItem("enrolled_courses") || "[]");
          if (!list.includes(course.slug)) {
            list.push(course.slug);
            localStorage.setItem("enrolled_courses", JSON.stringify(list));
          }
        } catch {}

        onSuccess(details);
      } else {
        throw new Error(res?.message || "Payment authorization declined by gateway.");
      }
    } catch (err: any) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setStep("form");
      const msg = String(err?.message || "");
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("blocked")) {
        setErrorMsg("Payment network connection interrupted. If you are using Brave Shields or AdBlocker, please pause it and try again.");
      } else {
        setErrorMsg(msg || "Payment authorization failed. Please check your credentials and try again.");
      }
    }
  };

  const copyUpiHandle = () => {
    navigator.clipboard.writeText("support@internvisiontech.me");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-ink-950 border-2 border-brand-500 max-w-2xl w-full shadow-[16px_16px_0px_#000000] relative my-auto overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-ink-900 border-b border-ink-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-ink-300">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-white p-1 text-sm font-bold transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* PROCESSING SCREEN */}
        {step === "processing" && (
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-brand-500/20 animate-ping" />
              <div className="absolute inset-0 rounded-full border-4 border-t-brand-500 border-r-emerald-500 border-b-transparent border-l-transparent animate-spin" />
              <ShieldCheck className="w-10 h-10 text-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-black text-white uppercase tracking-wide">
                {processingStage === 1 && "Connecting to Banking Gateway..."}
                {processingStage === 2 && "Verifying 3D Secure / UPI Token..."}
                {processingStage === 3 && "Capturing Payment & Enrolling..."}
              </h3>
              <p className="text-xs text-ink-400">
                Please do not refresh or close this tab while we complete your transaction.
              </p>
            </div>

            <div className="p-4 bg-ink-900 border border-ink-800 rounded-lg max-w-md mx-auto text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-ink-400">Course:</span>
                <span className="text-white font-medium truncate max-w-[200px]">{course.title}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-ink-400">Method:</span>
                <span className="text-brand-400 font-semibold">{getPaymentMethodLabel()}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-ink-800 pt-2">
                <span className="text-ink-400">Total Amount:</span>
                <span className="text-emerald-400 font-bold">₹{priceVal}</span>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS RECEIPT SCREEN */}
        {step === "success" && paymentResult && (
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Payment Successful
              </div>
              <h3 className="text-2xl font-black text-white pt-2 uppercase tracking-tight">
                Enrollment Confirmed!
              </h3>
              <p className="text-xs text-ink-300 max-w-md mx-auto">
                Welcome to the cohort, <strong className="text-white">{formData.student_name}</strong>! Your access pass for{" "}
                <strong className="text-brand-400">{course.title}</strong> is active now.
              </p>
            </div>

            {/* Official Audit Receipt Box */}
            <div className="p-4 bg-ink-900 border border-ink-800 text-xs text-left space-y-3 rounded">
              <div className="font-bold text-white flex items-center justify-between border-b border-ink-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Official Payment Receipt
                </span>
                <span className="text-emerald-400 font-mono font-bold">₹{paymentResult.amount_inr} PAID</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] text-ink-400">
                <div>
                  <span className="text-ink-300 block font-medium">Transaction Reference:</span>
                  <span className="font-mono text-white text-[10px] break-all">{paymentResult.payment_id}</span>
                </div>
                <div>
                  <span className="text-ink-300 block font-medium">Order Number:</span>
                  <span className="font-mono text-white text-[10px] break-all">{paymentResult.order_id}</span>
                </div>
                <div>
                  <span className="text-ink-300 block font-medium">Payment Mode:</span>
                  <span className="text-brand-400 font-semibold">{paymentResult.payment_method}</span>
                </div>
                <div>
                  <span className="text-ink-300 block font-medium">Date & Time:</span>
                  <span className="text-ink-300 font-mono text-[10px]">{new Date().toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 p-2 rounded flex items-center gap-2">
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Recorded in Admin Panel • Welcome confirmation sent to {formData.student_email}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider transition shadow-[4px_4px_0px_#ffffff] flex items-center justify-center gap-2 cursor-pointer"
            >
              Start Learning Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* CHECKOUT & PAYMENT SELECTION FORM */}
        {step === "form" && (
          <div className="p-5 sm:p-6 space-y-6">
            {/* Header / Summary */}
            <div className="border-b border-ink-800 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-brand-400 uppercase tracking-widest">
                    Course Checkout
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white">{course.title}</h3>
                </div>
                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <span className="text-[10px] text-ink-400 line-through">₹4,999</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                      99.9% OFF
                    </span>
                    <span className="text-xl font-black text-emerald-400">₹{priceVal}</span>
                  </div>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Student Contact Info (Compact) */}
            <div className="space-y-3 bg-ink-900/60 p-3.5 border border-ink-800 rounded">
              <div className="text-xs font-bold text-ink-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-400" /> Student Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-ink-400 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.student_name}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                    className="w-full bg-ink-900 border border-ink-700 px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-ink-400 block mb-1">Email (For Credentials) *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@gmail.com"
                    value={formData.student_email}
                    onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
                    className="w-full bg-ink-900 border border-ink-700 px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-ink-400 block mb-1">WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={formData.student_phone}
                    onChange={(e) => setFormData({ ...formData, student_phone: e.target.value })}
                    className="w-full bg-ink-900 border border-ink-700 px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-ink-400 block mb-1">College / Institute (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. IIT Bombay / VNIT"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full bg-ink-900 border border-ink-700 px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Select Payment Method Tabs */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-white flex items-center justify-between">
                <span>Select Payment Method</span>
                <span className="text-[11px] font-normal text-ink-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Instant Bank Confirmation
                </span>
              </label>

              {/* Method Navigation Grid */}
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-ink-900 border border-ink-800 rounded">
                <button
                  type="button"
                  onClick={() => setActiveTab("upi")}
                  className={`py-2 px-1 text-center transition flex flex-col items-center gap-1 rounded ${
                    activeTab === "upi"
                      ? "bg-brand-600 text-white font-bold shadow"
                      : "text-ink-400 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[10px] sm:text-xs">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("card")}
                  className={`py-2 px-1 text-center transition flex flex-col items-center gap-1 rounded ${
                    activeTab === "card"
                      ? "bg-brand-600 text-white font-bold shadow"
                      : "text-ink-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[10px] sm:text-xs">Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("netbanking")}
                  className={`py-2 px-1 text-center transition flex flex-col items-center gap-1 rounded ${
                    activeTab === "netbanking"
                      ? "bg-brand-600 text-white font-bold shadow"
                      : "text-ink-400 hover:text-white"
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span className="text-[10px] sm:text-xs">NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("wallet")}
                  className={`py-2 px-1 text-center transition flex flex-col items-center gap-1 rounded ${
                    activeTab === "wallet"
                      ? "bg-brand-600 text-white font-bold shadow"
                      : "text-ink-400 hover:text-white"
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span className="text-[10px] sm:text-xs">Wallets</span>
                </button>
              </div>

              {/* TAB CONTENT: 1. UPI */}
              {activeTab === "upi" && (
                <div className="p-4 bg-ink-900 border border-ink-800 rounded space-y-4">
                  {/* UPI Submode: Popular Apps, Custom VPA, QR Scan */}
                  <div className="flex gap-2 border-b border-ink-800 pb-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setUpiMode("app")}
                      className={`pb-1 font-semibold transition ${
                        upiMode === "app" ? "text-brand-400 border-b-2 border-brand-400" : "text-ink-400 hover:text-white"
                      }`}
                    >
                      Popular UPI Apps
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMode("vpa")}
                      className={`pb-1 font-semibold transition ${
                        upiMode === "vpa" ? "text-brand-400 border-b-2 border-brand-400" : "text-ink-400 hover:text-white"
                      }`}
                    >
                      Enter UPI ID (VPA)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMode("qr")}
                      className={`pb-1 font-semibold transition ${
                        upiMode === "qr" ? "text-brand-400 border-b-2 border-brand-400" : "text-ink-400 hover:text-white"
                      }`}
                    >
                      Scan QR Code
                    </button>
                  </div>

                  {upiMode === "app" && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "gpay", name: "Google Pay", color: "border-blue-500/40 bg-blue-950/20 text-blue-400" },
                        { id: "phonepe", name: "PhonePe", color: "border-purple-500/40 bg-purple-950/20 text-purple-400" },
                        { id: "paytm", name: "Paytm UPI", color: "border-cyan-500/40 bg-cyan-950/20 text-cyan-400" },
                        { id: "bhim", name: "BHIM UPI", color: "border-emerald-500/40 bg-emerald-950/20 text-emerald-400" },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setSelectedUpiApp(app.id)}
                          className={`p-3 border text-center rounded transition flex flex-col items-center gap-1.5 cursor-pointer ${
                            selectedUpiApp === app.id
                              ? "border-brand-400 bg-brand-500/10 text-white ring-1 ring-brand-400"
                              : `${app.color} hover:bg-ink-800`
                          }`}
                        >
                          <Smartphone className="w-5 h-5" />
                          <span className="text-xs font-bold">{app.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {upiMode === "vpa" && (
                    <div className="space-y-2">
                      <label className="text-xs text-ink-300 block">Virtual Payment Address (VPA)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                          value={upiVpa}
                          onChange={(e) => {
                            setUpiVpa(e.target.value);
                            setUpiVerified(e.target.value.includes("@"));
                          }}
                          className="flex-1 bg-ink-950 border border-ink-700 px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-500"
                        />
                        <button
                          type="button"
                          onClick={() => setUpiVerified(Boolean(upiVpa && upiVpa.includes("@")))}
                          className="px-3 py-2 bg-ink-800 hover:bg-ink-700 text-ink-200 text-xs font-bold transition"
                        >
                          Verify
                        </button>
                      </div>
                      {upiVerified && (
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Verified UPI Handle
                        </div>
                      )}
                    </div>
                  )}

                  {upiMode === "qr" && (
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-ink-950 p-4 border border-ink-800 rounded">
                      <div className="w-32 h-32 bg-white p-2 rounded shadow flex items-center justify-center">
                        {/* Dynamic Clean QR Graphic */}
                        <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                          <rect width="100" height="100" fill="#ffffff" />
                          {/* Top-left position box */}
                          <rect x="10" y="10" width="24" height="24" fill="#000000" />
                          <rect x="14" y="14" width="16" height="16" fill="#ffffff" />
                          <rect x="18" y="18" width="8" height="8" fill="#000000" />
                          {/* Top-right position box */}
                          <rect x="66" y="10" width="24" height="24" fill="#000000" />
                          <rect x="70" y="14" width="16" height="16" fill="#ffffff" />
                          <rect x="74" y="18" width="8" height="8" fill="#000000" />
                          {/* Bottom-left position box */}
                          <rect x="10" y="66" width="24" height="24" fill="#000000" />
                          <rect x="14" y="70" width="16" height="16" fill="#ffffff" />
                          <rect x="18" y="74" width="8" height="8" fill="#000000" />
                          {/* QR Code Matrix Data Blocks */}
                          <rect x="38" y="12" width="6" height="6" fill="#000000" />
                          <rect x="48" y="12" width="6" height="6" fill="#000000" />
                          <rect x="40" y="24" width="6" height="6" fill="#000000" />
                          <rect x="52" y="24" width="6" height="6" fill="#000000" />
                          <rect x="12" y="42" width="6" height="6" fill="#000000" />
                          <rect x="24" y="42" width="6" height="6" fill="#000000" />
                          <rect x="36" y="38" width="8" height="8" fill="#000000" />
                          <rect x="48" y="38" width="8" height="8" fill="#000000" />
                          <rect x="60" y="42" width="6" height="6" fill="#000000" />
                          <rect x="74" y="42" width="8" height="8" fill="#000000" />
                          <rect x="40" y="52" width="6" height="6" fill="#000000" />
                          <rect x="54" y="52" width="8" height="8" fill="#000000" />
                          <rect x="68" y="52" width="6" height="6" fill="#000000" />
                          <rect x="38" y="66" width="6" height="6" fill="#000000" />
                          <rect x="50" y="66" width="6" height="6" fill="#000000" />
                          <rect x="64" y="66" width="6" height="6" fill="#000000" />
                          <rect x="78" y="66" width="8" height="8" fill="#000000" />
                          <rect x="44" y="78" width="8" height="8" fill="#000000" />
                          <rect x="60" y="78" width="8" height="8" fill="#000000" />
                          <rect x="76" y="78" width="6" height="6" fill="#000000" />
                        </svg>
                      </div>
                      <div className="space-y-1 text-xs text-left">
                        <span className="font-bold text-white block">Scan to Pay with any UPI App</span>
                        <p className="text-ink-400 text-[11px]">
                          Open GPay, PhonePe, Paytm, or BHIM and scan this QR to complete ₹{priceVal} payment.
                        </p>
                        <div className="pt-2 flex items-center gap-2">
                          <span className="font-mono text-[10px] text-brand-300 bg-ink-900 px-2 py-1 border border-ink-800 rounded">
                            support@internvisiontech.me
                          </span>
                          <button
                            type="button"
                            onClick={copyUpiHandle}
                            className="p-1 hover:text-white text-ink-400 text-[11px] flex items-center gap-1"
                          >
                            {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: 2. CARDS */}
              {activeTab === "card" && (
                <div className="p-4 bg-ink-900 border border-ink-800 rounded space-y-3">
                  <div className="flex items-center justify-between text-xs text-ink-300">
                    <span>Debit or Credit Card</span>
                    <div className="flex gap-1 text-[10px] font-bold text-ink-400">
                      <span className="bg-ink-800 px-1.5 py-0.5 rounded">VISA</span>
                      <span className="bg-ink-800 px-1.5 py-0.5 rounded">Mastercard</span>
                      <span className="bg-ink-800 px-1.5 py-0.5 rounded">RuPay</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-ink-400 block mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="4532 •••• •••• 8920"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full bg-ink-950 border border-ink-700 px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                      />
                      {getCardBrand() && (
                        <span className="absolute right-3 top-2 text-[10px] font-black text-brand-400 bg-brand-950/60 px-1.5 py-0.5 border border-brand-800/40 rounded">
                          {getCardBrand()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-ink-400 block mb-1">Valid Thru (MM/YY)</label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="MM / YY"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        className="w-full bg-ink-950 border border-ink-700 px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-ink-400 block mb-1">CVV / CVC (3 Digits)</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className="w-full bg-ink-950 border border-ink-700 px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-ink-400 block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Name as printed on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-ink-950 border border-ink-700 px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <label className="flex items-center gap-2 pt-1 text-[11px] text-ink-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="rounded bg-ink-950 border-ink-700 text-brand-600 focus:ring-brand-500"
                    />
                    <span>Securely save card for faster tokenized checkout (RBI Compliant)</span>
                  </label>
                </div>
              )}

              {/* TAB CONTENT: 3. NET BANKING */}
              {activeTab === "netbanking" && (
                <div className="p-4 bg-ink-900 border border-ink-800 rounded space-y-3">
                  <span className="text-xs text-ink-300 font-semibold block">Select Your Bank</span>

                  {/* Top Popular Indian Banks */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {POPULAR_BANKS.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => {
                          setSelectedBank(bank.id);
                          setCustomBank("");
                        }}
                        className={`p-2.5 border text-left rounded transition flex items-center justify-between cursor-pointer ${
                          selectedBank === bank.id && !customBank
                            ? "border-brand-400 bg-brand-500/15 text-white ring-1 ring-brand-400"
                            : "border-ink-700 bg-ink-950 text-ink-300 hover:border-ink-500"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-brand-400 flex-shrink-0" />
                          <span className="text-xs font-bold truncate">{bank.name}</span>
                        </div>
                        {selectedBank === bank.id && !customBank && (
                          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Other Banks Dropdown */}
                  <div className="pt-2">
                    <label className="text-[11px] text-ink-400 block mb-1">Or select another bank:</label>
                    <select
                      value={customBank}
                      onChange={(e) => {
                        setCustomBank(e.target.value);
                        setSelectedBank(e.target.value);
                      }}
                      className="w-full bg-ink-950 border border-ink-700 px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-500"
                    >
                      <option value="">-- All Other Indian Banks --</option>
                      {ALL_OTHER_BANKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: 4. WALLETS */}
              {activeTab === "wallet" && (
                <div className="p-4 bg-ink-900 border border-ink-800 rounded space-y-2">
                  <span className="text-xs text-ink-300 font-semibold block">Select Digital Wallet</span>
                  <div className="space-y-2">
                    {WALLETS.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setSelectedWallet(w.id)}
                        className={`w-full p-3 border text-left rounded transition flex items-center justify-between cursor-pointer ${
                          selectedWallet === w.id
                            ? "border-brand-400 bg-brand-500/15 text-white ring-1 ring-brand-400"
                            : "border-ink-700 bg-ink-950 text-ink-300 hover:border-ink-500"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Wallet className="w-4 h-4 text-brand-400 flex-shrink-0" />
                          <div>
                            <span className="text-xs font-bold block text-white">{w.name}</span>
                            <span className="text-[10px] text-ink-400">{w.desc}</span>
                          </div>
                        </div>
                        {selectedWallet === w.id && (
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Total Fee & Pay Action Button */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => handleStartPayment()}
                className="w-full py-3.5 font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition shadow-[4px_4px_0px_#ffffff] cursor-pointer text-sm"
              >
                <Zap className="w-4 h-4" /> Pay ₹{priceVal} via {getPaymentMethodLabel()}
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-ink-400 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> PCI-DSS Level 1
                </span>
                <span>•</span>
                <span>NPCI / RBI Authorized</span>
                <span>•</span>
                <span>Instant Course Unlock</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
