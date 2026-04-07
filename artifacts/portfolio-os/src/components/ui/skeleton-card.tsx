export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`glass skeleton-shimmer rounded-sm ${className}`} aria-hidden="true">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 rounded-sm bg-white/5" />
          <div className="h-4 w-16 rounded-sm bg-white/3" />
        </div>
        <div className="h-5 w-3/4 rounded-sm bg-white/5" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded-sm bg-white/3" />
          <div className="h-3 w-5/6 rounded-sm bg-white/3" />
          <div className="h-3 w-4/6 rounded-sm bg-white/3" />
        </div>
        <div className="flex gap-2 mt-4">
          <div className="h-5 w-14 rounded-sm bg-white/4" />
          <div className="h-5 w-12 rounded-sm bg-white/4" />
          <div className="h-5 w-16 rounded-sm bg-white/4" />
        </div>
        <div className="h-px w-full bg-white/5 mt-4" />
        <div className="h-3 w-24 rounded-sm bg-amber-500/10 ml-auto" />
      </div>
    </div>
  );
}

export function SkeletonRow({ className = "" }: { className?: string }) {
  return (
    <div className={`glass skeleton-shimmer px-4 py-3 flex items-center gap-4 ${className}`} aria-hidden="true">
      <div className="h-4 w-20 rounded-sm bg-white/5 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-48 rounded-sm bg-white/5" />
        <div className="h-3 w-64 rounded-sm bg-white/3" />
      </div>
      <div className="flex gap-2 shrink-0">
        <div className="h-5 w-12 rounded-sm bg-white/4" />
        <div className="h-5 w-10 rounded-sm bg-white/4" />
      </div>
    </div>
  );
}

export function SkeletonStatCard({ className = "" }: { className?: string }) {
  return (
    <div className={`glass skeleton-shimmer p-6 ${className}`} aria-hidden="true">
      <div className="h-3 w-24 rounded-sm bg-white/4 mb-4" />
      <div className="h-12 w-16 rounded-sm bg-white/6 mb-2" />
      <div className="h-3 w-20 rounded-sm bg-white/3" />
    </div>
  );
}
