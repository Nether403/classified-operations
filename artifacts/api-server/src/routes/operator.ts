import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  operatorConversationsTable,
  projectsTable,
  projectSectionsTable,
  tagsTable,
  projectTagsTable,
} from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  OperatorChatBody,
  OperatorChatResponse,
  ListOperatorConversationsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getPortfolioContext(): Promise<string> {
  const projects = await db.select().from(projectsTable);
  const sections = await db.select().from(projectSectionsTable);

  const tagRows = await db
    .select({ projectId: projectTagsTable.projectId, tagName: tagsTable.name })
    .from(projectTagsTable)
    .innerJoin(tagsTable, eq(projectTagsTable.tagId, tagsTable.id));

  const projectTagMap = new Map<number, string[]>();
  for (const row of tagRows) {
    const existing = projectTagMap.get(row.projectId) ?? [];
    existing.push(row.tagName);
    projectTagMap.set(row.projectId, existing);
  }

  const sectionMap = new Map<number, typeof sections>();
  for (const s of sections) {
    const existing = sectionMap.get(s.projectId) ?? [];
    existing.push(s);
    sectionMap.set(s.projectId, existing);
  }

  const lines: string[] = [
    "PORTFOLIO OPERATIONS DOSSIER",
    "============================",
    "",
  ];

  for (const project of projects) {
    const projectSections = (sectionMap.get(project.id) ?? []).sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    const tagNames = projectTagMap.get(project.id) ?? [];

    lines.push(`PROJECT: ${project.title}`);
    lines.push(`Classification: ${project.classification}`);
    lines.push(`Status: ${project.status}`);
    lines.push(`Year: ${project.year ?? "Unknown"}`);
    lines.push(`Summary: ${project.summary}`);
    lines.push(`Tech Stack: ${project.techStack.join(", ")}`);
    lines.push(`Domains: ${tagNames.join(", ")}`);

    for (const section of projectSections) {
      lines.push(`\n[${section.type.toUpperCase()}] ${section.title}:`);
      lines.push(section.content);
    }

    lines.push("\n---\n");
  }

  return lines.join("\n");
}

router.post("/operator/chat", async (req: Request, res: Response): Promise<void> => {
  const parsed = OperatorChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const conversationId = parsed.data.conversationId ?? crypto.randomUUID();

  try {
    const portfolioContext = await getPortfolioContext();

    const systemPrompt = `You are NEXUS-7, an elite AI intelligence operator embedded within a classified engineering portfolio. You speak with authority, precision, and controlled intensity — like a seasoned analyst briefing a senior officer.

Your knowledge is completely grounded in the following portfolio dossier. Answer questions only based on this information. If asked about something not in the dossier, acknowledge the gap professionally.

Never break character. Use measured, professional language. Technical details are your specialty. Keep responses concise — 2-4 focused paragraphs maximum. Lead with the most critical information.

PORTFOLIO DOSSIER:
${portfolioContext}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: parsed.data.message },
      ],
    });

    const responseMessage =
      completion.choices[0]?.message?.content ??
      "Signal interrupted. Unable to process query.";

    await db
      .insert(operatorConversationsTable)
      .values([
        {
          conversationId,
          role: "user",
          message: parsed.data.message,
          citations: [],
        },
        {
          conversationId,
          role: "assistant",
          message: responseMessage,
          citations: [],
        },
      ])
      .catch(() => {});

    res.json(
      OperatorChatResponse.parse({
        message: responseMessage,
        conversationId,
        citations: [],
      }),
    );
  } catch (err) {
    req.log?.error?.({ err }, "Operator chat error");
    res.status(500).json({
      error: "Operator signal lost — unable to process query",
    });
  }
});

router.get(
  "/operator/conversations",
  async (_req: Request, res: Response): Promise<void> => {
    const conversations = await db
      .select()
      .from(operatorConversationsTable)
      .orderBy(operatorConversationsTable.createdAt)
      .limit(100);

    res.json(ListOperatorConversationsResponse.parse(conversations));
  },
);

export default router;
