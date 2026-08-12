import { Package } from 'lucide-react'

export default function EmptyState({ title = 'No data found', description = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
        <Package className="w-7 h-7 text-slate-600" />
      </div>
      <p className="text-sm font-semibold text-slate-300 mb-1">{title}</p>
      {description && <p className="text-xs text-slate-500 max-w-xs mb-4">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-primary text-xs">
          {action.label}
        </button>
      )}
    </div>
  )
}
