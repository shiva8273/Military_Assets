import clsx from 'clsx'

const variants = {
  WEAPON:     'badge-weapon',
  VEHICLE:    'badge-vehicle',
  AMMUNITION: 'badge-ammunition',
  OTHER:      'badge-other',
  COMPLETED:  'badge-success',
  APPROVED:   'badge-success',
  PENDING:    'badge-warning',
  REJECTED:   'badge-danger',
  ACTIVE:     'badge-success',
  INACTIVE:   'badge-other',
  ADMIN:               'bg-purple-900/40 text-purple-300 border border-purple-800/50 badge',
  BASE_COMMANDER:      'bg-navy-900/40   text-navy-300   border border-navy-800/50   badge',
  LOGISTICS_OFFICER:   'bg-cyan-900/40   text-cyan-300   border border-cyan-800/50   badge',
}

export default function Badge({ value, label }) {
  const display = label || String(value || '').replace(/_/g, ' ')
  const cls = variants[String(value || '').toUpperCase()] || 'badge-other'
  return <span className={cls}>{display}</span>
}
