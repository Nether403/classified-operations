import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useListProjects, useListTags } from "@workspace/api-client-react";
import type { Project } from "@workspace/api-client-react";
import { ClassificationBadge } from "@/components/ui/classification-badge";
import { StatusBadge } from "@/components/ui/status-badge";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
      data-testid={`project-card-${project.id}`}
    >
      <Link href={`/projects/${project.slug}`}>
        <div className="glass glass-hover project-card-hover cursor-pointer p-6 group h-full flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <ClassificationBadge classification={project.classification} />
              <StatusBadge status={project.status} />
            </div>
            {project.year && (
              <span className="text-[10px] mono text-white/25 shrink-0">{project.year}</span>
            )}
          </div>

          <h2 className="text-lg font-semibold text-white/90 mb-2 group-hover:text-amber-400 transition-colors duration-200">
            {project.title}
          </h2>

          <p className="text-sm text-white/45 leading-relaxed line-clamp-3 mb-5">
            {project.summary}
          </p>

          <div className="mt-auto">
            {project.techStack && project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.techStack.slice(0, 5).map((tech) => (
                  <span
                    key={tech}
                    className="text-[9px] mono tracking-wide px-2 py-0.5 bg-white/5 border border-white/8 text-white/35 rounded-sm"
                  >
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 5 && (
                  <span className="text-[9px] mono text-white/20">+{project.techStack.length - 5}</span>
                )}
              </div>
            )}

            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag.id}
                    className="text-[9px] mono tracking-[0.1em] uppercase px-2 py-0.5 text-blue-400/50 border border-blue-500/15 rounded-sm"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 text-amber-500/50 group-hover:text-amber-500 transition-colors">
              <div className="h-px flex-1 bg-amber-500/15 group-hover:bg-amber-500/30 transition-colors" />
              <span className="text-[9px] mono tracking-[0.2em] uppercase">VIEW DOSSIER</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function HeroSection({ totalCount }: { totalCount: number }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  const labels = ["INITIALIZING", "DECRYPTING", "ACCESS GRANTED", "SYSTEM READY"];
  const label = labels[tick % labels.length];

  return (
    <div className="relative pt-32 pb-16 px-6 max-w-7xl mx-auto">
      <div className="grid-dots absolute inset-0 opacity-30 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[10px] mono text-amber-500/60 tracking-[0.3em] uppercase terminal-cursor">
            {label}
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 leading-none">
          <span className="text-white/90">CLASSIFIED</span>
          <br />
          <span className="text-amber-500">OPERATIONS</span>
        </h1>

        <div className="flex items-center gap-6 mb-6">
          <div className="section-line flex-1 max-w-xs" />
          <span className="text-[10px] mono text-white/25 tracking-[0.2em]" data-testid="text-total-count">
            {totalCount} DOSSIERS ON FILE
          </span>
        </div>

        <p className="text-base text-white/40 max-w-xl leading-relaxed font-light">
          A curated record of engineering operations across AI systems,
          distributed infrastructure, and computational art. Clearance required
          for restricted files.
        </p>
      </motion.div>
    </div>
  );
}

function FilterBar({
  activeTag,
  setActiveTag,
  activeClassification,
  setActiveClassification,
  search,
  setSearch,
}: {
  activeTag: string;
  setActiveTag: (v: string) => void;
  activeClassification: string;
  setActiveClassification: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
}) {
  const { data: tags } = useListTags();
  const classifications = ["ALL", "RESTRICTED", "CONFIDENTIAL", "UNCLASSIFIED"];

  return (
    <div className="px-6 max-w-7xl mx-auto mb-10">
      <div className="glass p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] mono text-white/30 tracking-[0.2em] uppercase shrink-0">SEARCH</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by keyword..."
            className="flex-1 bg-transparent border-0 outline-none text-sm text-white/70 placeholder:text-white/20 mono"
            data-testid="input-search"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-white/30 hover:text-white/60 text-xs mono px-2"
              data-testid="btn-clear-search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="h-px bg-white/5" />

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[9px] mono text-white/25 tracking-[0.2em] uppercase mr-1">CLEARANCE</span>
          {classifications.map((cls) => (
            <button
              key={cls}
              onClick={() => setActiveClassification(cls === "ALL" ? "" : cls)}
              data-testid={`filter-classification-${cls.toLowerCase()}`}
              className={`text-[9px] mono tracking-[0.15em] uppercase px-2.5 py-1 border transition-colors ${
                (cls === "ALL" && !activeClassification) || cls === activeClassification
                  ? "border-amber-500/50 text-amber-500 bg-amber-500/10"
                  : "border-white/10 text-white/35 hover:text-white/60 hover:border-white/20"
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[9px] mono text-white/25 tracking-[0.2em] uppercase mr-1">DOMAIN</span>
            <button
              onClick={() => setActiveTag("")}
              data-testid="filter-tag-all"
              className={`text-[9px] mono tracking-[0.15em] uppercase px-2.5 py-1 border transition-colors ${
                !activeTag
                  ? "border-blue-500/40 text-blue-400 bg-blue-500/10"
                  : "border-white/10 text-white/35 hover:text-white/60 hover:border-white/20"
              }`}
            >
              ALL
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setActiveTag(tag.slug === activeTag ? "" : tag.slug)}
                data-testid={`filter-tag-${tag.slug}`}
                className={`text-[9px] mono tracking-[0.15em] uppercase px-2.5 py-1 border transition-colors ${
                  tag.slug === activeTag
                    ? "border-blue-500/40 text-blue-400 bg-blue-500/10"
                    : "border-white/10 text-white/35 hover:text-white/60 hover:border-white/20"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function HomePage() {
  const [activeTag, setActiveTag] = useState("");
  const [activeClassification, setActiveClassification] = useState("");
  const [search, setSearch] = useState("");

  const { data: projects, isLoading } = useListProjects({
    tag: activeTag || undefined,
    search: search || undefined,
    classification: activeClassification || undefined,
  });

  const featured = projects?.filter((p) => p.isFeatured) ?? [];
  const rest = projects?.filter((p) => !p.isFeatured) ?? [];
  const displayProjects = featured.length > 0 && !search && !activeTag && !activeClassification
    ? [...featured, ...rest]
    : (projects ?? []);

  return (
    <div className="min-h-screen pb-24" data-testid="home-page">
      <HeroSection totalCount={projects?.length ?? 0} />
      <FilterBar
        activeTag={activeTag}
        setActiveTag={setActiveTag}
        activeClassification={activeClassification}
        setActiveClassification={setActiveClassification}
        search={search}
        setSearch={setSearch}
      />

      <div className="px-6 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="projects-loading">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass h-64 animate-pulse" />
            ))}
          </div>
        ) : displayProjects.length === 0 ? (
          <div className="text-center py-24" data-testid="projects-empty">
            <div className="text-[10px] mono text-white/25 tracking-[0.3em] uppercase mb-4">
              NO RECORDS FOUND
            </div>
            <p className="text-white/30 text-sm">Adjust filters or expand search parameters</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch"
          >
            <AnimatePresence>
              {displayProjects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
