"use client";

import { motion } from"framer-motion";
import { ReactNode } from"react";

interface FadeInProps {
 children: ReactNode;
 delay?: number;
 direction?:"up"|"down"|"left"|"right";
 className?: string;
 duration?: number;
}

export function FadeIn({
 children,
 delay = 0,
 direction ="up",
 className ="",
 duration = 0.5,
}: FadeInProps) {
 const directionOffset = {
 up: 40,
 down: -40,
 left: 40,
 right: -40,
 };

 const initialY = direction ==="up"|| direction ==="down"? directionOffset[direction] : 0;
 const initialX = direction ==="left"|| direction ==="right"? directionOffset[direction] : 0;

 return (
 <motion.div
 initial={{ opacity: 0, y: initialY, x: initialX }}
 whileInView={{ opacity: 1, y: 0, x: 0 }}
 viewport={{ once: true, margin:"-50px"}}
 transition={{
 duration: duration,
 delay: delay,
 ease: [0.21, 0.47, 0.32, 0.98], // elegant ease-out curve
 }}
 className={className}
 >
 {children}
 </motion.div>
 );
}
