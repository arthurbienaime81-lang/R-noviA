"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./dashboard.module.css";

const LINKS = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/dashboard/chantiers", label: "Chantiers" },
  { href: "/dashboard/clients", label: "Clients" },
  { href: "/dashboard/rapports", label: "Rapports" },
  { href: "/dashboard/profil", label: "Profil" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative z-10 hidden w-56 shrink-0 sm:flex sm:flex-col">
      <div className="px-5 py-5">
        <p className="text-lg font-semibold text-slate-900">RenovIA</p>
      </div>
      <nav className="flex flex-col gap-2 px-3">
        {LINKS.map((link) => {
          const active =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navPill} ${active ? styles.navPillActive : ""} px-3 py-2 text-sm font-medium transition-colors ${
                active ? "text-[#2563EB]" : "text-slate-700 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
