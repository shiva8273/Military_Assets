import { useState, useEffect } from 'react'
import { getInventory, getBases, getEquipmentTypes } from '../services/api'
import { useAuth } from '../context/AuthContext'
import DataTable from '../components/DataTable'
import Badge from '../components/Badge'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Inventory() {
  const { role, baseId } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [bases, setBases] = useState([])
  const [eqTypes, setEqTypes] = useState([])
  const [selectedBase, setSelectedBase] = useState(role === 'ADMIN' ? '' : baseId || '')
  const [selectedEqType, setSelectedEqType] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [lowStockThreshold, setLowStockThreshold] = useState(10)

  useEffect(() => {
    fetchOptions()
  }, [])

  useEffect(() => {
    fetchInventory()
  }, [selectedBase, selectedEqType, selectedCategory])

  const fetchOptions = async () => {
    try {
      if (role === 'ADMIN') {
        const resBases = await getBases()
        setBases(resBases.data?.results || resBases.data || [])
      }
      const resEq = await getEquipmentTypes()
      setEqTypes(resEq.data?.results || resEq.data || [])
    } catch {
      // Option fetch failure handled gracefully
    }
  }

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const params = {}
      if (selectedBase) params.base = selectedBase
      if (selectedEqType) params.equipment_type = selectedEqType
      if (selectedCategory) params.category = selectedCategory

      const res = await getInventory(params)
      const raw = res.data?.results || res.data || []

      // Normalize row calculations
      const processed = raw.map((item) => {
        const opening = item.opening_balance ?? item.opening ?? 0
        const purchases = item.purchases ?? item.total_purchases ?? 0
        const inTrans = item.transfers_in ?? item.total_transfers_in ?? 0
        const outTrans = item.transfers_out ?? item.total_transfers_out ?? 0
        const assigned = item.assignments ?? item.total_assignments ?? 0
        const expended = item.expenditures ?? item.total_expenditures ?? 0

        const closing = item.closing_balance ?? item.closing ?? (opening + purchases + inTrans - outTrans - assigned - expended)

        return {
          ...item,
          opening_balance: opening,
          purchases,
          transfers_in: inTrans,
          transfers_out: outTrans,
          assignments: assigned,
          expenditures: expended,
          closing_balance: closing,
          base_name: item.base_name || item.base?.name || item.base || '—',
          equipment_name: item.equipment_type_name || item.equipment_type?.name || item.equipment_type || '—',
          category: item.category || item.equipment_type?.category || 'OTHER',
        }
      })

      setData(processed)
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      label: 'Base',
      accessor: 'base_name',
      sortable: true,
      render: (val) => <span className="font-medium text-slate-200">{val}</span>
    },
    {
      label: 'Equipment Type',
      accessor: 'equipment_name',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span>{val}</span>
          <Badge value={row.category} />
        </div>
      )
    },
    {
      label: 'Opening',
      accessor: 'opening_balance',
      sortable: true,
      render: (val) => <span className="tabular-nums">{val}</span>
    },
    {
      label: 'Purchases (+)',
      accessor: 'purchases',
      sortable: true,
      render: (val) => <span className="text-green-400 tabular-nums">+{val}</span>
    },
    {
      label: 'Transfers In (+)',
      accessor: 'transfers_in',
      sortable: true,
      render: (val) => <span className="text-blue-400 tabular-nums">+{val}</span>
    },
    {
      label: 'Transfers Out (-)',
      accessor: 'transfers_out',
      sortable: true,
      render: (val) => <span className="text-amber-400 tabular-nums">-{val}</span>
    },
    {
      label: 'Assignments (-)',
      accessor: 'assignments',
      sortable: true,
      render: (val) => <span className="text-purple-400 tabular-nums">-{val}</span>
    },
    {
      label: 'Expenditures (-)',
      accessor: 'expenditures',
      sortable: true,
      render: (val) => <span className="text-red-400 tabular-nums">-{val}</span>
    },
    {
      label: 'Closing Balance',
      accessor: 'closing_balance',
      sortable: true,
      render: (val) => {
        const isLow = val <= lowStockThreshold
        return (
          <div className="flex items-center gap-2">
            <span className={`font-bold tabular-nums text-base ${isLow ? 'text-amber-400' : 'text-slate-100'}`}>
              {val}
            </span>
            {isLow && (
              <span className="flex items-center gap-1 text-[10px] bg-amber-900/40 text-amber-400 border border-amber-800/60 px-1.5 py-0.5 rounded">
                <AlertTriangle className="w-3 h-3" /> Low Stock
              </span>
            )}
          </div>
        )
      }
    }
  ]

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          {role === 'ADMIN' && (
            <select
              value={selectedBase}
              onChange={(e) => setSelectedBase(e.target.value)}
              className="form-input w-auto text-xs py-1.5"
            >
              <option value="">All Bases</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}

          <select
            value={selectedEqType}
            onChange={(e) => setSelectedEqType(e.target.value)}
            className="form-input w-auto text-xs py-1.5"
          >
            <option value="">All Equipment Types</option>
            {eqTypes.map((eq) => (
              <option key={eq.id} value={eq.id}>{eq.name}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-input w-auto text-xs py-1.5"
          >
            <option value="">All Categories</option>
            <option value="WEAPON">WEAPON</option>
            <option value="VEHICLE">VEHICLE</option>
            <option value="AMMUNITION">AMMUNITION</option>
            <option value="OTHER">OTHER</option>
          </select>

          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            <span className="text-xs text-slate-400">Low Stock Alert:</span>
            <input
              type="number"
              min="0"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Number(e.target.value))}
              className="form-input w-20 text-xs py-1"
            />
          </div>
        </div>

        <button onClick={fetchInventory} className="btn-ghost py-1.5 px-3 text-xs" disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Inventory DataTable */}
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        onRefresh={fetchInventory}
        emptyTitle="No inventory records found"
        emptyDescription="Create purchases, opening balances, or transfers to populate inventory."
      />
    </div>
  )
}
