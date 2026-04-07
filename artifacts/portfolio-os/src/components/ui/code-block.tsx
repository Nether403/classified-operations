import { useState } from "react";

function detectLanguage(code: string, hint?: string): string {
  if (hint) return hint.toLowerCase();
  if (code.match(/^\s*(import|export|const|function|interface|type\s+\w)/m)) return "typescript";
  if (code.match(/^\s*(def |class |import |from |print\()/m)) return "python";
  if (code.match(/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|FROM)\b/im)) return "sql";
  if (code.match(/^\s*(\$|>|#)\s/m)) return "shell";
  if (code.match(/^\s*(<[a-z]|<!DOCTYPE)/i)) return "html";
  if (code.match(/^\s*\{[\s\S]*\}/)) return "json";
  return "code";
}

function tokenize(code: string, lang: string): Array<{ text: string; cls: string }> {
  if (lang === "shell") {
    return [{ text: code, cls: "text-green-400/80" }];
  }
  if (lang === "json") {
    return code.split(/("(?:\\.|[^"])*")/g).map((part, i) => ({
      text: part,
      cls: i % 2 === 1 ? "text-amber-300/80" : "text-white/75",
    }));
  }

  const keywords = /\b(import|export|from|const|let|var|function|class|interface|type|return|if|else|for|while|async|await|new|this|super|extends|implements|enum|namespace|module|declare|abstract|static|public|private|protected|readonly|true|false|null|undefined|def|class|print|from|import|select|where|join|on|as|with|is|not|and|or|in|between|like|group|by|order|having|limit|insert|into|values|update|set|delete|create|table|index|view|void|string|number|boolean|any|never|unknown)\b/gi;
  const strings = /("(?:\\.|[^"])*"|'(?:\\.|[^'])*'|`(?:\\.|[^`])*`)/g;
  const comments = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)/g;
  const numbers = /\b(\d+\.?\d*)\b/g;

  const segments: Array<{ start: number; end: number; cls: string }> = [];

  let m: RegExpExecArray | null;
  const re1 = new RegExp(comments.source, "g");
  while ((m = re1.exec(code)) !== null) segments.push({ start: m.index, end: m.index + m[0].length, cls: "text-white/30 italic" });
  const re2 = new RegExp(strings.source, "g");
  while ((m = re2.exec(code)) !== null) {
    if (!segments.some((s) => m!.index >= s.start && m!.index < s.end))
      segments.push({ start: m.index, end: m.index + m[0].length, cls: "text-green-400/80" });
  }
  const re3 = new RegExp(numbers.source, "g");
  while ((m = re3.exec(code)) !== null) {
    if (!segments.some((s) => m!.index >= s.start && m!.index < s.end))
      segments.push({ start: m.index, end: m.index + m[0].length, cls: "text-blue-300/80" });
  }
  const re4 = new RegExp(keywords.source, "gi");
  while ((m = re4.exec(code)) !== null) {
    if (!segments.some((s) => m!.index >= s.start && m!.index < s.end))
      segments.push({ start: m.index, end: m.index + m[0].length, cls: "text-amber-400/90" });
  }

  segments.sort((a, b) => a.start - b.start);

  const result: Array<{ text: string; cls: string }> = [];
  let pos = 0;
  for (const seg of segments) {
    if (seg.start > pos) result.push({ text: code.slice(pos, seg.start), cls: "text-white/75" });
    result.push({ text: code.slice(seg.start, seg.end), cls: seg.cls });
    pos = seg.end;
  }
  if (pos < code.length) result.push({ text: code.slice(pos), cls: "text-white/75" });
  return result.length > 0 ? result : [{ text: code, cls: "text-white/75" }];
}

export function CodeBlock({ code, lang, title }: { code: string; lang?: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const language = detectLanguage(code, lang);
  const tokens = tokenize(code, language);

  function copy() {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="code-block group relative my-4">
      <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
        <span className="text-[9px] mono text-amber-500/35 uppercase tracking-widest">{language}</span>
        <button
          onClick={copy}
          className="text-[9px] mono text-white/20 hover:text-white/60 transition-colors uppercase tracking-widest ml-1"
          aria-label="Copy code"
        >
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>
      {title && (
        <div className="text-[9px] mono text-amber-500/40 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
          {title}
        </div>
      )}
      <pre className="overflow-x-auto whitespace-pre text-[0.78rem] leading-relaxed">
        <code>
          {tokens.map((t, i) => (
            <span key={i} className={t.cls}>{t.text}</span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export function parseContentBlocks(content: string): Array<{ type: "text" | "code"; content: string; lang?: string }> {
  const blocks: Array<{ type: "text" | "code"; content: string; lang?: string }> = [];
  const parts = content.split(/(```[\s\S]*?```)/g);
  for (const part of parts) {
    if (part.startsWith("```")) {
      const lines = part.slice(3, -3).split("\n");
      const lang = lines[0].trim() || undefined;
      const code = (lang ? lines.slice(1) : lines).join("\n").trim();
      blocks.push({ type: "code", content: code, lang });
    } else if (part.trim()) {
      blocks.push({ type: "text", content: part });
    }
  }
  return blocks;
}
