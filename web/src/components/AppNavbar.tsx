"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BACKOFFICE_URL =
  process.env.NEXT_PUBLIC_BACKOFFICE_URL || "http://localhost:3001";

const navLinks = [
  { href: "/reguas", label: "Réguas" },
];

export default function AppNavbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <Link href="/">
          <img src="/logo-hapvida.png" alt="Hapvida" className="h-7" />
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition ${
                pathname === link.href
                  ? "text-primary font-semibold"
                  : "text-slate-600 hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={BACKOFFICE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-primary transition"
          >
            Backoffice
          </a>
        </div>
      </div>
    </nav>
  );
}
