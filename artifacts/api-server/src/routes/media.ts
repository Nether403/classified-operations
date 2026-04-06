import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, mediaAssetsTable } from "@workspace/db";
import {
  ListProjectMediaResponse,
  CreateProjectMediaBody,
  ListProjectMediaResponseItem,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

router.get("/projects/:id/media", async (req: Request, res: Response): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const media = await db
    .select()
    .from(mediaAssetsTable)
    .where(eq(mediaAssetsTable.projectId, id))
    .orderBy(mediaAssetsTable.sortOrder);

  res.json(ListProjectMediaResponse.parse(media));
});

router.post("/projects/:id/media", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const parsed = CreateProjectMediaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [asset] = await db
    .insert(mediaAssetsTable)
    .values({ ...parsed.data, projectId: id })
    .returning();

  res.status(201).json(ListProjectMediaResponseItem.parse(asset));
});

export default router;
