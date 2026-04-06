import { Switch, Route, Router as WouterRouter } from "wouter";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <>
      <Nav />
      <main>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/projects/:slug" component={ProjectDetailPage} />
          <Route path="/compare" component={ComparePage} />
          <Route path="/operator" component={OperatorPage} />
          <Route path="/vault" component={VaultPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </main>
      <Footer />
      <CommandPalette />
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
