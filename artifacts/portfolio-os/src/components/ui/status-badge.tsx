interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { dot: string; text: string }> = {
  DEPLOYED: { dot: "bg-green-400", text: "text-green-400" },
  ACTIVE: { dot: "bg-blue-400", text: "text-blue-400" },
  BETA: { dot: "bg-amber-400", text: "text-amber-400" },
  ARCHIVED: { dot: "bg-white/30", text: "text-white/30" },
  DEVELOPMENT: { dot: "bg-purple-400", text: "text-purple-400" },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? statusConfig.ARCHIVED;
  return (
    <span className={`flex items-center gap-1.5 ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      <span className={`text-[10px] mono tracking-[0.15em] uppercase ${cfg.text}`}>
        {status}
      </span>
    </span>
  );
}
