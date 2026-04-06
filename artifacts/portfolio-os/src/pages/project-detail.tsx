import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { useProject } from "@/hooks/use-projects";
import { ClassificationBadge } from "@/components/ui/classification-badge";
import { StatusBadge } from "@/components/ui/status-badge";

export function ProjectDetailPage() {
  const [, params] = useRoute("/projects/:slug");
  const slug = params?.slug ?? "";
  const { data: project, isLoading } = useProject(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-[10px] mono text-amber-500/50 tracking-[0.3em] uppercase">
            DECRYPTING FILE
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-[10px] mono text-white/20 tracking-[0.3em] uppercase mb-4">
            FILE NOT FOUND
          </div>
          <Link href="/">
            <button className="text-[10px] mono text-amber-500/50 hover:text-amber-500 tracking-[0.2em] uppercase">
              ← RETURN TO DOSSIERS
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <Link href="/">
              <button className="flex items-center gap-2 text-[9px] mono text-white/30 hover:text-amber-500 tracking-[0.2em] uppercase transition-colors mb-8">
                <span>←</span> DOSSIER ARCHIVE
              </button>
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <ClassificationBadge classification={project.classification} />
              <StatusBadge status={project.status} />
              {project.year && (
                <span className="text-[10px] mono text-white/25">{project.year}</span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white/90 mb-4">
              {project.title}
            </h1>

            <div className="section-line mb-6" />

            <p className="text-base text-white/55 leading-relaxed max-w-2xl">
              {project.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass p-5 md:col-span-2">
              <div className="text-[10px] mono text-white/25 tracking-[0.2em] uppercase mb-4">
                TECH STACK
              </div>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] mono px-3 py-1 bg-white/5 border border-white/8 text-white/50 rounded-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass p-5">
              <div className="text-[10px] mono text-white/25 tracking-[0.2em] uppercase mb-4">
                DOMAINS
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Link key={tag.id} href={`/?tag=${tag.slug}`}>
                    <span className="text-[9px] mono tracking-[0.1em] uppercase px-2 py-0.5 text-blue-400/60 border border-blue-500/20 rounded-sm cursor-pointer hover:text-blue-400 hover:border-blue-500/40 transition-colors">
                      {tag.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {project.sections.length > 0 && (
            <div className="space-y-8 mb-12">
              <div className="text-[10px] mono text-white/25 tracking-[0.2em] uppercase flex items-center gap-4">
                <span>OPERATION FILE</span>
                <div className="section-line flex-1" />
              </div>

              {project.sections.map((section, i) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="glass p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 bg-amber-500/50" />
                    <div>
                      <div className="text-[9px] mono text-amber-500/50 tracking-[0.2em] uppercase mb-0.5">
                        {section.type.replace(/_/g, " ")}
                      </div>
                      <h3 className="text-base font-semibold text-white/85">
                        {section.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-white/55 leading-relaxed pl-4">
                    {section.content}
                  </p>
                </motion.div>
              ))}
            </div>
          )}

          {project.relatedProjects.length > 0 && (
            <div>
              <div className="text-[10px] mono text-white/25 tracking-[0.2em] uppercase flex items-center gap-4 mb-6">
                <span>RELATED OPERATIONS</span>
                <div className="section-line flex-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {project.relatedProjects.map((related) => (
                  <Link key={related.id} href={`/projects/${related.slug}`}>
                    <div className="glass glass-hover p-4 cursor-pointer">
                      <ClassificationBadge classification={related.classification} className="mb-2" />
                      <h4 className="text-sm font-semibold text-white/75 hover:text-amber-400 transition-colors mt-2">
                        {related.title}
                      </h4>
                      <p className="text-xs text-white/35 mt-1 line-clamp-2">{related.summary}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
