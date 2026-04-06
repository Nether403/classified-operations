import { useRoute, Link, useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { useListProjects, useGetProject, getGetProjectQueryKey } from "@workspace/api-client-react";
import type { MediaAsset } from "@workspace/api-client-react";
import { ClassificationBadge } from "@/components/ui/classification-badge";
import { StatusBadge } from "@/components/ui/status-badge";

export function ProjectDetailPage() {
  const [, params] = useRoute("/projects/:slug");
  const [, setLocation] = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const slug = params?.slug ?? "";

  const { data: projects } = useListProjects();
  const projectId = projects?.find((p) => p.slug === slug)?.id;

  const { data: project, isLoading } = useGetProject(projectId as number, { 
    query: { 
      enabled: !!projectId,
      queryKey: getGetProjectQueryKey(projectId as number)
    } 
  });

  if (isLoading || (!projectId && !projects)) {
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

  if (!project && projects) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-[10px] mono text-white/20 tracking-[0.3em] uppercase mb-4">
            FILE NOT FOUND
          </div>
          <Link href="/">
            <button className="text-[10px] mono text-amber-500/50 hover:text-amber-500 tracking-[0.2em] uppercase transition-colors">
              ← RETURN TO DOSSIERS
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen pt-20" data-testid="project-detail-page">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <Link href="/">
              <button className="flex items-center gap-2 text-[9px] mono text-white/30 hover:text-amber-500 tracking-[0.2em] uppercase transition-colors mb-8 group" data-testid="btn-back">
                <span className="group-hover:-translate-x-1 transition-transform">←</span> DOSSIER ARCHIVE
              </button>
            </Link>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <ClassificationBadge classification={project.classification} />
                <StatusBadge status={project.status} />
                {project.year && (
                  <span className="text-[10px] mono text-white/25">{project.year}</span>
                )}
              </div>
              <button
                onClick={() => setLocation(`/compare?a=${project.id}`)}
                className="text-[9px] mono text-blue-400/60 border border-blue-500/20 px-3 py-1.5 hover:text-blue-400 hover:border-blue-500/40 transition-colors tracking-widest uppercase"
                data-testid="btn-compare"
              >
                COMPARE
              </button>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white/90 mb-4">
              {project.title}
            </h1>

            <div className="section-line mb-6" />

            <p className="text-base text-white/55 leading-relaxed max-w-2xl font-light">
              {project.summary}
            </p>
          </div>

          {project.coverImageUrl && (
            <motion.div 
              className="mb-12 border border-white/10 p-2 glass rounded-md overflow-hidden"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <img src={project.coverImageUrl} alt={project.title} className="w-full h-auto aspect-video object-cover opacity-80 mix-blend-screen grayscale" />
            </motion.div>
          )}

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

          {project.sections && project.sections.length > 0 && (
            <div className="space-y-8 mb-12">
              <div className="text-[10px] mono text-white/25 tracking-[0.2em] uppercase flex items-center gap-4">
                <span>OPERATION FILE</span>
                <div className="section-line flex-1" />
              </div>

              {project.sections.sort((a,b) => a.sortOrder - b.sortOrder).map((section, i) => (
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
                  <div className="text-sm text-white/55 leading-relaxed pl-4 prose prose-invert max-w-none prose-p:mb-4">
                    {section.content.split('\n\n').map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {project.media && project.media.length > 0 && (
            <div className="mb-12">
              <div className="text-[10px] mono text-white/25 tracking-[0.2em] uppercase flex items-center gap-4 mb-6">
                <span>MEDIA ARCHIVE</span>
                <div className="section-line flex-1" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="media-section">
                {(project.media as MediaAsset[]).map((asset, i) => (
                  <motion.div
                    key={asset.id}
                    initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
                    animate={shouldReduceMotion ? false : { opacity: 1, scale: 1 }}
                    transition={{ delay: shouldReduceMotion ? 0 : i * 0.05 }}
                    className="glass p-3"
                    data-testid={`media-asset-${asset.id}`}
                  >
                    {asset.type === "image" && asset.url && (
                      <img
                        src={asset.url}
                        alt={asset.altText || asset.caption || "Media asset"}
                        className="w-full h-48 object-cover opacity-75 mix-blend-screen grayscale mb-3"
                      />
                    )}
                    {asset.type === "video" && asset.url && (
                      <video
                        src={asset.url}
                        controls
                        className="w-full h-48 object-cover opacity-80 mb-3"
                      />
                    )}
                    <div className="px-1">
                      <div className="text-[9px] mono text-white/25 tracking-[0.2em] uppercase mb-1">{asset.type}</div>
                      {asset.altText && (
                        <div className="text-xs font-medium text-white/65">{asset.altText}</div>
                      )}
                      {asset.caption && (
                        <p className="text-xs text-white/35 mt-1 leading-relaxed">{asset.caption}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {project.relatedProjects && project.relatedProjects.length > 0 && (
            <div>
              <div className="text-[10px] mono text-white/25 tracking-[0.2em] uppercase flex items-center gap-4 mb-6">
                <span>RELATED OPERATIONS</span>
                <div className="section-line flex-1" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {project.relatedProjects.map((related) => (
                  <Link key={related.id} href={`/projects/${related.slug}`}>
                    <div className="glass glass-hover p-4 cursor-pointer h-full group">
                      <ClassificationBadge classification={related.classification} />
                      <h4 className="text-sm font-semibold text-white/75 group-hover:text-amber-400 transition-colors mt-4">
                        {related.title}
                      </h4>
                      <p className="text-xs text-white/35 mt-2 line-clamp-2 leading-relaxed">{related.summary}</p>
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
