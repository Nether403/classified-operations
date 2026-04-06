import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function OperatorMessage({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div className={`w-7 h-7 rounded-sm flex items-center justify-center shrink-0 ${
        isUser ? "bg-amber-500/20 border border-amber-500/30" : "bg-blue-500/20 border border-blue-500/30"
      }`}>
        <span className={`text-[9px] mono ${isUser ? "text-amber-500" : "text-blue-400"}`}>
          {isUser ? "YOU" : "AI"}
        </span>
      </div>
      <div className={`max-w-xl ${isUser ? "items-end" : ""} flex flex-col gap-1`}>
        <div className={`text-[9px] mono tracking-[0.15em] uppercase ${
          isUser ? "text-amber-500/50 text-right" : "text-blue-400/50"
        }`}>
          {isUser ? "OPERATOR INPUT" : "AI RESPONSE"}
          <span className="text-white/20 ml-2">
            {msg.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div className={`glass p-4 text-sm leading-relaxed ${
          isUser ? "text-white/70 border-amber-500/10" : "text-white/80 border-blue-500/10"
        }`}>
          {msg.content}
        </div>
      </div>
    </motion.div>
  );
}

export function OperatorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "NEXUS-7 OPERATOR ONLINE. I am your portfolio intelligence interface. Ask me about any project, technical decisions, outcomes, or the engineering philosophy behind the work on file. What do you want to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiFetch<{ message: string; conversationId: string }>("/operator/chat", {
        method: "POST",
        body: JSON.stringify({ message: input.trim(), conversationId }),
      });

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "SIGNAL LOST — operator connection interrupted. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-14 flex flex-col">
      <div className="border-b border-white/5 px-6 py-4 glass">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] mono text-blue-400/70 tracking-[0.3em] uppercase">
                NEXUS-7 ONLINE
              </span>
            </div>
            <h1 className="text-xl font-black text-white/90 tracking-tight">
              AI OPERATOR
            </h1>
          </div>
          <div className="glass px-4 py-2">
            <div className="text-[9px] mono text-white/25 tracking-[0.15em] uppercase">
              INTERFACE ACTIVE
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {messages.map((msg) => (
            <OperatorMessage key={msg.id} msg={msg} />
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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

      <div className="border-t border-white/5 glass px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 glass border border-white/8 flex items-center px-4">
              <span className="text-amber-500/40 mono text-sm mr-2">›</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Query the operator..."
                disabled={loading}
                className="flex-1 bg-transparent border-0 outline-none text-sm text-white/80 placeholder:text-white/20 py-3 mono"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="glass px-6 py-3 text-[10px] mono tracking-[0.2em] uppercase border border-amber-500/20 text-amber-500/60 hover:text-amber-500 hover:border-amber-500/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              TRANSMIT
            </button>
          </div>
          <div className="text-[9px] mono text-white/15 tracking-[0.15em] mt-2 pl-1">
            PRESS ENTER TO SEND — AI RESPONSES GROUNDED IN PORTFOLIO DATA
          </div>
        </div>
      </div>
    </div>
  );
}
