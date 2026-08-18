"use client";

import { motion } from"framer-motion";
import { ReactNode } from"react";

interface FloatProps {
 children: ReactNode;
 delay?: number;
 yOffset?: number;
 duration?: number;
 className?: string;
}

export function Float({ children, delay = 0, yOffset = 15, duration = 3, className =""}: FloatProps) {
 return (
 <motion.div
 animate={{ y: [0, -yOffset, 0] }}
 transition={{
 duration: duration,
 repeat: Infinity,
 repeatType:"reverse",
 ease:"easeInOut",
 delay: delay,
 }}
 className={className}
 >
 {children}
 </motion.div>
 );
}
