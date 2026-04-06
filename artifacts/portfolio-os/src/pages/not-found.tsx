import { Link } from "wouter";
import { motion } from "framer-motion";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]" data-testid="not-found-page">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-[10px] mono text-red-500/80 tracking-[0.3em] uppercase mb-4 animate-pulse flex items-center justify-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>ERROR 404 — FILE NOT FOUND</span>
          <div className="w-2 h-2 rounded-full bg-red-500" />
        </div>
        <div className="text-sm text-white/40 mono mb-8 max-w-md mx-auto">
          The intelligence dossier you are attempting to access does not exist, has been redacted, or your clearance level is insufficient.
        </div>
        <Link href="/">
          <button className="text-[10px] mono px-6 py-3 border border-amber-500/30 text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-500 tracking-[0.2em] uppercase transition-colors">
            ← RETURN TO BASE
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
