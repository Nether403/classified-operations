import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Link } from "wouter";
import { useGetDashboardSummary, useListProjects, useListTags } from "@workspace/api-client-react";
import { ClassificationBadge } from "@/components/ui/classification-badge";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export function DashboardPage() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: projects, isLoading: isLoadingProjects } = useListProjects();
  
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

  const tagCloud = summary?.tagCloud || [];
  const classificationBreakdown = summary?.classificationBreakdown || [];
  
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
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white/90 mb-4">
            DASHBOARD
          </h1>
          <div className="section-line mb-6 max-w-xl" />
          <p className="text-base text-white/55 leading-relaxed max-w-2xl font-light">
            System overview and classification metrics. Real-time operation status.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <motion.div variants={itemVariants} className="glass p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="text-[10px] mono text-white/30 tracking-[0.2em] uppercase mb-4">TOTAL DOSSIERS</div>
            <div className="text-5xl font-black text-amber-500 mb-2">{summary?.totalProjects || 0}</div>
            <div className="text-xs text-white/40">Records in system</div>
          </motion.div>
          
          {classificationBreakdown.map((c) => (
            <motion.div key={c.classification} variants={itemVariants} className="glass p-6">
              <div className="text-[10px] mono text-white/30 tracking-[0.2em] uppercase mb-4">
                {c.classification} FILES
              </div>
              <div className="text-4xl font-light text-white/80 mb-2">{c.count}</div>
              <div className="text-xs text-white/40">Clearance level</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="text-[10px] mono text-white/30 tracking-[0.2em] uppercase flex items-center gap-4">
              <span>FEATURED OPERATIONS</span>
              <div className="section-line flex-1" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {summary?.featuredProjects?.map((project) => (
                <Link key={project.id} href={`/projects/${project.slug}`}>
                  <div className="glass glass-hover p-5 cursor-pointer h-full flex flex-col group">
                    <div className="flex justify-between items-start mb-4">
                      <ClassificationBadge classification={project.classification} />
                      <span className="text-[9px] mono text-white/30 group-hover:text-amber-500 transition-colors">VIEW</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white/90 mb-2 group-hover:text-amber-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-white/45 line-clamp-2 mt-auto">
                      {project.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="text-[10px] mono text-white/30 tracking-[0.2em] uppercase flex items-center gap-4">
              <span>DOMAIN EXPERTISE</span>
              <div className="section-line flex-1" />
            </div>
            
            <div className="glass p-6">
              <div className="flex flex-wrap gap-2">
                {tagCloud.map((t) => (
                  <Link key={t.tag.id} href={`/?tag=${t.tag.slug}`}>
                    <div className="flex items-center group cursor-pointer border border-white/5 bg-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors px-3 py-1.5 rounded-sm">
                      <span className="text-[10px] mono text-white/60 group-hover:text-blue-400 uppercase tracking-widest mr-2">
                        {t.tag.name}
                      </span>
                      <span className="text-[9px] mono text-amber-500/50 group-hover:text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-sm">
                        {t.count}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
