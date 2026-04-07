import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence, useReducedMotion, LayoutGroup } from "framer-motion";
import { useListProjects, useListTags } from "@workspace/api-client-react";
import type { Project } from "@workspace/api-client-react";
import { ClassificationBadge } from "@/components/ui/classification-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { useSEO } from "@/hooks/use-seo";

function MagneticCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cardRef.current.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(4px)`;
    },
    [reducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
    cardRef.current.style.transition = "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)";
    setTimeout(() => {
      if (cardRef.current) cardRef.current.style.transition = "";
    }, 400);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      data-testid={`project-card-${project.id}`}
    >
      <Link href={`/projects/${project.slug}`}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="glass magnetic-card cursor-pointer p-6 group h-full flex flex-col"
          style={{ transformStyle: "preserve-3d" }}
        >
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

            <div className="flex items-center gap-2 text-amber-500/40 group-hover:text-amber-500 transition-colors duration-300">
              <div className="h-px flex-1 bg-amber-500/10 group-hover:bg-amber-500/30 transition-colors duration-300" />
              <span className="text-[9px] mono tracking-[0.2em] uppercase">VIEW DOSSIER</span>
              <motion.span
                className="text-[9px] mono"
                initial={{ x: 0 }}
                animate={{ x: 0 }}
                whileHover={{ x: 3 }}
              >
                →
              </motion.span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

const HERO_LINES = [
  { label: "SYSTEM BOOT", char: ">" },
  { label: "LOADING DOSSIERS", char: "»" },
  { label: "DECRYPTING FILES", char: "≡" },
  { label: "ACCESS GRANTED", char: "✓" },
];

function HeroSection({ totalCount }: { totalCount: number }) {
  const [phase, setPhase] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  const currentLabel = HERO_LINES[phase % HERO_LINES.length];
  const displayText = reducedMotion ? currentLabel.label : currentLabel.label.slice(0, charIndex);

  useEffect(() => {
    if (reducedMotion) {
      const id = setInterval(() => setPhase((p) => p + 1), 2200);
      return () => clearInterval(id);
    }
    const interval = setInterval(() => {
      setCharIndex((ci) => {
        if (ci < currentLabel.label.length) return ci + 1;
        setTimeout(() => {
          setPhase((p) => p + 1);
          setCharIndex(0);
        }, 900);
        clearInterval(interval);
        return ci;
      });
    }, 55);
    return () => clearInterval(interval);
  }, [phase, currentLabel.label, reducedMotion]);

  return (
    <div className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="grid-dots absolute inset-0 opacity-20 pointer-events-none" />

      <motion.div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      />

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-amber-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="w-1 h-1 rounded-full bg-amber-500/40"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
          </div>
          <span className="text-[10px] mono text-amber-500/70 tracking-[0.35em] uppercase">
            {currentLabel.char}&nbsp;{displayText}
            {!reducedMotion && charIndex < currentLabel.label.length && (
              <span className="inline-block w-0.5 h-3 bg-amber-500 ml-0.5 animate-pulse align-text-bottom" />
            )}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-4 leading-none">
            {"CLASSIFIED".split("").map((char, i) => (
              <motion.span
                key={i}
                className="inline-block text-white/90"
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.04 }}
              >
                {char}
              </motion.span>
            ))}
            <br />
            {"OPERATIONS".split("").map((char, i) => (
              <motion.span
                key={i}
                className="inline-block text-amber-500"
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.55 + i * 0.04 }}
              >
                {char}
              </motion.span>
            ))}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="flex items-center gap-6 mb-6 origin-left"
        >
          <div className="section-line flex-1 max-w-xs" />
          <span className="text-[10px] mono text-white/25 tracking-[0.2em]" data-testid="text-total-count">
            {totalCount} DOSSIERS ON FILE
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="text-base text-white/40 max-w-xl leading-relaxed font-light"
        >
          A curated record of engineering operations across AI systems,
          distributed infrastructure, and computational art. Clearance required
          for restricted files.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 flex items-center gap-3"
        >
          <div className="text-[9px] mono text-white/15 tracking-[0.2em] uppercase">
            CLEARANCE LEVELS:
          </div>
          {["UNCLASSIFIED", "CONFIDENTIAL", "RESTRICTED"].map((cls) => (
            <span key={cls} className={`text-[8px] mono tracking-widest px-2 py-0.5 border rounded-sm ${
              cls === "RESTRICTED"
                ? "text-red-400/50 border-red-500/20 bg-red-500/5"
                : cls === "CONFIDENTIAL"
                  ? "text-amber-400/50 border-amber-500/20 bg-amber-500/5"
                  : "text-green-400/50 border-green-500/20 bg-green-500/5"
            }`}>
              {cls}
            </span>
          ))}
        </motion.div>
      </div>
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="px-6 max-w-7xl mx-auto mb-10"
    >
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
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearch("")}
                className="text-white/30 hover:text-white/60 text-xs mono px-2"
                data-testid="btn-clear-search"
              >
                ✕
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="h-px bg-white/5" />

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[9px] mono text-white/25 tracking-[0.2em] uppercase mr-1">CLEARANCE</span>
          {classifications.map((cls) => (
            <motion.button
              key={cls}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveClassification(cls === "ALL" ? "" : cls)}
              data-testid={`filter-classification-${cls.toLowerCase()}`}
              className={`text-[9px] mono tracking-[0.15em] uppercase px-2.5 py-1 border transition-colors ${
                (cls === "ALL" && !activeClassification) || cls === activeClassification
                  ? "border-amber-500/50 text-amber-500 bg-amber-500/10"
                  : "border-white/10 text-white/35 hover:text-white/60 hover:border-white/20"
              }`}
            >
              {cls}
            </motion.button>
          ))}
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[9px] mono text-white/25 tracking-[0.2em] uppercase mr-1">DOMAIN</span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTag("")}
              data-testid="filter-tag-all"
              className={`text-[9px] mono tracking-[0.15em] uppercase px-2.5 py-1 border transition-colors ${
                !activeTag
                  ? "border-blue-500/40 text-blue-400 bg-blue-500/10"
                  : "border-white/10 text-white/35 hover:text-white/60 hover:border-white/20"
              }`}
            >
              ALL
            </motion.button>
            {tags.map((tag) => (
              <motion.button
                key={tag.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTag(tag.slug === activeTag ? "" : tag.slug)}
                data-testid={`filter-tag-${tag.slug}`}
                className={`text-[9px] mono tracking-[0.15em] uppercase px-2.5 py-1 border transition-colors ${
                  tag.slug === activeTag
                    ? "border-blue-500/40 text-blue-400 bg-blue-500/10"
                    : "border-white/10 text-white/35 hover:text-white/60 hover:border-white/20"
                }`}
              >
                {tag.name}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function HomePage() {
  useSEO({
    title: "DOSSIER ARCHIVE",
    description: "A curated record of classified engineering operations across AI, infrastructure, and computational art.",
  });

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
              <SkeletonCard key={i} className="h-64" />
            ))}
          </div>
        ) : displayProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
            data-testid="projects-empty"
          >
            <div className="text-[10px] mono text-white/25 tracking-[0.3em] uppercase mb-4">
              NO RECORDS FOUND
            </div>
            <p className="text-white/30 text-sm">Adjust filters or expand search parameters</p>
          </motion.div>
        ) : (
          <LayoutGroup>
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch"
            >
              <AnimatePresence mode="popLayout">
                {displayProjects.map((project, i) => (
                  <MagneticCard key={project.id} project={project} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        )}
      </div>
    </div>
  );
}
