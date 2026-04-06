import { Router, type IRouter, type Request, type Response } from "express";
import { eq, inArray, and, isNull } from "drizzle-orm";
import {
  db,
  operatorConversationsTable,
  projectsTable,
  projectSectionsTable,
  tagsTable,
  projectTagsTable,
} from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { isAdmin } from "../middlewares/requireAdmin";
import { randomUUID } from "crypto";
import {
  OperatorChatBody,
  ListOperatorConversationsResponseItem,
} from "@workspace/api-zod";

const router: IRouter = Router();

interface ProjectCitation {
  projectId: number;
  title: string;
  slug: string;
}

interface TourStop {
  projectId: number;
  title: string;
  slug: string;
  rationale: string;
}

interface OperatorJsonResponse {
  message: string;
  citations: ProjectCitation[];
  tour?: TourStop[];
}

async function buildProjectCorpus(adminAccess: boolean): Promise<string> {
  const query = db.select().from(projectsTable).orderBy(projectsTable.id);
  const projects = adminAccess
    ? await query
    : await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.isPublic, true))
        .orderBy(projectsTable.id);

  const projectIds = projects.map((p) => p.id);
  if (projectIds.length === 0) return "No projects on file.";

  const [sections, projectTagRows] = await Promise.all([
    db
      .select()
      .from(projectSectionsTable)
      .where(inArray(projectSectionsTable.projectId, projectIds))
      .orderBy(projectSectionsTable.sortOrder),
    db
      .select({ projectId: projectTagsTable.projectId, tagId: projectTagsTable.tagId })
      .from(projectTagsTable)
      .where(inArray(projectTagsTable.projectId, projectIds)),
  ]);

  const tagIds = [...new Set(projectTagRows.map((r) => r.tagId))];
  const tags = tagIds.length > 0
    ? await db.select().from(tagsTable).where(inArray(tagsTable.id, tagIds))
    : [];

  const tagById = new Map(tags.map((t) => [t.id, t]));
  type SectionRow = (typeof sections)[number];
  const sectionsByProjectId = new Map<number, SectionRow[]>();
  const tagsByProjectId = new Map<number, string[]>();

  for (const s of sections) {
    if (!sectionsByProjectId.has(s.projectId)) sectionsByProjectId.set(s.projectId, []);
    sectionsByProjectId.get(s.projectId)!.push(s);
  }

  for (const r of projectTagRows) {
    if (!tagsByProjectId.has(r.projectId)) tagsByProjectId.set(r.projectId, []);
    const tag = tagById.get(r.tagId);
    if (tag) tagsByProjectId.get(r.projectId)!.push(tag.name);
  }

  const corpusParts: string[] = [];

  for (const project of projects) {
    const projectSections = sectionsByProjectId.get(project.id) ?? [];
    const projectTags = tagsByProjectId.get(project.id) ?? [];

    const parts = [
      `=== PROJECT: ${project.title} (ID: ${project.id}, slug: ${project.slug}) ===`,
      `Classification: ${project.classification}`,
      `Status: ${project.status}`,
      project.year ? `Year: ${project.year}` : null,
      `Summary: ${project.summary}`,
      project.techStack.length > 0 ? `Tech Stack: ${project.techStack.join(", ")}` : null,
      projectTags.length > 0 ? `Domains/Tags: ${projectTags.join(", ")}` : null,
    ].filter(Boolean);

    for (const section of projectSections) {
      parts.push(`\n[${section.title.toUpperCase()}]\n${section.content}`);
    }

    corpusParts.push(parts.join("\n"));
  }

  return corpusParts.join("\n\n---\n\n");
}

