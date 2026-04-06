import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function useFocusTrap(active: boolean, onEscape: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!ref.current) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        ref.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.closest("[aria-hidden]"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onEscape]
  );

  useEffect(() => {
    if (!active) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const firstFocusable = ref.current?.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      prevFocus?.focus();
    };
  }, [active, handleKeyDown]);

  return ref;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  category: string | null;
}

interface Project {
  id: number;
  title: string;
  slug: string;
  summary: string;
  classification: string;
  status: string;
  year: number | null;
  isPublic: boolean;
  isFeatured: boolean;
  techStack: string[];
  coverImageUrl: string | null;
  tags: Tag[];
}

interface VaultNote {
  id: number;
  projectId: number;
  content: string;
}

interface Section {
  id: number;
  type: string;
  title: string;
  content: string;
  sortOrder: number;
}

function ClassLabel({ value }: { value: string }) {
  const colors: Record<string, string> = {
    CONFIDENTIAL: "text-amber-500/70 border-amber-500/20",
    RESTRICTED: "text-red-400/70 border-red-400/20",
    UNCLASSIFIED: "text-blue-400/70 border-blue-400/20",
  };
  return (
    <span className={`text-[8px] mono px-1.5 py-0.5 border ${colors[value] ?? "text-white/30 border-white/10"}`}>
      {value}
    </span>
  );
}

