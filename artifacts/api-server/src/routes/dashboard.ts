import { Router, type IRouter, type Request, type Response } from "express";
import { eq, sql, desc } from "drizzle-orm";
import {
  db,
  projectsTable,
  tagsTable,
  projectTagsTable,
} from "@workspace/db";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";

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

router.get("/dashboard/summary", async (req: Request, res: Response): Promise<void> => {
  const allProjects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.isPublic, true))
    .orderBy(desc(projectsTable.createdAt));

  const totalProjects = allProjects.length;

  const featuredIds = allProjects.filter((p) => p.isFeatured).slice(0, 4).map((p) => p.id);
  const recentIds = allProjects.slice(0, 6).map((p) => p.id);

  const featuredProjects = (
    await Promise.all(featuredIds.map((id) => getProjectWithTags(id)))
  ).filter((p): p is NonNullable<typeof p> => p !== null);

  const recentProjects = (
    await Promise.all(recentIds.map((id) => getProjectWithTags(id)))
  ).filter((p): p is NonNullable<typeof p> => p !== null);

  const tagCountRows = await db
    .select({
      tagId: projectTagsTable.tagId,
      count: sql<number>`count(*)::int`,
    })
    .from(projectTagsTable)
    .innerJoin(projectsTable, eq(projectTagsTable.projectId, projectsTable.id))
    .where(eq(projectsTable.isPublic, true))
    .groupBy(projectTagsTable.tagId)
    .orderBy(desc(sql`count(*)`))
    .limit(20);

  const tagCloud = await Promise.all(
    tagCountRows.map(async (row) => {
      const [tag] = await db
        .select()
        .from(tagsTable)
        .where(eq(tagsTable.id, row.tagId));
      return tag ? { tag, count: row.count } : null;
    }),
  );

  const classBreakdown: Record<string, number> = {};
  for (const p of allProjects) {
    classBreakdown[p.classification] = (classBreakdown[p.classification] ?? 0) + 1;
  }

  const classificationBreakdown = Object.entries(classBreakdown).map(
    ([classification, count]) => ({ classification, count }),
  );

  res.json(
    GetDashboardSummaryResponse.parse({
      totalProjects,
      featuredProjects,
      recentProjects,
      tagCloud: tagCloud.filter((t): t is NonNullable<typeof t> => t !== null),
      classificationBreakdown,
    }),
  );
});

export default router;
