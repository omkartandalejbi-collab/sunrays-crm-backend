import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 15 },
  },
  slideRight: {
    initial: { opacity: 0, x: -15 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -15 },
  },
  scaleUp: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
  hoverLift: {
    whileHover: { y: -2, transition: { duration: 0.2, ease: "easeOut" } },
    whileTap: { y: 0 },
  },
  tableRow: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  }
}

export const transitions = {
  spring: {
    type: "spring",
    stiffness: 400,
    damping: 40,
    mass: 0.8
  },
  easeOut: {
    type: "tween",
    ease: [0.25, 0.1, 0.25, 1],
    duration: 0.25,
  }
}
