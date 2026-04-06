import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useListProjects } from "@workspace/api-client-react";
import type { Project } from "@workspace/api-client-react";
import { ClassificationBadge } from "@/components/ui/classification-badge";

function ProjectSelect({ 
  value, 
  onChange, 
  projects,
  label
}: { 
  value: number | null; 
  onChange: (id: number | null) => void;
  projects: Project[];
  label: string;
}) {
  return (
    <div className="glass p-4 mb-4">
      <label className="block text-[9px] mono text-white/40 tracking-[0.2em] uppercase mb-2">
        {label}
      </label>
      <select 
        className="w-full bg-black/50 border border-white/10 text-white/80 p-2 text-sm outline-none focus:border-amber-500/50 transition-colors appearance-none mono"
        value={value || ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        data-testid={`select-project-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <option value="">-- SELECT DOSSIER --</option>
        {projects.map(p => (
          <option key={p.id} value={p.id}>{p.title}</option>
        ))}
      </select>
    </div>
  );
}

function ProjectCard({ project }: { project: Project | undefined }) {
  if (!project) {
    return (
      <div className="h-[600px] border border-dashed border-white/10 flex items-center justify-center bg-white/5">
        <span className="text-[10px] mono text-white/20 tracking-[0.2em] uppercase">NO DATA LOADED</span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-6 h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-4">
        <ClassificationBadge classification={project.classification} />
        {project.year && <span className="text-[10px] mono text-white/30 ml-auto">{project.year}</span>}
      </div>
      
      <h2 className="text-xl font-bold text-white/90 mb-4">{project.title}</h2>
      
      <div className="space-y-4 flex-1">
        <div>
          <div className="text-[9px] mono text-amber-500/50 tracking-[0.2em] uppercase mb-1">STATUS</div>
          <div className="text-sm text-white/70 mono">{project.status}</div>
        </div>
        
        <div>
          <div className="text-[9px] mono text-amber-500/50 tracking-[0.2em] uppercase mb-1">SUMMARY</div>
          <p className="text-sm text-white/60 leading-relaxed">{project.summary}</p>
        </div>
        
        <div>
          <div className="text-[9px] mono text-amber-500/50 tracking-[0.2em] uppercase mb-2">TECH STACK</div>
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <span key={tech} className="text-[10px] mono px-2 py-0.5 bg-white/5 border border-white/10 text-white/50">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <Link href={`/projects/${project.slug}`}>
        <button className="w-full mt-8 py-3 border border-amber-500/30 text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-500 text-[10px] mono tracking-[0.2em] uppercase transition-colors">
          OPEN DOSSIER
        </button>
      </Link>
    </motion.div>
  );
}

export function ComparePage() {
  const { data: projects = [], isLoading } = useListProjects();
  const [leftId, setLeftId] = useState<number | null>(null);
  const [rightId, setRightId] = useState<number | null>(null);

  const leftProject = useMemo(() => projects.find(p => p.id === leftId), [projects, leftId]);
  const rightProject = useMemo(() => projects.find(p => p.id === rightId), [projects, rightId]);

  return (
    <div className="min-h-screen pt-20 pb-24" data-testid="compare-page">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] mono text-blue-500/60 tracking-[0.3em] uppercase">
              ANALYSIS PROTOCOL
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white/90 mb-4">
            COMPARE
          </h1>
          <div className="section-line mb-6 max-w-xl" />
          <p className="text-base text-white/55 leading-relaxed max-w-2xl font-light">
            Cross-reference intelligence files to analyze architectural decisions and outcomes.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ProjectSelect 
                label="SUBJECT ALPHA"
                value={leftId} 
                onChange={setLeftId} 
                projects={projects} 
              />
              <ProjectCard project={leftProject} />
            </div>
            
            <div>
              <ProjectSelect 
                label="SUBJECT BETA"
                value={rightId} 
                onChange={setRightId} 
                projects={projects} 
              />
              <ProjectCard project={rightProject} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
