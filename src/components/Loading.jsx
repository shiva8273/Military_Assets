export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-navy-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Loading data...</p>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 8, cols = 5 }) {
  return (
    <div className="card">
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="h-7 w-48 bg-slate-800 rounded animate-pulse" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="table-header">
                  <div className="h-4 bg-slate-800 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b border-slate-800/50">
                {Array.from({ length: cols }).map((_, j) => (
                  <td key={j} className="table-cell">
                    <div className="h-4 bg-slate-800 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function CardsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="stat-card">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-slate-800 rounded animate-pulse w-20" />
              <div className="h-7 bg-slate-800 rounded animate-pulse w-16" />
            </div>
            <div className="w-10 h-10 bg-slate-800 rounded-xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Loading() {
  return <PageLoader />
}
