export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/5 mt-24 py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-[10px] mono text-white/20 tracking-[0.2em] uppercase">
          PORTFOLIO OS / CLEARANCE LEVEL: PUBLIC
        </div>
        <div className="text-[10px] mono text-white/20 tracking-[0.2em] uppercase">
          © {year} — ALL OPERATIONS CLASSIFIED
        </div>
      </div>
    </footer>
  );
}
