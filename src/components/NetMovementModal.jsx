import Modal from './Modal'
import { TrendingUp, TrendingDown, ShoppingCart, ArrowRightLeft, Minus } from 'lucide-react'
import clsx from 'clsx'

export default function NetMovementModal({ open, onClose, data = {} }) {
  const purchases    = data.total_purchases    ?? data.purchases    ?? 0
  const transfersIn  = data.total_transfers_in  ?? data.transfers_in  ?? 0
  const transfersOut = data.total_transfers_out ?? data.transfers_out ?? 0
  const netMovement  = purchases + transfersIn - transfersOut

  const rows = [
    { label: 'Purchases',     value: purchases,    sign: '+', icon: ShoppingCart,   color: 'text-green-400',  bg: 'bg-green-900/20 border-green-800/30' },
    { label: 'Transfers In',  value: transfersIn,  sign: '+', icon: ArrowRightLeft, color: 'text-blue-400',   bg: 'bg-blue-900/20  border-blue-800/30' },
    { label: 'Transfers Out', value: transfersOut, sign: '-', icon: ArrowRightLeft, color: 'text-red-400',    bg: 'bg-red-900/20   border-red-800/30' },
  ]

  return (
    <Modal open={open} onClose={onClose} title="Net Movement Breakdown" size="sm">
      <div className="p-6 space-y-3">
        {rows.map((row) => {
          const Icon = row.icon
          return (
            <div key={row.label} className={clsx('flex items-center gap-3 p-3 rounded-xl border', row.bg)}>
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                <Icon className={clsx('w-4 h-4', row.color)} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-300">{row.label}</p>
              </div>
              <p className={clsx('text-base font-bold tabular-nums', row.color)}>
                {row.sign}{row.value.toLocaleString()}
              </p>
            </div>
          )
        })}

        {/* Divider */}
        <div className="border-t border-slate-700 pt-3">
          <div className={clsx(
            'flex items-center gap-3 p-4 rounded-xl border',
            netMovement >= 0
              ? 'bg-green-900/20 border-green-700/40'
              : 'bg-red-900/20   border-red-700/40'
          )}>
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              {netMovement >= 0
                ? <TrendingUp   className="w-4 h-4 text-green-400" />
                : <TrendingDown className="w-4 h-4 text-red-400" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-200">Net Movement</p>
              <p className="text-[11px] text-slate-500">Purchases + Transfers In − Transfers Out</p>
            </div>
            <p className={clsx(
              'text-xl font-extrabold tabular-nums',
              netMovement >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {netMovement >= 0 ? '+' : ''}{netMovement.toLocaleString()}
            </p>
          </div>
        </div>

        <button onClick={onClose} className="btn-secondary w-full mt-1">Close</button>
      </div>
    </Modal>
  )
}
