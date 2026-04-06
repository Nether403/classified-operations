import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, projectsTable, tagsTable, projectTagsTable } from "@workspace/db";
import { AdminListProjectsResponse } from "@workspace/api-zod";

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

router.get("/admin/projects", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const projects = await db
    .select()
    .from(projectsTable)
    .orderBy(projectsTable.createdAt);

  const projectsWithTags = await Promise.all(
    projects.map((p) => getProjectWithTags(p.id)),
  );
  const valid = projectsWithTags.filter(
    (p): p is NonNullable<typeof p> => p !== null,
  );

  res.json(AdminListProjectsResponse.parse(valid));
});

export default router;
