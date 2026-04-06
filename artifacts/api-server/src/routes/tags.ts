import { Router, type IRouter, type Request, type Response } from "express";
import { db, tagsTable } from "@workspace/db";
import { ListTagsResponse, CreateTagBody, ListTagsResponseItem } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

router.get("/tags", async (_req: Request, res: Response): Promise<void> => {
  const tags = await db.select().from(tagsTable).orderBy(tagsTable.name);
  res.json(ListTagsResponse.parse(tags));
});

router.post("/tags", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateTagBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [tag] = await db.insert(tagsTable).values(parsed.data).returning();
  res.status(201).json(ListTagsResponseItem.parse(tag));
});

export default router;
