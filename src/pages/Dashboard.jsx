import { useState, useEffect } from 'react'
import {
  Scale, ShoppingCart, ArrowRightLeft, UserCheck, PackageMinus, Package,
  TrendingUp, RefreshCw, AlertCircle
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { getDashboardSummary, getBases, getEquipmentTypes } from '../services/api'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import NetMovementModal from '../components/NetMovementModal'
import { CardsSkeleton } from '../components/Loading'

const CHART_COLORS = ['#3d50e8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

export default function Dashboard() {
  const { role, baseId } = useAuth()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [netModalOpen, setNetModalOpen] = useState(false)

  const [bases, setBases] = useState([])
  const [eqTypes, setEqTypes] = useState([])
  const [selectedBase, setSelectedBase] = useState(role === 'ADMIN' ? '' : baseId || '')
  const [selectedEqType, setSelectedEqType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    fetchOptions()
  }, [])

  useEffect(() => {
    fetchSummary()
  }, [selectedBase, selectedEqType, dateFrom, dateTo])

  const fetchOptions = async () => {
    try {
      if (role === 'ADMIN') {
        const resBases = await getBases()
        setBases(resBases.data?.results || resBases.data || [])
      }
      const resEq = await getEquipmentTypes()
      setEqTypes(resEq.data?.results || resEq.data || [])
    } catch {
    }
  }

  const fetchSummary = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (selectedBase) params.base = selectedBase
      if (selectedEqType) params.equipment_type = selectedEqType
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo

      const res = await getDashboardSummary(params)
      setSummary(res.data)
    } catch (err) {
      setError(err.friendlyMessage || 'Unable to fetch dashboard statistics.')
    } finally {
      setLoading(false)
    }
  }

  const opening      = summary?.opening_balance     ?? summary?.opening     ?? 0
  const purchases    = summary?.total_purchases    ?? summary?.purchases    ?? 0
  const transfersIn  = summary?.total_transfers_in  ?? summary?.transfers_in  ?? 0
  const transfersOut = summary?.total_transfers_out ?? summary?.transfers_out ?? 0
  const netMovement  = purchases + transfersIn - transfersOut
  const assignments  = summary?.total_assignments  ?? summary?.assignments  ?? 0
  const expenditures = summary?.total_expenditures ?? summary?.expenditures ?? 0
  const closing      = summary?.closing_balance     ?? summary?.closing     ?? (opening + netMovement - assignments - expenditures)

  const eqDistributionData = summary?.by_equipment_type || summary?.equipment_type_distribution || []
  const baseInventoryData  = summary?.by_base || summary?.base_inventory || []
  const categoryData       = summary?.by_category || summary?.category_distribution || []

  const movementOverviewData = [
    { name: 'Purchases', value: purchases },
    { name: 'Transfers In', value: transfersIn },
    { name: 'Transfers Out', value: transfersOut },
    { name: 'Assignments', value: assignments },
    { name: 'Expenditures', value: expenditures },
  ]

  return (
    <div className="space-[#10 space-y-6">
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
              <option key={eq.id} value={eq.id}>{eq.name} ({eq.category})</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="form-input w-auto text-xs py-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="form-input w-auto text-xs py-1"
            />
          </div>

          {(selectedBase || selectedEqType || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setSelectedBase(role === 'ADMIN' ? '' : baseId || '')
                setSelectedEqType('')
                setDateFrom('')
                setDateTo('')
              }}
              className="text-xs text-navy-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        <button onClick={fetchSummary} className="btn-ghost py-1.5 px-3 text-xs" disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-900/30 border border-red-800/50 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {loading ? (
        <CardsSkeleton count={8} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Opening Balance" value={opening} icon={Scale} color="slate" />
          <StatCard label="Purchases (+)" value={purchases} icon={ShoppingCart} color="green" />
          <StatCard label="Transfers In (+)" value={transfersIn} icon={ArrowRightLeft} color="cyan" />
          <StatCard label="Transfers Out (-)" value={transfersOut} icon={ArrowRightLeft} color="amber" />
          <StatCard
            label="Net Movement"
            value={netMovement}
            icon={TrendingUp}
            color={netMovement >= 0 ? 'green' : 'red'}
            clickable
            onClick={() => setNetModalOpen(true)}
          />
          <StatCard label="Assignments (-)" value={assignments} icon={UserCheck} color="purple" />
          <StatCard label="Expenditures (-)" value={expenditures} icon={PackageMinus} color="red" />
          <StatCard label="Closing Balance" value={closing} icon={Package} color="navy" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="section-title mb-4">Asset Movement Breakdown</h3>
          <div className="h-72">
            {movementOverviewData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={movementOverviewData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  />
                  <Bar dataKey="value" fill="#5a72f5" radius={[4, 4, 0, 0]}>
                    {movementOverviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No movement data available for selected filters
              </div>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-4">Inventory by Equipment Type</h3>
          <div className="h-72">
            {eqDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eqDistributionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  />
                  <Bar dataKey="quantity" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No equipment type data available
              </div>
            )}
          </div>
        </div>

        {role === 'ADMIN' && (
          <div className="card p-5">
            <h3 className="section-title mb-4">Base-wise Stock Distribution</h3>
            <div className="h-72">
              {baseInventoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={baseInventoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="base_name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    />
                    <Bar dataKey="total_assets" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  No base distribution data available
                </div>
              )}
            </div>
          </div>
        )}

        <div className="card p-5">
          <h3 className="section-title mb-4">Equipment Category Distribution</h3>
          <div className="h-72">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No category distribution data available
              </div>
            )}
          </div>
        </div>
      </div>

      <NetMovementModal
        open={netModalOpen}
        onClose={() => setNetModalOpen(false)}
        data={{
          purchases,
          transfers_in: transfersIn,
          transfers_out: transfersOut,
        }}
      />
    </div>
  )
}
