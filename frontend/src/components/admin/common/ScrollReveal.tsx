import React, { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  threshold?: number;
  rootMargin?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  delayMs?: number;
}

export default function ScrollReveal({
  children,
  threshold = 0.1,
  rootMargin = "0px 0px -40px 0px",
  direction = "up",
  delayMs = 0,
  className,
  ...props
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect user's reduced-motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    const currentElem = domRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) {
        observer.unobserve(currentElem);
      }
    };
  }, [threshold, rootMargin]);

  const directionOffsets = {
    up: "translate-y-6",
    down: "-translate-y-6",
    left: "translate-x-6",
    right: "-translate-x-6",
    none: "",
  };

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={twMerge(
        clsx(
          "transition-all duration-500 ease-out",
          isVisible
            ? "opacity-100 translate-x-0 translate-y-0"
            : `opacity-0 ${directionOffsets[direction]} pointer-events-none`,
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
