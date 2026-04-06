import { Router, type IRouter, type Request, type Response } from "express";
import { eq, inArray, sql, and } from "drizzle-orm";
import {
  db,
  projectsTable,
  projectSectionsTable,
  tagsTable,
  projectTagsTable,
  mediaAssetsTable,
} from "@workspace/db";
import {
  ListProjectsResponse,
  GetProjectResponse,
  CreateProjectBody,
  UpdateProjectBody,
  ListProjectSectionsResponse,
  CreateProjectSectionBody,
  UpdateProjectSectionBody,
  UpdateProjectSectionResponse,
  ListProjectsResponseItem,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getProjectWithTags(projectId: number) {
  const project = await db.query.projectsTable.findFirst({
    where: eq(projectsTable.id, projectId),
  });
  if (!project) return null;

  const tagRows = await db
    .select({ tag: tagsTable })
    .from(projectTagsTable)
    .innerJoin(tagsTable, eq(projectTagsTable.tagId, tagsTable.id))
    .where(eq(projectTagsTable.projectId, projectId));

  return { ...project, tags: tagRows.map((r) => r.tag) };
}

async function getProjectDetail(projectId: number) {
  const project = await getProjectWithTags(projectId);
  if (!project) return null;

  const sections = await db
    .select()
    .from(projectSectionsTable)
    .where(eq(projectSectionsTable.projectId, projectId))
    .orderBy(projectSectionsTable.sortOrder);

  const media = await db
    .select()
    .from(mediaAssetsTable)
    .where(eq(mediaAssetsTable.projectId, projectId))
    .orderBy(mediaAssetsTable.sortOrder);

  const relatedTagIds = project.tags.map((t) => t.id);
  let relatedProjects: Awaited<ReturnType<typeof getProjectWithTags>>[] = [];

  if (relatedTagIds.length > 0) {
    const relatedIds = await db
      .selectDistinct({ projectId: projectTagsTable.projectId })
      .from(projectTagsTable)
      .where(
        and(
          inArray(projectTagsTable.tagId, relatedTagIds),
          sql`${projectTagsTable.projectId} != ${projectId}`,
        ),
      )
      .limit(4);

    const relatedWithTags = await Promise.all(
      relatedIds.map((r) => getProjectWithTags(r.projectId)),
    );
    relatedProjects = relatedWithTags.filter(
      (p): p is NonNullable<typeof p> => p !== null && p.isPublic,
    );
  }

  return {
    ...project,
    sections,
    media,
    relatedProjects: relatedProjects.slice(0, 3),
  };
}

router.get("/projects", async (req: Request, res: Response): Promise<void> => {
  const { tag, search, classification } = req.query;

  let projects = await db.select().from(projectsTable);

  if (!req.isAuthenticated()) {
    projects = projects.filter((p) => p.isPublic);
  }

  if (classification && typeof classification === "string") {
    projects = projects.filter((p) => p.classification === classification);
  }

  if (search && typeof search === "string") {
    const term = search.toLowerCase();
    projects = projects.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.summary.toLowerCase().includes(term),
    );
  }

  const projectsWithTags = await Promise.all(
    projects.map((p) => getProjectWithTags(p.id)),
  );
  let valid = projectsWithTags.filter(
    (p): p is NonNullable<typeof p> => p !== null,
  );

  if (tag && typeof tag === "string") {
    valid = valid.filter((p) =>
      p.tags.some((t) => t.slug === tag || t.name === tag),
    );
  }

  res.json(ListProjectsResponse.parse(valid));
});

router.post("/projects", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { tagIds, ...projectData } = parsed.data;

  const [project] = await db
    .insert(projectsTable)
    .values({
      ...projectData,
      techStack: projectData.techStack ?? [],
      isPublic: projectData.isPublic ?? true,
      isFeatured: projectData.isFeatured ?? false,
    })
    .returning();

  if (tagIds && tagIds.length > 0) {
    await db.insert(projectTagsTable).values(
      tagIds.map((tagId) => ({ projectId: project.id, tagId })),
    );
  }

  const result = await getProjectWithTags(project.id);
  res.status(201).json(ListProjectsResponseItem.parse(result));
});

router.get("/projects/:id", async (req: Request, res: Response): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const project = await getProjectDetail(id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (!project.isPublic && !req.isAuthenticated()) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(GetProjectResponse.parse(project));
});

router.patch("/projects/:id", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { tagIds, ...updateData } = parsed.data;

  const [updated] = await db
    .update(projectsTable)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(projectsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (tagIds !== undefined) {
    await db.delete(projectTagsTable).where(eq(projectTagsTable.projectId, id));
    if (tagIds.length > 0) {
      await db.insert(projectTagsTable).values(
        tagIds.map((tagId) => ({ projectId: id, tagId })),
      );
    }
  }

  const result = await getProjectWithTags(id);
  res.json(ListProjectsResponseItem.parse(result));
});

router.delete("/projects/:id", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const [deleted] = await db
    .delete(projectsTable)
    .where(eq(projectsTable.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/projects/:id/sections", async (req: Request, res: Response): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const sections = await db
    .select()
    .from(projectSectionsTable)
    .where(eq(projectSectionsTable.projectId, id))
    .orderBy(projectSectionsTable.sortOrder);

  res.json(ListProjectSectionsResponse.parse(sections));
});

router.post("/projects/:id/sections", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const parsed = CreateProjectSectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [section] = await db
    .insert(projectSectionsTable)
    .values({ ...parsed.data, projectId: id })
    .returning();

  res.status(201).json(section);
});

router.patch("/projects/:id/sections/:sectionId", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rawSectionId = Array.isArray(req.params.sectionId) ? req.params.sectionId[0] : req.params.sectionId;
  const sectionId = parseInt(rawSectionId, 10);
  if (isNaN(sectionId)) {
    res.status(400).json({ error: "Invalid section id" });
    return;
  }

  const parsed = UpdateProjectSectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [section] = await db
    .update(projectSectionsTable)
    .set(parsed.data)
    .where(eq(projectSectionsTable.id, sectionId))
    .returning();

  if (!section) {
    res.status(404).json({ error: "Section not found" });
    return;
  }

  res.json(UpdateProjectSectionResponse.parse(section));
});

router.delete("/projects/:id/sections/:sectionId", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rawSectionId = Array.isArray(req.params.sectionId) ? req.params.sectionId[0] : req.params.sectionId;
  const sectionId = parseInt(rawSectionId, 10);
  if (isNaN(sectionId)) {
    res.status(400).json({ error: "Invalid section id" });
    return;
  }

  const [deleted] = await db
    .delete(projectSectionsTable)
    .where(eq(projectSectionsTable.id, sectionId))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Section not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
