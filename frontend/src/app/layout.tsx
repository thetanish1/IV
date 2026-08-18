import"./globals.css";
import type { Metadata } from"next";
import { IBM_Plex_Sans, Fraunces } from"next/font/google";
import Navbar from"@/components/Navbar";
import Footer from"@/components/Footer";
import RazorpayScript from"@/components/RazorpayScript";

const ibmPlexSans = IBM_Plex_Sans({ 
 weight: ['400', '500', '600', '700'],
 subsets: ["latin"],
 variable:"--font-ibm-plex",
});

const fraunces = Fraunces({
 subsets: ["latin"],
 variable:"--font-fraunces",
});

export const metadata: Metadata = {
 title:"InternVision Tech - EdTech & Internship Platform",
 description:"Master Full-Stack Web Development, AI/ML, Cloud DevOps and launch your technology career with hands-on internships.",
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <html lang="en"className="dark">
 <body className={`${ibmPlexSans.variable} ${fraunces.variable} font-sans`}>
 <RazorpayScript />
 <div className="flex flex-col min-h-screen">
 <Navbar />
 <main className="flex-1">{children}</main>
 <Footer />
 </div>
 </body>
 </html>
 );
}
