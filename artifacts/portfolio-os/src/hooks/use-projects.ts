import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Tag {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  createdAt: string;
}

export interface Project {
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
  tags: Tag[];
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSection {
  id: number;
  projectId: number;
  type: string;
  title: string;
  content: string;
  sortOrder: number;
  createdAt: string;
}

export interface ProjectDetail extends Project {
  sections: ProjectSection[];
  media: unknown[];
  relatedProjects: Project[];
}

export function useProjects(params?: { tag?: string; search?: string; classification?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.tag) searchParams.set("tag", params.tag);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.classification) searchParams.set("classification", params.classification);
  const qs = searchParams.toString();

  return useQuery<Project[]>({
    queryKey: ["projects", params],
    queryFn: () => apiFetch<Project[]>(`/projects${qs ? `?${qs}` : ""}`),
    staleTime: 30_000,
  });
}

export function useProject(slug: string) {
  const { data: projects } = useProjects();
  const project = projects?.find((p) => p.slug === slug);
  const id = project?.id;

  return useQuery<ProjectDetail>({
    queryKey: ["project", slug, id],
    queryFn: () => apiFetch<ProjectDetail>(`/projects/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: () => apiFetch<Tag[]>("/tags"),
    staleTime: 300_000,
  });
}
