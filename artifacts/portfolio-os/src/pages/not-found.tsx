import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/use-seo";

const GLITCH_CHARS = "▓░▒█▄▀■□◆◇▪▫";

function GlitchText({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < iterations) return text[i];
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          })
          .join("")
      );
      if (iterations >= text.length) clearInterval(interval);
      iterations += 0.35;
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <span className="mono">{display}</span>;
}

export function NotFoundPage() {
  useSEO({ title: "404 — FILE NOT FOUND" });
  const [scanline, setScanline] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setScanline((s) => (s + 1) % 3);
    }, 600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]" data-testid="not-found-page">
      <div className="relative">
        <motion.div
          className="text-center max-w-md mx-auto px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="h-px w-full bg-gradient-to-r from-transparent via-red-500/40 to-transparent mb-8"
          />

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[9px] mono text-red-400/50 tracking-[0.3em] uppercase mb-6 flex items-center justify-center gap-3"
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            SYSTEM ALERT — CLASSIFICATION BREACH
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-[6rem] font-black leading-none text-white/5 mono mb-0 select-none" aria-hidden>
              404
            </div>
            <div className="text-3xl md:text-4xl font-black text-white/90 -mt-4 mb-2">
              <GlitchText text="RECORD EXPUNGED" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="section-line my-6" />

            <div className="glass p-4 mb-6 text-left">
              <div className="text-[9px] mono text-white/25 tracking-[0.2em] uppercase mb-3">INCIDENT REPORT</div>
              <div className="space-y-1.5">
                {[
                  { key: "STATUS", value: "FILE_NOT_FOUND" },
                  { key: "CLEARANCE", value: "ACCESS_DENIED" },
                  { key: "RECORD", value: "PURGED OR REDACTED" },
                  { key: "PROTOCOL", value: "RETURN TO BASE" },
                ].map(({ key, value }, i) => (
                  <div key={key} className={`flex items-center gap-3 text-[10px] mono transition-opacity ${
                    scanline === i % 3 ? "opacity-60" : "opacity-100"
                  }`}>
                    <span className="text-white/25 w-20 shrink-0">{key}</span>
                    <span className="text-[8px] text-white/15">://</span>
                    <span className={`${
                      key === "STATUS" ? "text-red-400/70" : key === "PROTOCOL" ? "text-amber-400/70" : "text-white/50"
                    }`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-[10px] mono px-6 py-3 border border-amber-500/30 text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/60 tracking-[0.2em] uppercase transition-all"
              >
                ← RETURN TO BASE
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="h-px w-full bg-gradient-to-r from-transparent via-red-500/20 to-transparent mt-8"
          />
        </motion.div>
      </div>
    </div>
  );
}
