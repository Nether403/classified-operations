import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, projectsTable, tagsTable, projectTagsTable } from "@workspace/db";
import { AdminListProjectsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

function isAdmin(req: Request): boolean {
  if (!req.isAuthenticated()) return false;
  const adminUserId = process.env.ADMIN_USER_ID;
  if (adminUserId && req.user?.id !== adminUserId) return false;
  return true;
}

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
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
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
