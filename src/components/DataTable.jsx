import { useState, useMemo } from 'react'
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import clsx from 'clsx'
import EmptyState from './EmptyState'

export default function DataTable({
  columns,
  data = [],
  loading = false,
  onRefresh,
  pageSize = 15,
  emptyTitle = 'No records found',
  emptyDescription = '',
  emptyAction,
  rowKey = 'id',
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  // Sorting
  const sorted = useMemo(() => {
    if (!sortKey) return data

    return [...data].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''

      const cmp = String(av).localeCompare(
        String(bv),
        undefined,
        { numeric: true }
      )

      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(sorted.length / pageSize)
  )

  const paginated = sorted.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  // Handle sorting
  const handleSort = (key) => {
    if (!key) return

    if (sortKey === key) {
      setSortDir((direction) =>
        direction === 'asc' ? 'desc' : 'asc'
      )
    } else {
      setSortKey(key)
      setSortDir('asc')
    }

    setPage(1)
  }

  return (
    <div className="card">

      {/* Table Header / Refresh */}
      {onRefresh && (
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-b border-slate-800">

          <span className="text-xs text-slate-500">
            {data.length} record{data.length !== 1 ? 's' : ''}
          </span>

          <button
            onClick={onRefresh}
            className="btn-ghost py-1.5 px-2.5 text-xs"
            disabled={loading}
          >
            <RefreshCw
              className={clsx(
                'w-3.5 h-3.5',
                loading && 'animate-spin'
              )}
            />

            Refresh
          </button>

        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">

        <table className="w-full min-w-[600px]">

          {/* Table Head */}
          <thead>
            <tr className="border-b border-slate-800">

              {columns.map((col) => (

                <th
                  key={col.key || col.accessor}
                  className={clsx(
                    'table-header',
                    col.sortable !== false &&
                    col.accessor &&
                    'cursor-pointer hover:text-slate-200 select-none'
                  )}
                  onClick={() =>
                    col.sortable !== false &&
                    col.accessor &&
                    handleSort(col.accessor)
                  }
                  style={{ width: col.width }}
                >

                  <div className="flex items-center gap-1">

                    {col.label}

                    {col.sortable !== false &&
                      col.accessor && (
                        <span className="flex flex-col">

                          <ChevronUp
                            className={clsx(
                              'w-3 h-3 -mb-1',
                              sortKey === col.accessor &&
                              sortDir === 'asc'
                                ? 'text-navy-400'
                                : 'opacity-30'
                            )}
                          />

                          <ChevronDown
                            className={clsx(
                              'w-3 h-3',
                              sortKey === col.accessor &&
                              sortDir === 'desc'
                                ? 'text-navy-400'
                                : 'opacity-30'
                            )}
                          />

                        </span>
                      )}

                  </div>

                </th>

              ))}

            </tr>
          </thead>

          {/* Table Body */}
          <tbody>

            {/* Loading */}
            {loading ? (

              Array.from({ length: 6 }).map((_, i) => (

                <tr
                  key={i}
                  className="border-b border-slate-800/50"
                >

                  {columns.map((col) => (

                    <td
                      key={col.key || col.accessor}
                      className="table-cell"
                    >

                      <div className="h-4 bg-slate-800 rounded animate-pulse" />

                    </td>

                  ))}

                </tr>

              ))

            ) : paginated.length === 0 ? (

              /* Empty State */
              <tr>

                <td
                  colSpan={columns.length}
                  className="py-16"
                >

                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />

                </td>

              </tr>

            ) : (

              /* Data Rows */
              paginated.map((row, i) => (

                <tr
                  key={row[rowKey] ?? i}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >

                  {columns.map((col) => (

                    <td
                      key={col.key || col.accessor}
                      className="table-cell"
                    >

                      {col.render
                        ? col.render(
                            row[col.accessor],
                            row
                          )
                        : (
                          row[col.accessor] ?? '—'
                        )}

                    </td>

                  ))}

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* Pagination */}
      {!loading && sorted.length > pageSize && (

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">

          <p className="text-xs text-slate-500">
            Page {page} of {totalPages} · {sorted.length} total
          </p>

          <div className="flex items-center gap-1">

            {/* Previous */}
            <button
              onClick={() =>
                setPage((p) => Math.max(1, p - 1))
              }
              disabled={page === 1}
              className="btn-ghost py-1 px-2 disabled:opacity-30"
            >

              <ChevronLeft className="w-4 h-4" />

            </button>

            {/* Page Numbers */}
            {Array.from(
              { length: Math.min(5, totalPages) },
              (_, i) => {

                let p

                if (totalPages <= 5) {
                  p = i + 1
                } else if (page <= 3) {
                  p = i + 1
                } else if (page >= totalPages - 2) {
                  p = totalPages - 4 + i
                } else {
                  p = page - 2 + i
                }

                return (

                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={clsx(
                      'w-7 h-7 text-xs rounded-lg font-medium transition-colors',
                      p === page
                        ? 'bg-navy-700 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    )}
                  >
                    {p}
                  </button>

                )
              }
            )}

            {/* Next */}
            <button
              onClick={() =>
                setPage((p) =>
                  Math.min(totalPages, p + 1)
                )
              }
              disabled={page === totalPages}
              className="btn-ghost py-1 px-2 disabled:opacity-30"
            >

              <ChevronRight className="w-4 h-4" />

            </button>

          </div>

        </div>

      )}

    </div>
  )
}