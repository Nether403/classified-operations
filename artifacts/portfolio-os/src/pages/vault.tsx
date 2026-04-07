import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "wouter";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useSEO } from "@/hooks/use-seo";
import { useListProjects } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface VaultNote {
  id: number;
  projectId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

function VaultCard({
  note,
  projectTitle,
  projectSlug,
  classification,
}: {
  note: VaultNote;
  projectTitle: string;
  projectSlug: string;
  classification?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const preview = note.content.slice(0, 220);
  const hasMore = note.content.length > 220;

  const classColors: Record<string, string> = {
    CONFIDENTIAL: "text-amber-500/60 border-amber-500/20",
    RESTRICTED: "text-red-400/60 border-red-400/20",
    UNCLASSIFIED: "text-blue-400/60 border-blue-400/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass group"
      data-testid={`vault-card-${note.projectId}`}
    >
      <div className="p-5 border-b border-white/5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
            <span className="text-[9px] mono text-amber-500/50 tracking-[0.2em] uppercase">VAULT NOTE</span>
          </div>
          <div className="flex items-center gap-2">
            {classification && (
              <span className={`text-[8px] mono px-1.5 py-0.5 border ${classColors[classification] ?? "text-white/30 border-white/10"}`}>
                {classification}
              </span>
            )}
            <span className="text-[9px] mono text-white/20">
              {new Date(note.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <Link href={`/projects/${projectSlug}`}>
          <h3 className="text-sm font-semibold text-white/80 hover:text-amber-400 transition-colors cursor-pointer">
            {projectTitle}
          </h3>
        </Link>
      </div>

      <div className="p-5">
        <div className="text-xs text-white/45 leading-relaxed whitespace-pre-wrap font-mono text-[11px]">
          {expanded ? note.content : preview}
          {!expanded && hasMore && "..."}
        </div>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-[9px] mono text-white/25 hover:text-white/50 transition-colors tracking-[0.15em] uppercase"
          >
            {expanded ? "COLLAPSE" : "EXPAND FULL NOTE"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function VaultPage() {
  useSEO({ title: "VAULT — CLASSIFIED ACCESS", description: "Restricted access area. Authenticated clearance required to view vault contents." });
  const prefersReducedMotion = useReducedMotion();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: projects } = useListProjects();

  const { data: notes, isLoading: notesLoading } = useQuery<VaultNote[]>({
    queryKey: ["vault-notes"],
    queryFn: () => apiFetch<VaultNote[]>("/vault/notes"),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-12 max-w-md w-full mx-6 text-center"
          data-testid="vault-locked"
        >
          <div className="w-16 h-16 mx-auto mb-6 border border-red-500/20 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400/60">
              <rect x="3" y="11" width="18" height="11" rx="1" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <div className="text-[10px] mono text-red-400/60 tracking-[0.3em] uppercase mb-4">
            ACCESS DENIED
          </div>
          <h2 className="text-xl font-black text-white/80 mb-3">VAULT LOCKED</h2>
          <p className="text-sm text-white/35 leading-relaxed mb-8">
            Authentication required to access classified vault notes. Establish secure session to proceed.
          </p>
          <a
            href={`${BASE}/api/login?returnTo=${encodeURIComponent(window.location.pathname)}`}
            className="inline-block text-[10px] mono tracking-[0.2em] uppercase px-6 py-3 border border-amber-500/30 text-amber-500/70 hover:border-amber-500/60 hover:text-amber-500 transition-colors"
            data-testid="btn-vault-authenticate"
          >
            AUTHENTICATE
          </a>
        </motion.div>
      </div>
    );
  }

  const projectMap = new Map(projects?.map((p) => [p.id, p]) ?? []);

  return (
    <div className="min-h-screen pt-14" data-testid="vault-page">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] mono text-amber-500/60 tracking-[0.3em] uppercase">
              AUTHORIZED ACCESS — SESSION ACTIVE
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white/90 mb-2" data-testid="vault-heading">
            CLASSIFIED VAULT
          </h1>
          <div className="section-line max-w-sm" />
          <p className="text-sm text-white/35 mt-4 max-w-xl">
            Private research notes, internal process annotations, and unreleased findings. Handle with discretion.
          </p>
        </motion.div>

        {notesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass h-52 animate-pulse" />
            ))}
          </div>
        ) : !notes || notes.length === 0 ? (
          <div className="glass p-12 text-center">
            <div className="text-[10px] mono text-white/20 tracking-[0.3em] uppercase mb-4">
              VAULT EMPTY
            </div>
            <p className="text-sm text-white/30">
              No classified notes on file. Operations are clean.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence initial={false}>
              {notes.map((note) => {
                const project = projectMap.get(note.projectId);
                return (
                  <VaultCard
                    key={note.id}
                    note={note}
                    projectTitle={project?.title ?? `Project #${note.projectId}`}
                    projectSlug={project?.slug ?? String(note.projectId)}
                    classification={project?.classification}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
