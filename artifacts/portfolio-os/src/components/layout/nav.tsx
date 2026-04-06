import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const navItems = [
  { label: "DOSSIERS", href: "/" },
  { label: "OPERATOR", href: "/operator" },
  { label: "VAULT", href: "/vault", authRequired: true },
];

export function Nav() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="relative w-7 h-7">
                <div className="absolute inset-0 border border-amber-500/60 rotate-45 group-hover:rotate-[50deg] transition-transform duration-300" />
                <div className="absolute inset-1.5 bg-amber-500/20 rotate-45" />
              </div>
              <div>
                <span className="text-[11px] mono text-amber-500 tracking-[0.3em] uppercase">
                  PORTFOLIO
                </span>
                <div className="text-[9px] mono text-white/30 tracking-[0.2em] uppercase -mt-0.5">
                  OS / v2.4.1
                </div>
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              if (item.authRequired && !isAuthenticated) return null;
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));

              return (
                <Link key={item.href} href={item.href}>
                  <div className="relative cursor-pointer group">
                    <span className={`text-[11px] mono tracking-[0.2em] uppercase transition-colors duration-200 ${
                      isActive ? "text-amber-500" : "text-white/40 hover:text-white/70"
                    }`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-3.5 left-0 right-0 h-px bg-amber-500"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 40 }}
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <span className="text-[10px] mono text-amber-500">
                    {user?.firstName?.[0] ?? user?.email?.[0] ?? "?"}
                  </span>
                </div>
                <a
                  href={`${BASE}/api/logout`}
                  className="text-[10px] mono text-white/30 hover:text-white/60 tracking-[0.15em] uppercase transition-colors"
                >
                  EXIT
                </a>
              </div>
            ) : (
              <a
                href={`${BASE}/api/login`}
                className="text-[10px] mono text-amber-500/70 hover:text-amber-500 tracking-[0.15em] uppercase transition-colors border border-amber-500/20 hover:border-amber-500/40 px-3 py-1.5"
              >
                ACCESS
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
