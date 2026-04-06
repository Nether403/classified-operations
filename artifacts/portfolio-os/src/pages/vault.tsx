import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useProjects } from "@/hooks/use-projects";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface VaultNote {
  id: number;
  projectId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

function VaultCard({ note, projectTitle, projectSlug }: { note: VaultNote; projectTitle: string; projectSlug: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-[9px] mono text-amber-500/50 tracking-[0.2em] uppercase">
          VAULT NOTE
        </div>
        <div className="text-[9px] mono text-white/20">
          {new Date(note.updatedAt).toLocaleDateString()}
        </div>
      </div>
      <Link href={`/projects/${projectSlug}`}>
        <h3 className="text-sm font-semibold text-white/80 hover:text-amber-400 transition-colors cursor-pointer mb-3">
          {projectTitle}
        </h3>
      </Link>
      <p className="text-xs text-white/45 leading-relaxed">{note.content}</p>
    </motion.div>
  );
}

export function VaultPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: projects } = useProjects();

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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-12 max-w-md w-full mx-6 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 border border-red-500/20 flex items-center justify-center">
            <div className="text-2xl">🔒</div>
          </div>
          <div className="text-[10px] mono text-red-400/60 tracking-[0.3em] uppercase mb-4">
            ACCESS DENIED
          </div>
          <h2 className="text-xl font-black text-white/80 mb-3">VAULT LOCKED</h2>
          <p className="text-sm text-white/35 leading-relaxed mb-8">
            Authentication required to access classified vault notes. Establish secure session to proceed.
          </p>
          <a
            href={`${BASE}/api/login`}
            className="inline-block text-[10px] mono tracking-[0.2em] uppercase px-6 py-3 border border-amber-500/30 text-amber-500/70 hover:border-amber-500/60 hover:text-amber-500 transition-colors"
          >
            AUTHENTICATE
          </a>
        </motion.div>
      </div>
    );
  }

  const projectMap = new Map(projects?.map((p) => [p.id, p]) ?? []);

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] mono text-amber-500/60 tracking-[0.3em] uppercase">
              AUTHORIZED ACCESS
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white/90 mb-2">
            CLASSIFIED VAULT
          </h1>
          <div className="section-line" />
          <p className="text-sm text-white/35 mt-4">
            Private research notes and internal annotations for active operations.
          </p>
        </motion.div>

        {notesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass h-40 animate-pulse" />
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
            {notes.map((note) => {
              const project = projectMap.get(note.projectId);
              return (
                <VaultCard
                  key={note.id}
                  note={note}
                  projectTitle={project?.title ?? `Project #${note.projectId}`}
                  projectSlug={project?.slug ?? String(note.projectId)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
