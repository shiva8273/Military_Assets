import clsx from 'clsx'

export default function StatCard({ label, value, icon: Icon, color = 'navy', trend, onClick, clickable }) {
  const colorMap = {
    navy:   { bg: 'bg-navy-900/40',   icon: 'text-navy-400',   border: 'border-navy-800/40' },
    green:  { bg: 'bg-green-900/40',  icon: 'text-green-400',  border: 'border-green-800/40' },
    red:    { bg: 'bg-red-900/40',    icon: 'text-red-400',    border: 'border-red-800/40' },
    amber:  { bg: 'bg-amber-900/40',  icon: 'text-amber-400',  border: 'border-amber-800/40' },
    purple: { bg: 'bg-purple-900/40', icon: 'text-purple-400', border: 'border-purple-800/40' },
    cyan:   { bg: 'bg-cyan-900/40',   icon: 'text-cyan-400',   border: 'border-cyan-800/40' },
    slate:  { bg: 'bg-slate-800/60',  icon: 'text-slate-400',  border: 'border-slate-700/60' },
  }
  const c = colorMap[color] || colorMap.navy

  return (
    <div
      onClick={onClick}
      className={clsx(
        'stat-card group',
        clickable && 'cursor-pointer hover:border-slate-600 hover:shadow-card-hover'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-2xl font-bold text-slate-100 tabular-nums">
            {value !== null && value !== undefined ? value.toLocaleString() : '—'}
          </p>
          {trend !== undefined && (
            <p className={clsx(
              'text-xs mt-1 font-medium',
              trend >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toLocaleString()}
            </p>
          )}
          {clickable && (
            <p className="text-xs text-navy-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Click for breakdown →
            </p>
          )}
        </div>
        {Icon && (
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border', c.bg, c.border)}>
            <Icon className={clsx('w-5 h-5', c.icon)} />
          </div>
        )}
      </div>
    </div>
  )
}
