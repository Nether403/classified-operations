import { Link, useLocation } from "wouter";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { useGetCurrentAuthUser } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function loginUrl(returnTo?: string): string {
  const to = returnTo ?? window.location.pathname;
  return `${BASE}/api/login?returnTo=${encodeURIComponent(to)}`;
}

function logoutUrl(): string {
  return `${BASE}/api/logout?returnTo=${encodeURIComponent(window.location.pathname)}`;
}

const navItems = [
  { label: "DOSSIERS", href: "/" },
  { label: "DASHBOARD", href: "/dashboard" },
  { label: "COMPARE", href: "/compare" },
  { label: "OPERATOR", href: "/operator" },
  { label: "VAULT", href: "/vault", authRequired: true },
  { label: "ADMIN", href: "/admin", adminRequired: true },
];

export function Nav() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: userResponse } = useGetCurrentAuthUser();
  const user = userResponse?.user;
  const isAuthenticated = !!user;
  const isAdmin = !!userResponse?.isAdmin;
  const prefersReducedMotion = useReducedMotion();

  const visibleItems = navItems.filter((item) => {
    if ((item as { authRequired?: boolean }).authRequired && !isAuthenticated) return false;
    if ((item as { adminRequired?: boolean }).adminRequired && !isAdmin) return false;
    return true;
  });

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5" data-testid="main-nav">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group" data-testid="nav-brand">
              <div className="relative w-7 h-7">
                <div className="absolute inset-0 border border-amber-500/60 rotate-45 group-hover:rotate-[50deg] transition-transform duration-300" />
                <div className="absolute inset-1.5 bg-amber-500/20 rotate-45" />
              </div>
              <div>
                <span className="text-[11px] mono text-amber-500 tracking-[0.3em] uppercase">
                  PORTFOLIO
                </span>
                <div className="text-[9px] mono text-white/30 tracking-[0.2em] uppercase -mt-0.5 flex items-center gap-2">
                  OS / v2.4.1
                </div>
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {visibleItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <div className="relative cursor-pointer group" data-testid={`nav-link-${item.label.toLowerCase()}`}>
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

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-white/30">
              <span className="text-[10px] mono">CMD</span>
              <span className="text-[10px] mono">+</span>
              <span className="text-[10px] mono">K</span>
            </div>

            <div className="w-px h-4 bg-white/10 hidden md:block" />

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center" aria-label="User avatar">
                  <span className="text-[10px] mono text-amber-500 font-bold">
                    {user?.firstName?.[0] ?? user?.email?.[0] ?? "?"}
                  </span>
                </div>
                <a
                  href={logoutUrl()}
                  className="text-[10px] mono text-white/30 hover:text-white/60 tracking-[0.15em] uppercase transition-colors"
                  data-testid="btn-logout"
                >
                  EXIT
                </a>
              </div>
            ) : (
              <a
                href={loginUrl()}
                className="hidden md:inline-block text-[10px] mono text-amber-500/70 hover:text-amber-500 tracking-[0.15em] uppercase transition-colors border border-amber-500/20 hover:border-amber-500/40 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                data-testid="btn-login"
              >
                ACCESS
              </a>
            )}

            <button
              className="md:hidden text-white/50 hover:text-white/80 transition-colors p-1 focus:outline-none focus:ring-1 focus:ring-white/20"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
              data-testid="btn-mobile-menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                {mobileOpen ? (
                  <>
                    <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" />
                  </>
                ) : (
                  <>
                    <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="fixed top-14 left-0 right-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 md:hidden"
            data-testid="mobile-menu"
          >
            <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {visibleItems.map((item) => {
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`py-3 px-3 text-[11px] mono tracking-[0.2em] uppercase transition-colors cursor-pointer border-l-2 ${
                        isActive
                          ? "text-amber-500 border-amber-500"
                          : "text-white/40 border-transparent hover:text-white/70 hover:border-white/20"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </div>
                  </Link>
                );
              })}

              <div className="border-t border-white/5 mt-2 pt-3 flex items-center justify-between">
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                      <span className="text-[10px] mono text-amber-500 font-bold">
                        {user?.firstName?.[0] ?? user?.email?.[0] ?? "?"}
                      </span>
                    </div>
                    <a
                      href={logoutUrl()}
                      className="text-[10px] mono text-white/30 hover:text-white/60 tracking-[0.15em] uppercase transition-colors"
                    >
                      EXIT
                    </a>
                  </div>
                ) : (
                  <a
                    href={loginUrl()}
                    className="text-[10px] mono text-amber-500/70 hover:text-amber-500 tracking-[0.15em] uppercase transition-colors border border-amber-500/20 hover:border-amber-500/40 px-3 py-1.5"
                  >
                    ACCESS
                  </a>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
