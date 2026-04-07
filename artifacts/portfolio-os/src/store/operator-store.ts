import { createContext, useContext, useReducer, useRef, type ReactNode, createElement } from "react";

export interface ProjectCitation {
  projectId: number;
  title: string;
  slug: string;
}

export interface TourStop {
  projectId: number;
  title: string;
  slug: string;
  rationale: string;
}

export interface OperatorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  citations?: ProjectCitation[];
  tour?: TourStop[];
  timestamp: Date;
  error?: boolean;
}

export interface OperatorState {
  messages: OperatorMessage[];
  loading: boolean;
  conversationId: string;
  panelOpen: boolean;
}

type OperatorAction =
  | { type: "OPEN_PANEL" }
  | { type: "CLOSE_PANEL" }
  | { type: "TOGGLE_PANEL" }
  | { type: "ADD_MESSAGE"; message: OperatorMessage }
  | { type: "UPDATE_MESSAGE"; id: string; updates: Partial<OperatorMessage> }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "CLEAR_MESSAGES" };

function operatorReducer(state: OperatorState, action: OperatorAction): OperatorState {
  switch (action.type) {
    case "OPEN_PANEL":
      return { ...state, panelOpen: true };
    case "CLOSE_PANEL":
      return { ...state, panelOpen: false };
    case "TOGGLE_PANEL":
      return { ...state, panelOpen: !state.panelOpen };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message] };
    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id ? { ...m, ...action.updates } : m,
        ),
      };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "CLEAR_MESSAGES":
      return { ...state, messages: [], conversationId: crypto.randomUUID() };
    default:
      return state;
  }
}

interface OperatorContextValue {
  state: OperatorState;
  dispatch: React.Dispatch<OperatorAction>;
  sendMessage: (text: string) => Promise<void>;
}

const OperatorContext = createContext<OperatorContextValue | null>(null);

const INITIAL_MESSAGE: OperatorMessage = {
  id: "init",
  role: "assistant",
  content:
    "NEXUS-7 OPERATOR ONLINE. Portfolio intelligence interface active. Ask me about any project, technical decisions, outcomes, or engineering philosophy. I can compare projects, recommend viewing sequences, and generate guided tours. What do you want to know?",
  timestamp: new Date(),
};

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API_BASE = `${BASE}/api`;

export function OperatorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(operatorReducer, {
    messages: [INITIAL_MESSAGE],
    loading: false,
    conversationId: crypto.randomUUID(),
    panelOpen: false,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  async function sendMessage(text: string): Promise<void> {
    const { loading, conversationId } = stateRef.current;
    if (!text.trim() || loading) return;

    const userMsgId = crypto.randomUUID();
    const assistantMsgId = crypto.randomUUID();

    dispatch({
      type: "ADD_MESSAGE",
      message: { id: userMsgId, role: "user", content: text.trim(), timestamp: new Date() },
    });
    dispatch({
      type: "ADD_MESSAGE",
      message: { id: assistantMsgId, role: "assistant", content: "", streaming: true, timestamp: new Date() },
    });
    dispatch({ type: "SET_LOADING", loading: true });

    try {
      const res = await fetch(`${API_BASE}/operator/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), conversationId }),
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
              dispatch({
                type: "UPDATE_MESSAGE",
                id: assistantMsgId,
                updates: { content: event.error, streaming: false, error: true },
              });
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
              dispatch({ type: "UPDATE_MESSAGE", id: assistantMsgId, updates: { content: displayText } });
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

              dispatch({
                type: "UPDATE_MESSAGE",
                id: assistantMsgId,
                updates: { content: finalText, streaming: false, citations, tour },
              });
            }
          } catch {
            // ignore parse errors on individual SSE chunks
          }
        }
      }
    } catch {
      dispatch({
        type: "UPDATE_MESSAGE",
        id: assistantMsgId,
        updates: {
          content: "SIGNAL LOST — operator connection interrupted. Please try again.",
          streaming: false,
          error: true,
        },
      });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }

  return createElement(OperatorContext.Provider, { value: { state, dispatch, sendMessage } }, children);
}

export function useOperator(): OperatorContextValue {
  const ctx = useContext(OperatorContext);
  if (!ctx) throw new Error("useOperator must be used within OperatorProvider");
  return ctx;
}
