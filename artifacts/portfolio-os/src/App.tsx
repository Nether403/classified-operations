import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { CommandPalette } from "@/components/command-palette";
import { OperatorProvider } from "@/store/operator-store";
import { OperatorPanel } from "@/components/operator-panel";
import { AmbientBackground } from "@/components/ambient-background";
import { CustomCursor } from "@/components/custom-cursor";

const HomePage = lazy(() => import("@/pages/home").then((m) => ({ default: m.HomePage })));
const ProjectDetailPage = lazy(() => import("@/pages/project-detail").then((m) => ({ default: m.ProjectDetailPage })));
const OperatorPage = lazy(() => import("@/pages/operator").then((m) => ({ default: m.OperatorPage })));
const VaultPage = lazy(() => import("@/pages/vault").then((m) => ({ default: m.VaultPage })));
const DashboardPage = lazy(() => import("@/pages/dashboard").then((m) => ({ default: m.DashboardPage })));
const ComparePage = lazy(() => import("@/pages/compare").then((m) => ({ default: m.ComparePage })));
const NotFoundPage = lazy(() => import("@/pages/not-found").then((m) => ({ default: m.NotFoundPage })));
const AdminPage = lazy(() => import("@/pages/admin").then((m) => ({ default: m.AdminPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        <div className="text-[10px] mono text-amber-500/40 tracking-[0.3em] uppercase">LOADING</div>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const [location] = useLocation();
  const reducedMotion = useReducedMotion();

  const variants = reducedMotion
    ? { initial: {}, animate: {}, exit: {} }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
      };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/projects/:slug" component={ProjectDetailPage} />
            <Route path="/compare" component={ComparePage} />
            <Route path="/operator" component={OperatorPage} />
            <Route path="/vault" component={VaultPage} />
            <Route path="/admin" component={AdminPage} />
            <Route component={NotFoundPage} />
          </Switch>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function Router() {
  return (
    <>
      <AmbientBackground />
      <CustomCursor />
      <Nav />
      <main>
        <AnimatedRoutes />
      </main>
      <Footer />
      <CommandPalette />
      <OperatorPanel />
    </>
  );
}

function getRouterBase(): string {
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
  if (baseUrl) return baseUrl;
  const knownRoutes = ["/dashboard", "/projects/", "/compare", "/operator", "/vault", "/admin"];
  const pathname = window.location.pathname;
  for (const route of knownRoutes) {
    const idx = pathname.indexOf(route);
    if (idx > 0) return pathname.slice(0, idx);
  }
  if (pathname !== "/" && !knownRoutes.some((r) => pathname === r || pathname.startsWith(r))) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length > 1) return "/" + parts.slice(0, -1).join("/");
  }
  return "";
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" themes={["dark", "light"]}>
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={getRouterBase()}>
          <OperatorProvider>
            <Router />
          </OperatorProvider>
        </WouterRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
