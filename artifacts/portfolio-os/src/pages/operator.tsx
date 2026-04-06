import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API_BASE = `${BASE}/api`;

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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  citations?: ProjectCitation[];
  tour?: TourStop[];
  timestamp: Date;
  error?: boolean;
}

function CitationChip({ citation }: { citation: ProjectCitation }) {
  return (
    <Link href={`/projects/${citation.slug}`}>
      <span
        className="inline-flex items-center gap-1.5 text-[9px] mono px-2.5 py-1 border border-blue-500/25 text-blue-400/70 hover:text-blue-400 hover:border-blue-500/50 transition-colors cursor-pointer"
        data-testid={`citation-${citation.projectId}`}
      >
        <span className="w-1 h-1 rounded-full bg-blue-400/60" />
        {citation.title}
      </span>
    </Link>
  );
}

function TourSequence({ tour }: { tour: TourStop[] }) {
  return (
    <div className="mt-4 border border-amber-500/15 bg-amber-500/5" data-testid="tour-sequence">
      <div className="text-[9px] mono text-amber-500/60 tracking-[0.2em] uppercase px-4 py-2.5 border-b border-amber-500/10">
        GUIDED TOUR — {tour.length} STOPS
      </div>
      <div className="divide-y divide-white/5">
        {tour.map((stop, i) => (
          <Link key={stop.projectId} href={`/projects/${stop.slug}`}>
            <div
              className="px-4 py-3 flex gap-4 items-start hover:bg-white/3 transition-colors cursor-pointer group"
              data-testid={`tour-stop-${stop.projectId}`}
            >
              <div className="text-[9px] mono text-amber-500/30 shrink-0 w-4 mt-0.5 group-hover:text-amber-500 transition-colors">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white/80 mb-1 group-hover:text-amber-400 transition-colors">{stop.title}</div>
                <p className="text-[11px] text-white/40 leading-relaxed">{stop.rationale}</p>
              </div>
              <span className="text-white/20 group-hover:text-amber-500/60 transition-colors text-xs shrink-0 mt-0.5">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function OperatorMessage({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}
      data-testid={`message-${msg.id}`}
    >
      <div
        className={`w-7 h-7 rounded-sm flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-amber-500/20 border border-amber-500/30"
            : msg.error
              ? "bg-red-500/20 border border-red-500/30"
              : "bg-blue-500/20 border border-blue-500/30"
        }`}
      >
        <span
          className={`text-[9px] mono ${
            isUser ? "text-amber-500" : msg.error ? "text-red-400" : "text-blue-400"
          }`}
        >
          {isUser ? "YOU" : "AI"}
        </span>
      </div>

      <div className={`max-w-2xl ${isUser ? "items-end" : ""} flex flex-col gap-2 flex-1`}>
        <div
          className={`text-[9px] mono tracking-[0.15em] uppercase ${
            isUser ? "text-amber-500/50 text-right" : msg.error ? "text-red-400/50" : "text-blue-400/50"
          }`}
        >
          {isUser ? "OPERATOR INPUT" : "NEXUS-7 RESPONSE"}
          <span className="text-white/20 ml-2">{msg.timestamp.toLocaleTimeString()}</span>
        </div>

        <div
          className={`glass p-4 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "text-white/70 border-amber-500/10"
              : msg.error
                ? "text-red-400/80 border-red-500/15"
                : "text-white/80 border-blue-500/10"
          }`}
        >
          {msg.content}
          {msg.streaming && (
            <span className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 animate-pulse align-text-bottom" />
          )}
        </div>

        {!isUser && msg.citations && msg.citations.length > 0 && !msg.streaming && (
          <div className="flex flex-wrap gap-2" data-testid="citations-section">
            {msg.citations.map((c) => (
              <CitationChip key={c.projectId} citation={c} />
            ))}
          </div>
        )}

        {!isUser && msg.tour && msg.tour.length > 0 && !msg.streaming && (
          <TourSequence tour={msg.tour} />
        )}
      </div>
    </motion.div>
  );
}

const SUGGESTED_QUERIES = [
  "Show me the most technically ambitious projects",
  "What work is relevant to AI or machine learning?",
  "Compare the most recent two projects",
  "Give me a tour of the most visually ambitious work",
  "What projects demonstrate distributed systems expertise?",
];

export function OperatorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content:
        "NEXUS-7 OPERATOR ONLINE. Portfolio intelligence interface active. Ask me about any project, technical decisions, outcomes, or engineering philosophy. I can compare projects, recommend viewing sequences, and generate guided tours. What do you want to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const messageText = text ?? input.trim();
      if (!messageText || loading) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: messageText,
        timestamp: new Date(),
      };

      const assistantMsgId = crypto.randomUUID();
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        streaming: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch(`${API_BASE}/operator/chat`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText, conversationId }),
        });

        if (!res.ok || !res.body) {
          throw new Error("Connection failed");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            try {
              const event = JSON.parse(raw) as {
                content?: string;
                done?: boolean;
                conversationId?: string;
                citations?: ProjectCitation[];
                tour?: TourStop[];
                error?: string;
              };

              if (event.error) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: event.error!, streaming: false, error: true }
                      : m,
                  ),
                );
                return;
              }

              if (event.content) {
                accumulated += event.content;

                let displayText = accumulated;
                try {
                  const jsonStart = accumulated.indexOf("{");
                  if (jsonStart !== -1) {
                    const parsed = JSON.parse(accumulated.slice(jsonStart)) as { message?: string };
                    if (parsed.message) displayText = parsed.message;
                  }
                } catch {
                  displayText = accumulated.replace(/^\s*\{[\s\S]*$/, "").trim() || accumulated;
                }

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: displayText, streaming: true } : m,
                  ),
                );
              }

              if (event.done) {
                let finalText = accumulated;
                let citations: ProjectCitation[] = event.citations ?? [];
                let tour: TourStop[] | undefined = event.tour;

                try {
                  const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
                  if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]) as {
                      message?: string;
                      citations?: ProjectCitation[];
                      tour?: TourStop[];
                    };
                    if (parsed.message) finalText = parsed.message;
                    if (Array.isArray(parsed.citations)) citations = parsed.citations;
                    if (Array.isArray(parsed.tour)) tour = parsed.tour;
                  }
                } catch {
                  finalText = accumulated;
                }

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: finalText, streaming: false, citations, tour }
                      : m,
                  ),
                );
              }
            } catch {
              // ignore parse errors on individual chunks
            }
          }
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: "SIGNAL LOST — operator connection interrupted. Please try again.",
                  streaming: false,
                  error: true,
                }
              : m,
          ),
        );
      } finally {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [input, loading, conversationId],
  );

  return (
    <div className="min-h-screen pt-14 flex flex-col" data-testid="operator-page">
      <div className="border-b border-white/5 px-6 py-4 glass sticky top-14 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] mono text-blue-400/70 tracking-[0.3em] uppercase">
                NEXUS-7 ONLINE
              </span>
            </div>
            <h1 className="text-xl font-black text-white/90 tracking-tight">AI OPERATOR</h1>
          </div>
          <div className="glass px-4 py-2 flex items-center gap-6">
            <div className="text-right">
              <div className="text-[9px] mono text-white/25 tracking-[0.15em] uppercase">CORPUS</div>
              <div className="text-[9px] mono text-blue-400/60">GROUNDED</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] mono text-white/25 tracking-[0.15em] uppercase">MODEL</div>
              <div className="text-[9px] mono text-amber-500/60">GPT-5.2</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <OperatorMessage key={msg.id} msg={msg} />
            ))}
          </AnimatePresence>

          {loading && !messages.find((m) => m.streaming) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-4"
            >
              <div className="w-7 h-7 rounded-sm flex items-center justify-center shrink-0 bg-blue-500/20 border border-blue-500/30">
                <span className="text-[9px] mono text-blue-400">AI</span>
              </div>
              <div className="glass p-4 flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-blue-400/60 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <span className="text-[9px] mono text-white/30 ml-2">PROCESSING QUERY</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {messages.length === 1 && !loading && (
        <div className="max-w-4xl mx-auto px-6 pb-4 w-full">
          <div className="text-[9px] mono text-white/20 tracking-[0.2em] uppercase mb-3">SUGGESTED QUERIES</div>
          <div className="flex flex-wrap gap-2" data-testid="suggested-queries">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-[10px] mono text-white/35 border border-white/8 px-3 py-1.5 hover:text-white/70 hover:border-white/20 transition-colors text-left"
                data-testid={`suggested-query-${q.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-white/5 glass px-6 py-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 glass border border-white/8 flex items-center px-4">
              <span className="text-amber-500/40 mono text-sm mr-2">›</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Query the operator..."
                disabled={loading}
                className="flex-1 bg-transparent border-0 outline-none text-sm text-white/80 placeholder:text-white/20 py-3 mono"
                data-testid="operator-input"
                autoComplete="off"
              />
            </div>
            <button
              onClick={() => void sendMessage()}
              disabled={loading || !input.trim()}
              className="glass px-6 py-3 text-[10px] mono tracking-[0.2em] uppercase border border-amber-500/20 text-amber-500/60 hover:text-amber-500 hover:border-amber-500/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              data-testid="btn-transmit"
            >
              TRANSMIT
            </button>
          </div>
          <div className="text-[9px] mono text-white/15 tracking-[0.15em] mt-2 pl-1">
            ENTER TO SEND — RESPONSES GROUNDED IN PORTFOLIO CORPUS — NO HALLUCINATIONS
          </div>
        </div>
      </div>
    </div>
  );
}
