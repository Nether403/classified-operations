import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { HomePage } from "@/pages/home";
import { ProjectDetailPage } from "@/pages/project-detail";
import { OperatorPage } from "@/pages/operator";
import { VaultPage } from "@/pages/vault";
import { DashboardPage } from "@/pages/dashboard";
import { ComparePage } from "@/pages/compare";
import { NotFoundPage } from "@/pages/not-found";
import { CommandPalette } from "@/components/command-palette";
import { OperatorProvider } from "@/store/operator-store";
import { OperatorPanel } from "@/components/operator-panel";
import { AdminPage } from "@/pages/admin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AnimatedRoutes() {
  const [location] = useLocation();
  const reducedMotion = useReducedMotion();

  const variants = reducedMotion
    ? { initial: {}, animate: {}, exit: {} }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
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
      </motion.div>
    </AnimatePresence>
  );
}

function Router() {
  return (
    <>
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
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={getRouterBase()}>
        <OperatorProvider>
          <Router />
        </OperatorProvider>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
