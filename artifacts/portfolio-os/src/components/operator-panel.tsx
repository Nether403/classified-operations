import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useOperator, type OperatorMessage, type ProjectCitation, type TourStop } from "@/store/operator-store";

function CitationChip({ citation }: { citation: ProjectCitation }) {
  return (
    <Link href={`/projects/${citation.slug}`}>
      <span
        className="inline-flex items-center gap-1.5 text-[9px] mono px-2 py-0.5 border border-blue-500/25 text-blue-400/70 hover:text-blue-400 hover:border-blue-500/50 transition-colors cursor-pointer"
        data-testid={`panel-citation-${citation.projectId}`}
      >
        <span className="w-1 h-1 rounded-full bg-blue-400/60 shrink-0" />
        {citation.title}
      </span>
    </Link>
  );
}

function TourSequence({ tour }: { tour: TourStop[] }) {
  return (
    <div className="mt-3 border border-amber-500/15 bg-amber-500/5" data-testid="panel-tour-sequence">
      <div className="text-[8px] mono text-amber-500/60 tracking-[0.2em] uppercase px-3 py-2 border-b border-amber-500/10">
        TOUR — {tour.length} STOPS
      </div>
      {tour.map((stop, i) => (
        <Link key={stop.projectId} href={`/projects/${stop.slug}`}>
          <div
            className="px-3 py-2 flex gap-3 items-start border-b border-white/3 last:border-0 hover:bg-white/3 transition-colors cursor-pointer group"
            data-testid={`panel-tour-stop-${stop.projectId}`}
          >
            <div className="text-[8px] mono text-amber-500/30 shrink-0 mt-0.5 group-hover:text-amber-500 transition-colors">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-medium text-white/75 mb-0.5 group-hover:text-amber-400 transition-colors truncate">
                {stop.title}
              </div>
              <p className="text-[9px] text-white/35 leading-relaxed">{stop.rationale}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function PanelMessage({ msg }: { msg: OperatorMessage }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-5 h-5 rounded-sm flex items-center justify-center shrink-0 text-[7px] mono ${
          isUser
            ? "bg-amber-500/20 border border-amber-500/30 text-amber-500"
            : msg.error
              ? "bg-red-500/20 border border-red-500/30 text-red-400"
              : "bg-blue-500/20 border border-blue-500/30 text-blue-400"
        }`}
      >
        {isUser ? "YOU" : "AI"}
      </div>
      <div className={`flex-1 min-w-0 flex flex-col gap-1.5 ${isUser ? "items-end" : ""}`}>
        <div
          className={`text-[10px] leading-relaxed p-3 glass whitespace-pre-wrap ${
            isUser
              ? "text-white/65 border-amber-500/10"
              : msg.error
                ? "text-red-400/75 border-red-500/15"
                : "text-white/75 border-blue-500/10"
          }`}
        >
          {msg.content}
          {msg.streaming && (
            <span className="inline-block w-0.5 h-3 bg-blue-400 ml-0.5 animate-pulse align-text-bottom" />
          )}
        </div>
        {!isUser && msg.citations && msg.citations.length > 0 && !msg.streaming && (
          <div className="flex flex-wrap gap-1.5">
            {msg.citations.map((c) => (
              <CitationChip key={c.projectId} citation={c} />
            ))}
          </div>
        )}
        {!isUser && msg.tour && msg.tour.length > 0 && !msg.streaming && (
          <TourSequence tour={msg.tour} />
        )}
      </div>
    </div>
  );
}

export function OperatorPanel() {
  const { state, dispatch, sendMessage } = useOperator();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.panelOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [state.messages, state.panelOpen]);

  useEffect(() => {
    if (state.panelOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [state.panelOpen]);

  async function handleSend() {
    const text = input.trim();
    if (!text || state.loading) return;
    setInput("");
    await sendMessage(text);
  }

  return (
    <>
      <button
        onClick={() => dispatch({ type: "TOGGLE_PANEL" })}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-sm flex items-center justify-center border transition-all ${
          state.panelOpen
            ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
            : "glass border-blue-500/20 text-blue-400/50 hover:text-blue-400 hover:border-blue-500/40"
        }`}
        data-testid="operator-fab"
        aria-label="Toggle AI Operator"
        title="AI Operator (NEXUS-7)"
      >
        <span className="text-[9px] mono tracking-widest">AI</span>
      </button>

      {state.panelOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => dispatch({ type: "CLOSE_PANEL" })}
        />
      )}

      <AnimatePresence>
        {state.panelOpen && (
          <>

            <motion.div
              key="operator-panel"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col bg-[#060608] border-l border-white/8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              data-testid="operator-panel"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 glass shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[10px] mono text-blue-400/70 tracking-[0.25em] uppercase">NEXUS-7</span>
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/operator">
                    <span
                      className="text-[8px] mono text-white/25 hover:text-white/60 tracking-[0.15em] uppercase transition-colors cursor-pointer"
                      onClick={() => dispatch({ type: "CLOSE_PANEL" })}
                    >
                      FULL VIEW
                    </span>
                  </Link>
                  <button
                    onClick={() => dispatch({ type: "CLOSE_PANEL" })}
                    className="text-white/25 hover:text-white/60 transition-colors"
                    data-testid="panel-close"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {state.messages.map((msg) => (
                  <PanelMessage key={msg.id} msg={msg} />
                ))}
                {state.loading && !state.messages.find((m) => m.streaming) && (
                  <div className="flex gap-2">
                    <div className="w-5 h-5 rounded-sm flex items-center justify-center shrink-0 bg-blue-500/20 border border-blue-500/30">
                      <span className="text-[7px] mono text-blue-400">AI</span>
                    </div>
                    <div className="glass p-3 flex items-center gap-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1 h-1 rounded-full bg-blue-400/60 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-white/8 glass px-4 py-3 shrink-0">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder="Query the operator..."
                    disabled={state.loading}
                    className="flex-1 bg-black/40 border border-white/8 outline-none text-[11px] text-white/75 placeholder:text-white/20 px-3 py-2 mono focus:border-blue-500/30 transition-colors"
                    data-testid="panel-input"
                  />
                  <button
                    onClick={() => void handleSend()}
                    disabled={state.loading || !input.trim()}
                    className="px-3 py-2 text-[8px] mono tracking-widest uppercase border border-amber-500/20 text-amber-500/50 hover:text-amber-500 hover:border-amber-500/40 transition-colors disabled:opacity-30"
                    data-testid="panel-btn-transmit"
                  >
                    SEND
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function useOpenOperator() {
  const { dispatch, sendMessage } = useOperator();
  return {
    openPanel: (prefilledQuery?: string) => {
      dispatch({ type: "OPEN_PANEL" });
      if (prefilledQuery) {
        setTimeout(() => void sendMessage(prefilledQuery), 100);
      }
    },
  };
}
