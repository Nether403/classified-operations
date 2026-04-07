import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  Cell, PieChart, Pie,
} from "recharts";
import { useGetDashboardSummary, useListProjects, useListTags } from "@workspace/api-client-react";
import type { Project, DashboardSummary } from "@workspace/api-client-react";
import { ClassificationBadge } from "@/components/ui/classification-badge";
import { SkeletonCard, SkeletonRow, SkeletonStatCard } from "@/components/ui/skeleton-card";
import { useOpenOperator } from "@/components/operator-panel";
import { useSEO } from "@/hooks/use-seo";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
};

const CHART_COLORS = {
  RESTRICTED: "#ef4444",
  CONFIDENTIAL: "#f59e0b",
  UNCLASSIFIED: "#60a5fa",
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-3 py-2 text-[10px] mono border border-amber-500/20">
      <div className="text-white/50 tracking-widest mb-1">{label}</div>
      <div className="text-amber-400">{payload[0].value} PROJECTS</div>
    </div>
  );
}

function ClassificationPieChart({ summary }: { summary: DashboardSummary }) {
  const data = summary.classificationBreakdown.map((c) => ({
    name: c.classification,
    value: c.count,
    color: CHART_COLORS[c.classification as keyof typeof CHART_COLORS] ?? "#60a5fa",
  }));

  return (
    <div className="glass p-5" data-testid="network-graph">
      <div className="text-[10px] mono text-white/25 tracking-[0.2em] uppercase mb-4 flex items-center gap-3">
        <span>CLASSIFICATION SPLIT</span>
        <div className="h-px flex-1 bg-white/5" />
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} opacity={0.75} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-4 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: d.color, opacity: 0.75 }} />
            <span className="text-[8px] mono text-white/40 tracking-[0.1em]">{d.name.slice(0, 3)}</span>
            <span className="text-[8px] mono text-white/60">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TechStackChart({ projects }: { projects: Project[] }) {
  const techCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of projects) {
      for (const tech of p.techStack.slice(0, 6)) {
        counts[tech] = (counts[tech] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name: name.slice(0, 12), count }));
  }, [projects]);

  if (techCounts.length === 0) return null;

  return (
    <div className="glass p-5">
      <div className="text-[10px] mono text-white/25 tracking-[0.2em] uppercase mb-4 flex items-center gap-3">
        <span>TECH FREQUENCY</span>
        <div className="h-px flex-1 bg-white/5" />
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={techCounts} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 8, fontFamily: "monospace", letterSpacing: "0.05em" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 8, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(245, 158, 11, 0.04)" }} />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {techCounts.map((_, i) => (
              <Cell
                key={i}
                fill={i === 0 ? "rgba(245, 158, 11, 0.7)" : `rgba(245, 158, 11, ${0.35 - i * 0.03})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DomainRadarChart({ projects }: { projects: Project[] }) {
  const domainData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of projects) {
      for (const tag of p.tags) {
        counts[tag.name] = (counts[tag.name] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name: name.slice(0, 10), value }));
  }, [projects]);

  if (domainData.length < 3) return null;

  return (
    <div className="glass p-5">
      <div className="text-[10px] mono text-white/25 tracking-[0.2em] uppercase mb-4 flex items-center gap-3">
        <span>DOMAIN COVERAGE</span>
        <div className="h-px flex-1 bg-white/5" />
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <RadarChart data={domainData} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 8, fontFamily: "monospace" }}
          />
          <Radar
            name="domains"
            dataKey="value"
            stroke="rgba(96, 165, 250, 0.6)"
            fill="rgba(96, 165, 250, 0.15)"
            strokeWidth={1.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

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

export function DashboardPage() {
  useSEO({
    title: "COMMAND DASHBOARD",
    description: "System overview, classification metrics, and real-time operation status.",
  });

  const [search, setSearch] = useState("");
  const [activeClassification, setActiveClassification] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const shouldReduceMotion = useReducedMotion();
  const { openPanel } = useOpenOperator();

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
      <div className="min-h-screen pt-20 pb-24" data-testid="dashboard-loading">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="h-10 w-48 skeleton-shimmer glass rounded-sm mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} className="h-48" />)}
          </div>
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} className="mb-2" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-24" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              className="w-2 h-2 rounded-full bg-blue-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[10px] mono text-blue-500/60 tracking-[0.3em] uppercase">
              COMMAND CENTER ACTIVE
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white/90 mb-4" data-testid="dashboard-heading">
                DASHBOARD
              </h1>
              <div className="section-line mb-6 max-w-xl" />
              <p className="text-base text-white/55 leading-relaxed max-w-2xl font-light">
                System overview and classification metrics. Real-time operation status.
              </p>
            </div>
            <button
              onClick={() => openPanel()}
              className="shrink-0 glass px-4 py-2.5 text-[9px] mono tracking-[0.2em] uppercase border border-blue-500/20 text-blue-400/50 hover:text-blue-400 hover:border-blue-500/40 transition-colors flex items-center gap-2 mt-2"
              data-testid="dashboard-btn-operator"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60" />
              ASK OPERATOR
            </button>
          </div>
        </div>

        <motion.div
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial={shouldReduceMotion ? false : "hidden"}
          animate={shouldReduceMotion ? false : "show"}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10"
        >
          <motion.div variants={itemVariants} className="glass p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="text-[10px] mono text-white/30 tracking-[0.2em] uppercase mb-4">TOTAL DOSSIERS</div>
            <motion.div
              className="text-5xl font-black text-amber-500 mb-2"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              data-testid="stat-total"
            >
              {summary?.totalProjects || 0}
            </motion.div>
            <div className="text-xs text-white/40">Records in system</div>
          </motion.div>

          {summary?.classificationBreakdown.map((c, i) => (
            <motion.div key={c.classification} variants={itemVariants} className="glass p-6 relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-8 -mt-8"
                style={{ background: CHART_COLORS[c.classification as keyof typeof CHART_COLORS] ?? "#60a5fa", opacity: 0.05 }}
              />
              <div className="text-[10px] mono text-white/30 tracking-[0.2em] uppercase mb-4">
                {c.classification}
              </div>
              <motion.div
                className="text-4xl font-light text-white/80 mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", delay: 0.1 + i * 0.07 }}
                data-testid={`stat-${c.classification.toLowerCase()}`}
              >
                {c.count}
              </motion.div>
              <div className="h-1 bg-white/5 rounded-full mt-3">
                <motion.div
                  className="h-1 rounded-full"
                  style={{ background: CHART_COLORS[c.classification as keyof typeof CHART_COLORS] ?? "#60a5fa", opacity: 0.5 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.count / (summary?.totalProjects || 1)) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                />
              </div>
              <div className="text-xs text-white/30 mt-1">
                {Math.round((c.count / (summary?.totalProjects || 1)) * 100)}%
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
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
                      <span className="text-[9px] mono text-white/30 group-hover:text-amber-500 transition-colors">VIEW →</span>
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
            {summary && <ClassificationPieChart summary={summary} />}
          </motion.div>
        </div>

        {allProjects && allProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <TechStackChart projects={allProjects} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <DomainRadarChart projects={allProjects} />
            </motion.div>
          </div>
        )}

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
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
