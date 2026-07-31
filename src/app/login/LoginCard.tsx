"use client";

import { motion, useReducedMotion } from "framer-motion";

export function LoginCard({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ rotate: 0 }}
      animate={{ rotate: shouldReduceMotion ? 0 : 360 }}
      transition={{ duration: shouldReduceMotion ? 0 : 1, ease: "easeInOut" }}
      className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm"
    >
      {children}
    </motion.div>
  );
}
