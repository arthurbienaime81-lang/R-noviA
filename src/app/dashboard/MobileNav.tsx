"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import styles from "./dashboard.module.css";

const LINKS = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/dashboard/chantiers", label: "Chantiers" },
  { href: "/dashboard/clients", label: "Clients" },
  { href: "/dashboard/rapports", label: "Rapports" },
  { href: "/dashboard/profil", label: "Paramètres" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu de navigation"
        aria-expanded={open}
        className={`${styles.navPill} ${styles.hamburgerButton} sm:hidden`}
      >
        <svg
          className="h-[14px] w-[18px] shrink-0"
          viewBox="0 0 18 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 1H17M1 7H17M1 13H17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col gap-2 p-4 sm:hidden ${styles.drawerPanel}`}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
              }
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
            >
              <p className="mb-2 px-2 text-lg font-semibold text-slate-900">
                Rénov<span className="text-[#a15d40]">IA</span>
              </p>
              {LINKS.map((link) => {
                const active =
                  link.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`${styles.navPill} ${active ? styles.navPillActive : ""} px-3 py-2 text-sm font-medium transition-colors ${
                      active ? "text-[#2563EB]" : "text-slate-700 hover:text-slate-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