function buildSystemPrompt(corpus: string): string {
  return `You are NEXUS-7, an intelligence operator for a portfolio system. Your role is to answer questions about the projects in this portfolio — compare them, recommend viewing sequences, explain technical decisions, and generate guided tours.

STRICT RULES:
1. Answer ONLY from the project data provided below. Never invent facts, technologies, outcomes, or details not in the corpus.
2. Do not use emojis in any response.
3. Always cite which projects you reference by including them in the citations array.
4. When the user asks to compare projects, return a structured side-by-side analysis.
5. When the user asks for a tour or recommendation sequence (e.g. "show me the most technically ambitious work", "show me AI projects", "what should I view first"), return a tour array with ordered project IDs and rationale.
6. Respond in a terse, technical, mission-intelligence style. Precise. No filler.
7. Keep responses focused and concise. No more than 3-4 paragraphs of prose unless the user asks for detail.

RESPONSE FORMAT:
You must ALWAYS respond with valid JSON matching this exact structure:
{
  "message": "your prose response here",
  "citations": [{"projectId": <number>, "title": "<title>", "slug": "<slug>"}],
  "tour": [{"projectId": <number>, "title": "<title>", "slug": "<slug>", "rationale": "<one sentence>"}]
}

The "tour" array is OPTIONAL — only include it when the user asks for a tour, sequence, recommendation, or "show me X" type requests.
The "citations" array is REQUIRED — always include every project you reference in your answer.
If no projects are referenced, citations must be an empty array [].

PROJECT CORPUS:
${corpus}`;
}

router.post("/operator/chat", async (req: Request, res: Response): Promise<void> => {
  const parsed = OperatorChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, conversationId: incomingId } = parsed.data;
  const conversationId = incomingId ?? randomUUID();
  const userId = req.isAuthenticated() ? req.user?.id : null;
  const adminAccess = isAdmin(req);

  // Fetch conversation history BEFORE inserting the new user message to avoid duplication
  const existingHistory = incomingId
    ? await db
        .select()
        .from(operatorConversationsTable)
        .where(
          and(
            eq(operatorConversationsTable.conversationId, conversationId),
            userId
              ? eq(operatorConversationsTable.userId, userId)
              : isNull(operatorConversationsTable.userId),
          ),
        )
        .orderBy(operatorConversationsTable.createdAt)
        .limit(18)
    : [];

  try {
    await db.insert(operatorConversationsTable).values({
      conversationId,
      userId: userId ?? null,
      role: "user",
      message,
      citations: [],
    });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to persist user message");
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  let corpus = "";
  try {
    corpus = await buildProjectCorpus(adminAccess);
  } catch (err) {
    req.log?.error?.({ err }, "Failed to build project corpus");
    res.write(`data: ${JSON.stringify({ error: "Failed to load portfolio data" })}\n\n`);
    res.end();
    return;
  }

  const chatHistory = existingHistory
    .filter((h) => h.role === "user" || h.role === "assistant")
    .map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.message,
    }));

  const systemPrompt = buildSystemPrompt(corpus);

  let fullResponse = "";

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        ...chatHistory,
        { role: "user", content: message },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
  } catch (err) {
    req.log?.error?.({ err }, "OpenAI streaming failed");
    res.write(`data: ${JSON.stringify({ error: "AI operator connection lost" })}\n\n`);
    res.end();
    return;
  }

  // Parse structured JSON from AI response
  let parsedResponse: OperatorJsonResponse = { message: fullResponse, citations: [] };
  try {
    const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const rawJson = JSON.parse(jsonMatch[0]) as OperatorJsonResponse;
      parsedResponse = {
        message: typeof rawJson.message === "string" && rawJson.message ? rawJson.message : fullResponse,
        citations: Array.isArray(rawJson.citations)
          ? rawJson.citations.filter(
              (c) => typeof c.projectId === "number" && typeof c.title === "string" && typeof c.slug === "string",
            )
          : [],
        tour: Array.isArray(rawJson.tour)
          ? rawJson.tour.filter(
              (s) =>
                typeof s.projectId === "number" &&
                typeof s.title === "string" &&
                typeof s.slug === "string" &&
                typeof s.rationale === "string",
            )
          : undefined,
      };
    }
  } catch {
    parsedResponse = { message: fullResponse, citations: [] };
  }

  try {
    await db.insert(operatorConversationsTable).values({
      conversationId,
      userId: userId ?? null,
      role: "assistant",
      message: parsedResponse.message,
      citations: parsedResponse.citations,
    });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to persist assistant message");
  }

  res.write(
    `data: ${JSON.stringify({
      done: true,
      conversationId,
      citations: parsedResponse.citations,
      tour: parsedResponse.tour,
    })}\n\n`,
  );
  res.end();
});

router.get("/operator/conversations", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user?.id;
  const conversations = await db
    .select()
    .from(operatorConversationsTable)
    .where(eq(operatorConversationsTable.userId, userId!))
    .orderBy(operatorConversationsTable.createdAt);

  res.json(conversations.map((c) => ListOperatorConversationsResponseItem.parse(c)));
});

export default router;
