import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, vaultNotesTable } from "@workspace/db";
import {
  ListVaultNotesResponse,
  GetVaultNoteResponse,
  UpsertVaultNoteBody,
  UpsertVaultNoteResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

router.get("/vault/notes", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const notes = await db.select().from(vaultNotesTable).orderBy(vaultNotesTable.projectId);
  res.json(ListVaultNotesResponse.parse(notes));
});

router.get("/vault/notes/:projectId", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rawId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
  const projectId = parseInt(rawId, 10);
  if (isNaN(projectId)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const [note] = await db
    .select()
    .from(vaultNotesTable)
    .where(eq(vaultNotesTable.projectId, projectId));

  if (!note) {
    res.status(404).json({ error: "Vault note not found" });
    return;
  }

  res.json(GetVaultNoteResponse.parse(note));
});

router.put("/vault/notes/:projectId", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rawId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
  const projectId = parseInt(rawId, 10);
  if (isNaN(projectId)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const parsed = UpsertVaultNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [note] = await db
    .insert(vaultNotesTable)
    .values({ projectId, content: parsed.data.content })
    .onConflictDoUpdate({
      target: vaultNotesTable.projectId,
      set: { content: parsed.data.content, updatedAt: new Date() },
    })
    .returning();

  res.json(UpsertVaultNoteResponse.parse(note));
});

router.delete("/vault/notes/:projectId", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const rawId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
  const projectId = parseInt(rawId, 10);
  if (isNaN(projectId)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const [deleted] = await db
    .delete(vaultNotesTable)
    .where(eq(vaultNotesTable.projectId, projectId))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Vault note not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
