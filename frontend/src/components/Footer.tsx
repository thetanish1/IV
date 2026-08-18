import Link from"next/link";
import Image from"next/image";
import { Sparkles, ExternalLink, MessageCircle, Users, Mail } from"lucide-react";

export default function Footer() {
 return (
 <footer className="border-t border-ink-800 bg-ink-950 text-ink-400 text-sm">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
 <div className="space-y-4">
 <Link href="/"className="flex items-center gap-3 font-bold text-lg text-white">
 <div className="bg-white p-1 rounded-md inline-flex">
 <Image src="/logo.jpg" alt="InternVision Logo" width={140} height={36} className="h-6 w-auto object-contain" />
 </div>
 <span>InternVision <span className="text-brand-400">Tech</span></span>
 </Link>
 <p className="text-ink-400 text-xs leading-relaxed">
 Empowering students with industry-grade software engineering bootcamps, hands-on internships, and career placement mentorship.
 </p>
 </div>

 <div>
 <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">Quick Links</h4>
 <ul className="space-y-2">
 <li><Link href="/"className="hover:text-white transition">Home</Link></li>
 <li><Link href="/courses"className="hover:text-white transition">Course Catalog</Link></li>
 <li><Link href="/apply"className="hover:text-white transition">Internship Application</Link></li>
 <li><Link href="/contact"className="hover:text-white transition">Contact Support</Link></li>
 </ul>
 </div>

 <div>
 <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">Programs</h4>
 <ul className="space-y-2">
 <li><span className="hover:text-white transition cursor-pointer">1 Month Foundation Internship</span></li>
 <li><span className="hover:text-white transition cursor-pointer">3 Months Advanced Program</span></li>
 <li><span className="hover:text-white transition cursor-pointer">6 Months Industrial Co-Op</span></li>
 </ul>
 </div>

 <div>
 <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">Connect</h4>
 <div className="flex gap-4 mb-4">
 <a href="#"className="w-8 h-8 bg-ink-800 flex items-center justify-center hover:bg-ink-700 hover:text-white transition">
 <ExternalLink className="w-4 h-4"/>
 </a>
 <a href="#"className="w-8 h-8 bg-ink-800 flex items-center justify-center hover:bg-ink-700 hover:text-white transition">
 <MessageCircle className="w-4 h-4"/>
 </a>
 <a href="#"className="w-8 h-8 bg-ink-800 flex items-center justify-center hover:bg-ink-700 hover:text-white transition">
 <Users className="w-4 h-4"/>
 </a>
 <a href="mailto:support@internvision.tech"className="w-8 h-8 bg-ink-800 flex items-center justify-center hover:bg-ink-700 hover:text-white transition">
 <Mail className="w-4 h-4"/>
 </a>
 </div>
 <p className="text-xs text-ink-500">© 2026 InternVision Tech Inc. All rights reserved.</p>
 </div>
 </div>
 </div>
 </footer>
 );
}
