"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links: { href: string; label: string }[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/reconcile", label: "Reconcile" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r dark:bg-[#0b0b0b] dark:border-gray-800">
      <div className="px-6 py-6">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Reconciliator</h2>
      </div>

      <nav className="px-4">
        <ul className="space-y-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`block w-full rounded-md px-3 py-2 text-sm font-medium hover:bg-black/[.04] dark:hover:bg-white/[.04] ${
                    active ? "bg-black/[.06] dark:bg-white/[.06] text-black dark:text-zinc-50" : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 mt-6 text-xs text-zinc-500 dark:text-zinc-400">v0.1.0</div>
    </aside>
  );
}
