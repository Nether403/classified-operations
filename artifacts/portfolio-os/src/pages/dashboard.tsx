import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useGetDashboardSummary, useListProjects, useListTags } from "@workspace/api-client-react";
import type { Project, DashboardSummary } from "@workspace/api-client-react";
import { ClassificationBadge } from "@/components/ui/classification-badge";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
};

function ProjectRow({ project }: { project: Project }) {
  const [, setLocation] = useLocation();
  return (
    <motion.div
      variants={itemVariants}
      className="glass glass-hover flex items-center gap-4 px-4 py-3 group"
      data-testid={`dashboard-project-row-${project.id}`}
    >
      <ClassificationBadge classification={project.classification} />
      <Link href={`/projects/${project.slug}`} className="flex-1 min-w-0 cursor-pointer">
        <div className="text-sm font-medium text-white/85 group-hover:text-amber-400 transition-colors truncate">
          {project.title}
        </div>
        <div className="text-xs text-white/35 truncate mt-0.5">{project.summary}</div>
      </Link>
      <div className="flex items-center gap-2 shrink-0">
        {project.techStack.slice(0, 3).map((tech) => (
          <span key={tech} className="text-[9px] mono px-1.5 py-0.5 bg-white/5 border border-white/8 text-white/35 rounded-sm hidden sm:inline">
            {tech}
          </span>
        ))}
        {project.year && (
          <span className="text-[9px] mono text-white/25 ml-1 hidden md:inline">{project.year}</span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setLocation(`/compare?a=${project.id}`); }}
          className="text-[8px] mono text-blue-400/40 border border-blue-500/15 px-2 py-1 hover:text-blue-400 hover:border-blue-500/40 transition-colors tracking-widest uppercase shrink-0"
          data-testid={`btn-compare-row-${project.id}`}
        >
          CMP
        </button>
      </div>
      <Link href={`/projects/${project.slug}`}>
        <span className="text-[9px] mono text-amber-500/30 group-hover:text-amber-500 transition-colors tracking-widest cursor-pointer">→</span>
      </Link>
    </motion.div>
  );
}

function ProjectNetworkNode({
  label,
  count,
  x,
  y,
  color,
  isCenter,
}: {
  label: string;
  count?: number;
  x: number;
  y: number;
  color: string;
  isCenter?: boolean;
}) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={isCenter ? 28 : 20}
        fill="none"
        stroke={color}
        strokeWidth={isCenter ? 1.5 : 1}
        opacity={0.4}
      />
      <circle
        cx={x}
        cy={y}
        r={isCenter ? 24 : 16}
        fill={color}
        opacity={isCenter ? 0.08 : 0.05}
      />
      {count !== undefined && (
        <text
          x={x}
          y={y + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={isCenter ? 14 : 11}
          fontWeight="bold"
          opacity={0.8}
        >
          {count}
        </text>
      )}
      <text
        x={x}
        y={y + (isCenter ? 38 : 28)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={isCenter ? 9 : 8}
        fontFamily="monospace"
        opacity={0.6}
        letterSpacing={1}
      >
        {label.toUpperCase()}
      </text>
    </g>
  );
}

function ProjectNetworkGraph({ summary }: { summary: DashboardSummary | undefined }) {
  if (!summary) return null;

  const breakdown = summary.classificationBreakdown;
  const total = summary.totalProjects;

  const nodes = [
    { label: "System", count: total, x: 200, y: 110, color: "#f59e0b", isCenter: true },
    ...breakdown.map((c, i) => {
      const angle = (i / breakdown.length) * 2 * Math.PI - Math.PI / 2;
      const r = 75;
      return {
        label: c.classification,
        count: c.count,
        x: 200 + r * Math.cos(angle),
        y: 110 + r * Math.sin(angle),
        color: c.classification === "RESTRICTED" ? "#ef4444" : c.classification === "CONFIDENTIAL" ? "#f59e0b" : "#60a5fa",
        isCenter: false,
      };
    }),
  ];

  return (
    <svg
      viewBox="0 0 400 220"
      className="w-full h-auto opacity-70"
      aria-label="Project network graph"
    >
      {nodes.slice(1).map((node) => (
        <line
          key={node.label}
          x1={200}
          y1={110}
          x2={node.x}
          y2={node.y}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      ))}
      {nodes.map((node) => (
        <ProjectNetworkNode key={node.label} {...node} />
      ))}
    </svg>
  );
}

