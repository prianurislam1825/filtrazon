interface SkeletonProps {
  className?: string
  'aria-label'?: string
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label={props['aria-label'] ?? 'Loading...'}
      className={`animate-pulse rounded bg-gray-100 ${className}`}
    />
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="card p-4 space-y-3" role="status" aria-label="Loading metric">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="card p-4 space-y-3"
      role="status"
      aria-label="Loading chart"
      style={{ height }}
    >
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-2">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-7 w-10" />)}
        </div>
      </div>
      <Skeleton className="h-[calc(100%-80px)] w-full rounded-lg" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden" role="status" aria-label="Loading table">
      <div className="p-4 border-b border-gray-100">
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 w-20 shrink-0" />
            <Skeleton className="h-4 w-12 shrink-0" />
            <Skeleton className="h-4 w-10 shrink-0" />
            <Skeleton className="h-4 w-10 shrink-0" />
            <Skeleton className="h-4 w-10 shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}
