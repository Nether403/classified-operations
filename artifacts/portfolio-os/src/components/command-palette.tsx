import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Command } from "cmdk";
import { Search, FolderGit2, Home, BarChart2, GitCompare, Shield, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useListProjects } from "@workspace/api-client-react";
import { ClassificationBadge } from "@/components/ui/classification-badge";
import { useGetCurrentAuthUser } from "@workspace/api-client-react";
import { useOpenOperator } from "@/components/operator-panel";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();
  const { openPanel } = useOpenOperator();

  const { data: projects } = useListProjects({ search });
  const { data: userResponse } = useGetCurrentAuthUser();
  const isAuthenticated = !!userResponse?.user;
  const isAdmin = !!userResponse?.isAdmin;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 sm:pt-32"
          onClick={() => setOpen(false)}
          data-testid="cmdk-backdrop"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-2xl px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Command
              className="glass overflow-hidden rounded-md border border-white/10 shadow-2xl shadow-amber-500/10 flex flex-col"
              shouldFilter={false}
              label="Command Menu"
            >
              <div className="flex items-center px-4 border-b border-white/5" data-testid="cmdk-input-wrapper">
                <Search className="w-4 h-4 text-amber-500/50 mr-3 shrink-0" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  className="flex-1 bg-transparent py-4 text-sm text-white/90 placeholder:text-white/30 outline-none mono"
                  placeholder="Search directives or intelligence dossiers..."
                  data-testid="input-cmdk-search"
                />
                <div className="flex items-center gap-1 text-[10px] mono text-white/30 ml-2">
                  <kbd className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5">ESC</kbd> to close
                </div>
              </div>

              <Command.List className="max-h-[360px] overflow-y-auto p-2 scrollbar-thin">
                <Command.Empty className="py-6 text-center text-sm mono text-white/30" data-testid="cmdk-empty">
                  NO DIRECTIVES FOUND.
                </Command.Empty>

                <Command.Group heading="SYSTEM DIRECTIVES" className="text-[10px] mono text-white/40 px-2 py-2">
                  <Command.Item
                    onSelect={() => runCommand(() => setLocation("/"))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer aria-selected:bg-white/5 aria-selected:text-amber-400 text-white/70 text-sm transition-colors group"
                    data-testid="cmdk-item-home"
                  >
                    <Home className="w-4 h-4 text-white/40 group-aria-selected:text-amber-500" />
                    <span className="mono">Return to Base / Dossiers</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => setLocation("/dashboard"))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer aria-selected:bg-white/5 aria-selected:text-amber-400 text-white/70 text-sm transition-colors group"
                    data-testid="cmdk-item-dashboard"
                  >
                    <BarChart2 className="w-4 h-4 text-white/40 group-aria-selected:text-amber-500" />
                    <span className="mono">Command Center Dashboard</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => setLocation("/compare"))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer aria-selected:bg-white/5 aria-selected:text-amber-400 text-white/70 text-sm transition-colors group"
                    data-testid="cmdk-item-compare"
                  >
                    <GitCompare className="w-4 h-4 text-white/40 group-aria-selected:text-amber-500" />
                    <span className="mono">Intelligence Comparison</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => openPanel())}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer aria-selected:bg-white/5 aria-selected:text-amber-400 text-white/70 text-sm transition-colors group"
                    data-testid="cmdk-item-operator"
                  >
                    <span className="w-4 h-4 flex items-center justify-center text-[9px] mono text-blue-400/60 group-aria-selected:text-blue-400 border border-blue-400/20 group-aria-selected:border-blue-400/40">AI</span>
                    <span className="mono">Open AI Operator</span>
                  </Command.Item>
                </Command.Group>

                {isAuthenticated && (
                  <Command.Group heading="SECURE ACCESS" className="text-[10px] mono text-white/40 px-2 py-2 mt-2">
                    <Command.Item
                      onSelect={() => runCommand(() => setLocation("/vault"))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer aria-selected:bg-white/5 aria-selected:text-amber-400 text-white/70 text-sm transition-colors group"
                      data-testid="cmdk-item-vault"
                    >
                      <Shield className="w-4 h-4 text-amber-500/40 group-aria-selected:text-amber-500" />
                      <span className="mono">Classified Vault</span>
                      <span className="ml-auto text-[8px] mono text-amber-500/40 border border-amber-500/20 px-1.5 py-0.5">AUTHORIZED</span>
                    </Command.Item>
                    {isAdmin && (
                      <Command.Item
                        onSelect={() => runCommand(() => setLocation("/admin"))}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer aria-selected:bg-white/5 aria-selected:text-amber-400 text-white/70 text-sm transition-colors group"
                        data-testid="cmdk-item-admin"
                      >
                        <Settings className="w-4 h-4 text-red-400/40 group-aria-selected:text-red-400" />
                        <span className="mono">Admin Interface</span>
                        <span className="ml-auto text-[8px] mono text-red-400/40 border border-red-400/20 px-1.5 py-0.5">ADMIN</span>
                      </Command.Item>
                    )}
                  </Command.Group>
                )}

                {projects && projects.length > 0 && (
                  <Command.Group heading="DOSSIERS" className="text-[10px] mono text-white/40 px-2 py-2 mt-2">
                    {projects.map((project) => (
                      <Command.Item
                        key={project.id}
                        value={project.title}
                        onSelect={() => runCommand(() => setLocation(`/projects/${project.slug}`))}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer aria-selected:bg-white/5 aria-selected:text-amber-400 text-white/70 text-sm transition-colors group"
                        data-testid={`cmdk-item-project-${project.id}`}
                      >
                        <FolderGit2 className="w-4 h-4 text-white/40 group-aria-selected:text-amber-500 shrink-0" />
                        <div className="flex-1 flex items-center justify-between overflow-hidden gap-4">
                          <span className="truncate">{project.title}</span>
                          <ClassificationBadge classification={project.classification} />
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