export function DashboardPage() {
  const [search, setSearch] = useState("");
  const [activeClassification, setActiveClassification] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const shouldReduceMotion = useReducedMotion();

  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: allProjects, isLoading: isLoadingProjects } = useListProjects();
  const { data: tags } = useListTags();

  const filteredProjects = useMemo(() => {
    if (!allProjects) return [];
    return allProjects.filter((p) => {
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.summary.toLowerCase().includes(search.toLowerCase()) ||
        p.techStack.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesClass = !activeClassification || p.classification === activeClassification;
      const matchesTag = !activeTag || p.tags.some((t) => t.slug === activeTag);
      return matchesSearch && matchesClass && matchesTag;
    });
  }, [allProjects, search, activeClassification, activeTag]);

  const classifications = ["RESTRICTED", "CONFIDENTIAL", "UNCLASSIFIED"];

  if (isLoadingSummary || isLoadingProjects) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center" data-testid="dashboard-loading">
        <div className="text-center">
          <div className="w-8 h-8 border border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-[10px] mono text-amber-500/50 tracking-[0.3em] uppercase">
            GATHERING INTEL
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-24" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] mono text-blue-500/60 tracking-[0.3em] uppercase">
              COMMAND CENTER ACTIVE
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white/90 mb-4" data-testid="dashboard-heading">
            DASHBOARD
          </h1>
          <div className="section-line mb-6 max-w-xl" />
          <p className="text-base text-white/55 leading-relaxed max-w-2xl font-light">
            System overview and classification metrics. Real-time operation status.
          </p>
        </div>

        <motion.div
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial={shouldReduceMotion ? false : "hidden"}
          animate={shouldReduceMotion ? false : "show"}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
        >
          <motion.div variants={itemVariants} className="glass p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="text-[10px] mono text-white/30 tracking-[0.2em] uppercase mb-4">TOTAL DOSSIERS</div>
            <div className="text-5xl font-black text-amber-500 mb-2" data-testid="stat-total">{summary?.totalProjects || 0}</div>
            <div className="text-xs text-white/40">Records in system</div>
          </motion.div>

          {summary?.classificationBreakdown.map((c) => (
            <motion.div key={c.classification} variants={itemVariants} className="glass p-6">
              <div className="text-[10px] mono text-white/30 tracking-[0.2em] uppercase mb-4">
                {c.classification} FILES
              </div>
              <div className="text-4xl font-light text-white/80 mb-2" data-testid={`stat-${c.classification.toLowerCase()}`}>{c.count}</div>
              <div className="text-xs text-white/40">Clearance level</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="text-[10px] mono text-white/30 tracking-[0.2em] uppercase flex items-center gap-4 mb-4">
              <span>FEATURED OPERATIONS</span>
              <div className="section-line flex-1" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {summary?.featuredProjects?.map((project) => (
                <Link key={project.id} href={`/projects/${project.slug}`}>
                  <div className="glass glass-hover p-5 cursor-pointer h-full flex flex-col group" data-testid={`featured-project-${project.id}`}>
                    <div className="flex justify-between items-start mb-3">
                      <ClassificationBadge classification={project.classification} />
                      <span className="text-[9px] mono text-white/30 group-hover:text-amber-500 transition-colors">VIEW</span>
                    </div>
                    <h3 className="text-base font-semibold text-white/90 mb-2 group-hover:text-amber-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-white/40 line-clamp-2 mt-auto leading-relaxed">
                      {project.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: 16 }}
            animate={shouldReduceMotion ? false : { opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-[10px] mono text-white/30 tracking-[0.2em] uppercase flex items-center gap-4 mb-4">
              <span>NETWORK GRAPH</span>
              <div className="section-line flex-1" />
            </div>
            <div className="glass p-4" data-testid="network-graph">
              <ProjectNetworkGraph summary={summary} />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-[10px] mono text-white/30 tracking-[0.2em] uppercase flex items-center gap-4 mb-4">
            <span>ALL DOSSIERS</span>
            <div className="section-line flex-1" />
          </div>

          <div className="glass p-4 mb-4 flex flex-col gap-3" data-testid="dashboard-filters">
            <div className="flex items-center gap-3">
              <span className="text-[10px] mono text-white/30 tracking-[0.2em] uppercase shrink-0">SEARCH</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, summary, or stack..."
                className="flex-1 bg-transparent border-0 outline-none text-sm text-white/70 placeholder:text-white/20 mono"
                data-testid="input-dashboard-search"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-white/30 hover:text-white/60 text-xs mono"
                  data-testid="button-clear-search"
                >
                  CLEAR
                </button>
              )}
            </div>

            <div className="h-px bg-white/5" />

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[9px] mono text-white/25 tracking-[0.2em] uppercase mr-1">CLEARANCE</span>
              <button
                onClick={() => setActiveClassification("")}
                className={`text-[9px] mono tracking-[0.15em] uppercase px-2.5 py-1 border transition-colors ${
                  !activeClassification
                    ? "border-amber-500/50 text-amber-500 bg-amber-500/10"
                    : "border-white/10 text-white/35 hover:text-white/60"
                }`}
                data-testid="filter-classification-all"
              >
                ALL
              </button>
              {classifications.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setActiveClassification(cls === activeClassification ? "" : cls)}
                  className={`text-[9px] mono tracking-[0.15em] uppercase px-2.5 py-1 border transition-colors ${
                    cls === activeClassification
                      ? "border-amber-500/50 text-amber-500 bg-amber-500/10"
                      : "border-white/10 text-white/35 hover:text-white/60"
                  }`}
                  data-testid={`filter-classification-${cls.toLowerCase()}`}
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
                  className={`text-[9px] mono tracking-[0.15em] uppercase px-2.5 py-1 border transition-colors ${
                    !activeTag
                      ? "border-blue-500/40 text-blue-400 bg-blue-500/10"
                      : "border-white/10 text-white/35 hover:text-white/60"
                  }`}
                  data-testid="filter-tag-all"
                >
                  ALL
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => setActiveTag(tag.slug === activeTag ? "" : tag.slug)}
                    className={`text-[9px] mono tracking-[0.15em] uppercase px-2.5 py-1 border transition-colors ${
                      tag.slug === activeTag
                        ? "border-blue-500/40 text-blue-400 bg-blue-500/10"
                        : "border-white/10 text-white/35 hover:text-white/60"
                    }`}
                    data-testid={`filter-tag-${tag.slug}`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredProjects.length === 0 ? (
            <div className="glass p-12 text-center" data-testid="dashboard-no-results">
              <div className="text-[10px] mono text-white/25 tracking-[0.3em] uppercase mb-3">NO RECORDS FOUND</div>
              <p className="text-white/30 text-sm">Adjust filters or expand search</p>
            </div>
          ) : (
            <motion.div
              className="flex flex-col gap-2"
              variants={shouldReduceMotion ? undefined : containerVariants}
              initial={shouldReduceMotion ? false : "hidden"}
              animate={shouldReduceMotion ? false : "show"}
              data-testid="dashboard-project-list"
            >
              {filteredProjects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
