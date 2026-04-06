import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, operatorConversationsTable } from "@workspace/db";
import { randomUUID } from "crypto";
import {
  OperatorChatBody,
  OperatorChatResponse,
  ListOperatorConversationsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/operator/chat", async (req: Request, res: Response): Promise<void> => {
  const parsed = OperatorChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, conversationId: incomingId } = parsed.data;
  const conversationId = incomingId ?? randomUUID();

  try {
    await db.insert(operatorConversationsTable).values({
      conversationId,
      role: "user",
      message,
      citations: [],
    });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to persist user message");
  }

  const stubMessage =
    `NEXUS-7 OPERATIONAL — Received: "${message}". ` +
    `AI operator is initializing. Full capability coming online shortly.`;

  try {
    await db.insert(operatorConversationsTable).values({
      conversationId,
      role: "assistant",
      message: stubMessage,
      citations: [],
    });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to persist assistant message");
  }

  res.json(
    OperatorChatResponse.parse({
      message: stubMessage,
      conversationId,
      citations: [],
    }),
  );
});

router.get("/operator/conversations", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const conversations = await db
    .select()
    .from(operatorConversationsTable)
    .orderBy(operatorConversationsTable.createdAt);

  res.json(ListOperatorConversationsResponse.parse(conversations));
});

export default router;