function SectionsEditor({
  projectId,
  onClose,
}: {
  projectId: number;
  onClose: () => void;
}) {
  const trapRef = useFocusTrap(true, onClose);
  const qc = useQueryClient();
  const { data: sections = [], isLoading } = useQuery<Section[]>({
    queryKey: ["sections", projectId],
    queryFn: () => apiFetch<Section[]>(`/projects/${projectId}/sections`),
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [newType, setNewType] = useState("problem");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const updateSection = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { title: string; content: string } }) =>
      apiFetch(`/projects/${projectId}/sections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["sections", projectId] });
      setEditId(null);
    },
  });

  const createSection = useMutation({
    mutationFn: (data: { type: string; title: string; content: string; sortOrder: number }) =>
      apiFetch(`/projects/${projectId}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["sections", projectId] });
      setNewTitle("");
      setNewContent("");
    },
  });

  const deleteSection = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/projects/${projectId}/sections/${id}`, { method: "DELETE" }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["sections", projectId] }),
  });

  return (
    <div
      className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-16 px-4 overflow-y-auto"
      data-testid="sections-editor-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Sections Editor"
      ref={trapRef}
    >
      <div className="glass w-full max-w-2xl mb-16">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8">
          <span className="text-[10px] mono text-white/50 tracking-[0.2em] uppercase">SECTIONS EDITOR</span>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors text-xs mono" aria-label="Close sections editor">CLOSE</button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-white/30 text-xs mono">LOADING...</div>
        ) : (
          <div className="divide-y divide-white/5">
            {sections.map((s) => (
              <div key={s.id} className="px-5 py-4">
                {editId === s.id ? (
                  <div className="space-y-2">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs text-white/80 mono outline-none focus:border-amber-500/30"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={5}
                      className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs text-white/60 mono outline-none focus:border-amber-500/30 resize-y"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => void updateSection.mutateAsync({ id: s.id, data: { title: editTitle, content: editContent } })}
                        className="text-[9px] mono px-3 py-1.5 border border-amber-500/30 text-amber-500/70 hover:text-amber-500 transition-colors"
                      >SAVE</button>
                      <button onClick={() => setEditId(null)} className="text-[9px] mono px-3 py-1.5 border border-white/10 text-white/30 hover:text-white/60 transition-colors">CANCEL</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] mono text-blue-400/50 tracking-widest uppercase">{s.type}</span>
                        <span className="text-xs text-white/70 font-medium">{s.title}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditId(s.id); setEditTitle(s.title); setEditContent(s.content); }}
                          className="text-[9px] mono text-white/30 hover:text-white/60 transition-colors"
                        >EDIT</button>
                        <button
                          onClick={() => void deleteSection.mutateAsync(s.id)}
                          className="text-[9px] mono text-red-400/30 hover:text-red-400 transition-colors"
                        >DEL</button>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/35 leading-relaxed line-clamp-2">{s.content}</p>
                  </div>
                )}
              </div>
            ))}

            <div className="px-5 py-4 bg-white/2">
              <div className="text-[9px] mono text-white/25 tracking-[0.15em] uppercase mb-3">ADD SECTION</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="bg-black/40 border border-white/10 px-3 py-2 text-xs text-white/60 mono outline-none focus:border-amber-500/30"
                >
                  {["problem", "approach", "key_decisions", "outcomes", "context", "technical", "other"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Section title..."
                  className="bg-black/40 border border-white/10 px-3 py-2 text-xs text-white/60 mono outline-none focus:border-amber-500/30"
                />
              </div>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Section content..."
                rows={3}
                className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs text-white/60 mono outline-none focus:border-amber-500/30 resize-y mb-2"
              />
              <button
                onClick={() =>
                  void createSection.mutateAsync({
                    type: newType,
                    title: newTitle || newType,
                    content: newContent,
                    sortOrder: sections.length,
                  })
                }
                disabled={!newContent.trim()}
                className="text-[9px] mono px-3 py-1.5 border border-amber-500/30 text-amber-500/70 hover:text-amber-500 transition-colors disabled:opacity-30"
              >ADD SECTION</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VaultNoteEditor({
  projectId,
  projectTitle,
  onClose,
}: {
  projectId: number;
  projectTitle: string;
  onClose: () => void;
}) {
  const trapRef = useFocusTrap(true, onClose);
  const qc = useQueryClient();
  const { data: note } = useQuery<VaultNote | null>({
    queryKey: ["vault-note", projectId],
    queryFn: async () => {
      try {
        return await apiFetch<VaultNote>(`/vault/notes/${projectId}`);
      } catch {
        return null;
      }
    },
  });
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) setContent(note.content);
  }, [note]);

  const save = useMutation({
    mutationFn: () =>
      apiFetch(`/vault/notes/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["vault-note", projectId] });
      void qc.invalidateQueries({ queryKey: ["vault-notes"] });
    },
  });

  return (
    <div
      className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
      data-testid="vault-note-editor-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`Vault Note: ${projectTitle}`}
      ref={trapRef}
    >
      <div className="glass w-full max-w-2xl">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8">
          <div>
            <span className="text-[10px] mono text-amber-500/50 tracking-[0.2em] uppercase">VAULT NOTE</span>
            <div className="text-xs text-white/50 mt-0.5">{projectTitle}</div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors text-xs mono" aria-label="Close vault note editor">CLOSE</button>
        </div>
        <div className="p-5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder="Internal notes, process annotations, unreleased findings..."
            className="w-full bg-black/40 border border-white/10 px-3 py-3 text-xs text-white/70 mono outline-none focus:border-amber-500/30 resize-y leading-relaxed"
            data-testid="vault-note-textarea"
          />
          <div className="flex items-center justify-between mt-3">
            {save.isSuccess && (
              <span className="text-[9px] mono text-green-400/60">SAVED</span>
            )}
            {save.isError && (
              <span className="text-[9px] mono text-red-400/60">ERROR SAVING</span>
            )}
            {!save.isSuccess && !save.isError && <span />}
            <button
              onClick={() => void save.mutateAsync()}
              disabled={save.isPending || !content.trim()}
              className="text-[9px] mono px-4 py-2 border border-amber-500/30 text-amber-500/70 hover:text-amber-500 transition-colors disabled:opacity-30"
              data-testid="btn-save-vault-note"
            >
              {save.isPending ? "SAVING..." : "SAVE NOTE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectForm({
  project,
  tags,
  onClose,
  onSaved,
}: {
  project: Project | null;
  tags: Tag[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const trapRef = useFocusTrap(true, onClose);
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [summary, setSummary] = useState(project?.summary ?? "");
  const [classification, setClassification] = useState(project?.classification ?? "UNCLASSIFIED");
  const [status, setStatus] = useState(project?.status ?? "ACTIVE");
  const [year, setYear] = useState(project?.year?.toString() ?? new Date().getFullYear().toString());
  const [isPublic, setIsPublic] = useState(project?.isPublic ?? true);
  const [isFeatured, setIsFeatured] = useState(project?.isFeatured ?? false);
  const [techStack, setTechStack] = useState(project?.techStack?.join(", ") ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(project?.tags?.map((t) => t.id) ?? []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = !!project;

  function autoSlug(val: string) {
    return val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = {
        title,
        slug: slug || autoSlug(title),
        summary,
        classification,
        status,
        year: year ? parseInt(year, 10) : null,
        isPublic,
        isFeatured,
        techStack: techStack.split(",").map((s) => s.trim()).filter(Boolean),
        tagIds: selectedTagIds,
      };

      if (isEdit) {
        await apiFetch(`/projects/${project.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch("/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  }

  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div
      className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-12 px-4 overflow-y-auto"
      data-testid="project-form-modal"
      role="dialog"
      aria-modal="true"
      aria-label={project ? `Edit project: ${project.title}` : "New Project"}
      ref={trapRef}
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="glass w-full max-w-2xl mb-12">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8">
          <span className="text-[10px] mono text-white/50 tracking-[0.2em] uppercase">
            {isEdit ? "EDIT PROJECT" : "NEW PROJECT"}
          </span>
          <button type="button" onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors text-xs mono">CLOSE</button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] mono text-white/30 tracking-[0.15em] uppercase mb-1.5 block">TITLE</label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!isEdit) setSlug(autoSlug(e.target.value));
                }}
                required
                className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs text-white/80 mono outline-none focus:border-amber-500/30"
                data-testid="input-project-title"
              />
            </div>
            <div>
              <label className="text-[9px] mono text-white/30 tracking-[0.15em] uppercase mb-1.5 block">SLUG</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs text-white/60 mono outline-none focus:border-amber-500/30"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] mono text-white/30 tracking-[0.15em] uppercase mb-1.5 block">SUMMARY</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              rows={3}
              className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs text-white/70 mono outline-none focus:border-amber-500/30 resize-y"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[9px] mono text-white/30 tracking-[0.15em] uppercase mb-1.5 block">CLASSIFICATION</label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs text-white/70 mono outline-none focus:border-amber-500/30"
              >
                <option value="UNCLASSIFIED">UNCLASSIFIED</option>
                <option value="RESTRICTED">RESTRICTED</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] mono text-white/30 tracking-[0.15em] uppercase mb-1.5 block">STATUS</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs text-white/70 mono outline-none focus:border-amber-500/30"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="DEPLOYED">DEPLOYED</option>
                <option value="BETA">BETA</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] mono text-white/30 tracking-[0.15em] uppercase mb-1.5 block">YEAR</label>
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                type="number"
                min="2000"
                max="2099"
                className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs text-white/70 mono outline-none focus:border-amber-500/30"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] mono text-white/30 tracking-[0.15em] uppercase mb-1.5 block">TECH STACK (comma separated)</label>
            <input
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="TypeScript, React, PostgreSQL..."
              className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs text-white/70 mono outline-none focus:border-amber-500/30"
            />
          </div>

          <div>
            <label className="text-[9px] mono text-white/30 tracking-[0.15em] uppercase mb-2 block">TAGS</label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`text-[9px] mono px-2.5 py-1 border transition-colors ${
                    selectedTagIds.includes(tag.id)
                      ? "border-amber-500/40 text-amber-500/80 bg-amber-500/10"
                      : "border-white/10 text-white/30 hover:border-white/20"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                role="switch"
                aria-checked={isPublic}
                aria-label="Toggle public visibility"
                className={`w-8 h-4 rounded-full transition-colors relative focus:outline-none focus:ring-1 focus:ring-blue-400/40 ${isPublic ? "bg-blue-500/40" : "bg-white/10"}`}
              >
                <span className={`absolute top-0.5 w-3 h-3 rounded-full transition-transform ${isPublic ? "translate-x-4 bg-blue-400" : "translate-x-0.5 bg-white/30"}`} />
              </button>
              <span className="text-[9px] mono text-white/40 uppercase tracking-widest">PUBLIC</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                role="switch"
                aria-checked={isFeatured}
                aria-label="Toggle featured"
                className={`w-8 h-4 rounded-full transition-colors relative focus:outline-none focus:ring-1 focus:ring-amber-400/40 ${isFeatured ? "bg-amber-500/40" : "bg-white/10"}`}
              >
                <span className={`absolute top-0.5 w-3 h-3 rounded-full transition-transform ${isFeatured ? "translate-x-4 bg-amber-400" : "translate-x-0.5 bg-white/30"}`} />
              </button>
              <span className="text-[9px] mono text-white/40 uppercase tracking-widest">FEATURED</span>
            </div>
          </div>

          {error && (
            <div className="text-xs mono text-red-400/80 border border-red-500/20 px-3 py-2">
              ERROR: {error}
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-white/5">
            <button
              type="submit"
              disabled={loading}
              className="text-[9px] mono px-4 py-2 border border-amber-500/30 text-amber-500/70 hover:text-amber-500 transition-colors disabled:opacity-30"
              data-testid="btn-save-project"
            >
              {loading ? "SAVING..." : isEdit ? "UPDATE PROJECT" : "CREATE PROJECT"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-[9px] mono px-4 py-2 border border-white/10 text-white/30 hover:text-white/60 transition-colors"
            >CANCEL</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function AdminPage() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [sectionsProjectId, setSectionsProjectId] = useState<number | null>(null);
  const [vaultProjectId, setVaultProjectId] = useState<number | null>(null);
  const [vaultProjectTitle, setVaultProjectTitle] = useState("");

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["admin-projects"],
    queryFn: () => apiFetch<Project[]>("/admin/projects"),
    enabled: isAdmin,
  });

  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: () => apiFetch<Tag[]>("/tags"),
    enabled: isAdmin,
  });

  const togglePublic = useMutation({
    mutationFn: ({ id, isPublic }: { id: number; isPublic: boolean }) =>
      apiFetch(`/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic }),
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-projects"] }),
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ id, isFeatured }: { id: number; isFeatured: boolean }) =>
      apiFetch(`/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured }),
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-projects"] }),
  });

  const deleteProject = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-projects"] }),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = `${BASE}/api/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-12 max-w-md w-full mx-6 text-center"
        >
          <div className="text-[10px] mono text-red-400/60 tracking-[0.3em] uppercase mb-4">FORBIDDEN</div>
          <h2 className="text-xl font-black text-white/80 mb-3">ADMIN CLEARANCE REQUIRED</h2>
          <p className="text-sm text-white/35 leading-relaxed mb-8">
            Your session does not have admin privileges. Contact the system operator.
          </p>
          <Link href="/">
            <span className="inline-block text-[10px] mono tracking-[0.2em] uppercase px-6 py-3 border border-white/15 text-white/40 hover:border-white/30 hover:text-white/70 transition-colors cursor-pointer">
              RETURN TO BASE
            </span>
          </Link>
        </motion.div>
      </div>
    );
  }

  const sectionsProject = projects.find((p) => p.id === sectionsProjectId);

  return (
    <div className="min-h-screen pt-14" data-testid="admin-page">
      {(showForm || editingProject) && (
        <ProjectForm
          project={editingProject}
          tags={tags}
          onClose={() => { setShowForm(false); setEditingProject(null); }}
          onSaved={() => {
            setShowForm(false);
            setEditingProject(null);
            void qc.invalidateQueries({ queryKey: ["admin-projects"] });
          }}
        />
      )}
      {sectionsProjectId !== null && (
        <SectionsEditor
          projectId={sectionsProjectId}
          onClose={() => setSectionsProjectId(null)}
        />
      )}
      {vaultProjectId !== null && (
        <VaultNoteEditor
          projectId={vaultProjectId}
          projectTitle={vaultProjectTitle}
          onClose={() => setVaultProjectId(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[10px] mono text-red-400/60 tracking-[0.3em] uppercase">ADMIN CLEARANCE ACTIVE</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white/90 mb-2" data-testid="admin-heading">
                ADMIN INTERFACE
              </h1>
              <div className="section-line mb-4 max-w-xs" />
              <p className="text-sm text-white/35">Content management for portfolio operations.</p>
            </div>
            <button
              onClick={() => { setEditingProject(null); setShowForm(true); }}
              className="shrink-0 glass px-4 py-2.5 text-[9px] mono tracking-[0.2em] uppercase border border-amber-500/25 text-amber-500/60 hover:text-amber-500 hover:border-amber-500/50 transition-colors flex items-center gap-2"
              data-testid="btn-new-project"
            >
              + NEW PROJECT
            </button>
          </div>
        </div>

        {projectsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass h-14 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="glass overflow-hidden">
            <div className="border-b border-white/5 px-5 py-2.5 grid grid-cols-12 gap-4 text-[8px] mono text-white/25 tracking-[0.15em] uppercase">
              <div className="col-span-4">TITLE</div>
              <div className="col-span-2">CLASSIFICATION</div>
              <div className="col-span-2">STATUS</div>
              <div className="col-span-1 text-center">PUBLIC</div>
              <div className="col-span-1 text-center">FEAT.</div>
              <div className="col-span-2 text-right">ACTIONS</div>
            </div>

            <AnimatePresence initial={false}>
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-white/3 last:border-0 px-5 py-3 grid grid-cols-12 gap-4 items-center hover:bg-white/2 transition-colors"
                  data-testid={`admin-project-row-${project.id}`}
                >
                  <div className="col-span-4 min-w-0">
                    <div className="text-xs text-white/75 font-medium truncate">{project.title}</div>
                    <div className="text-[9px] mono text-white/25 truncate">{project.slug}</div>
                  </div>
                  <div className="col-span-2">
                    <ClassLabel value={project.classification} />
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] mono text-white/40">{project.status}</span>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => void togglePublic.mutateAsync({ id: project.id, isPublic: !project.isPublic })}
                      className={`w-4 h-4 border transition-colors ${project.isPublic ? "border-blue-400/50 bg-blue-400/20" : "border-white/20"}`}
                      title={project.isPublic ? "Public — click to make private" : "Private — click to make public"}
                      data-testid={`toggle-public-${project.id}`}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => void toggleFeatured.mutateAsync({ id: project.id, isFeatured: !project.isFeatured })}
                      className={`w-4 h-4 border transition-colors ${project.isFeatured ? "border-amber-400/50 bg-amber-400/20" : "border-white/20"}`}
                      title={project.isFeatured ? "Featured — click to remove" : "Not featured — click to feature"}
                      data-testid={`toggle-featured-${project.id}`}
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setEditingProject(project)}
                      className="text-[8px] mono text-white/30 hover:text-white/70 transition-colors px-1.5 py-0.5 border border-transparent hover:border-white/15"
                      data-testid={`btn-edit-${project.id}`}
                    >EDIT</button>
                    <button
                      onClick={() => setSectionsProjectId(project.id)}
                      className="text-[8px] mono text-blue-400/30 hover:text-blue-400 transition-colors px-1.5 py-0.5 border border-transparent hover:border-blue-400/15"
                      data-testid={`btn-sections-${project.id}`}
                    >SEC</button>
                    <button
                      onClick={() => { setVaultProjectId(project.id); setVaultProjectTitle(project.title); }}
                      className="text-[8px] mono text-amber-500/30 hover:text-amber-500 transition-colors px-1.5 py-0.5 border border-transparent hover:border-amber-500/15"
                      data-testid={`btn-vault-${project.id}`}
                    >VAULT</button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${project.title}"? This cannot be undone.`)) {
                          void deleteProject.mutateAsync(project.id);
                        }
                      }}
                      className="text-[8px] mono text-red-400/30 hover:text-red-400 transition-colors px-1.5 py-0.5 border border-transparent hover:border-red-400/15"
                      data-testid={`btn-delete-${project.id}`}
                    >DEL</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-8 glass p-5">
          <div className="text-[10px] mono text-white/30 tracking-[0.2em] uppercase mb-4">TAGS REGISTRY</div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="glass px-2.5 py-1 text-[9px] mono text-white/40 border border-white/8 flex items-center gap-1.5"
                data-testid={`tag-${tag.id}`}
              >
                <span className="text-blue-400/40">{tag.category ?? "misc"}</span>
                <span className="text-white/20">/</span>
                <span>{tag.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
