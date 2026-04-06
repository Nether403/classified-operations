import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { HomePage } from "@/pages/home";
import { ProjectDetailPage } from "@/pages/project-detail";
import { OperatorPage } from "@/pages/operator";
import { VaultPage } from "@/pages/vault";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-[10px] mono text-white/20 tracking-[0.3em] uppercase mb-4">
          404 — FILE NOT FOUND
        </div>
        <a href="/" className="text-sm text-amber-500/50 hover:text-amber-500 mono transition-colors">
          ← RETURN HOME
        </a>
      </div>
    </div>
  );
}

function Router() {
  return (
    <>
      <Nav />
      <main>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/projects/:slug" component={ProjectDetailPage} />
          <Route path="/operator" component={OperatorPage} />
          <Route path="/vault" component={VaultPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
