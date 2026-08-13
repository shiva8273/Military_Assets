import { useState, useEffect } from 'react'
import { ClipboardList, Shield } from 'lucide-react'
import { getAuditLogs } from '../services/api'
import DataTable from '../components/DataTable'
import Badge from '../components/Badge'

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const [actionFilter, setActionFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [actionFilter, userFilter, dateFilter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = {}
      if (actionFilter) params.action = actionFilter
      if (userFilter) params.user = userFilter
      if (dateFilter) params.date = dateFilter

      const res = await getAuditLogs(params)
      setLogs(res.data?.results || res.data || [])
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      label: 'Timestamp',
      accessor: 'timestamp',
      sortable: true,
      render: (val, row) => {
        const d = val || row.created_at
        return d ? new Date(d).toLocaleString() : '—'
      }
    },
    {
      label: 'User',
      accessor: 'username',
      sortable: true,
      render: (val, row) => (
        <span className="font-semibold text-slate-200">
          {val || row.user?.username || row.user || 'System'}
        </span>
      )
    },
    {
      label: 'Action',
      accessor: 'action',
      sortable: true,
      render: (val) => <Badge value={val} />
    },
    {
      label: 'Details / Metadata',
      accessor: 'details',
      sortable: true,
      render: (val, row) => val || row.description || row.message || JSON.stringify(row.data || {}) || '—'
    },
    {
      label: 'IP Address',
      accessor: 'ip_address',
      sortable: true,
      render: (val) => <span className="font-mono text-xs text-slate-400">{val || '127.0.0.1'}</span>
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">System Audit Logs</h2>
          <p className="text-xs text-slate-400">Immutable security and transaction log for all inventory operations</p>
        </div>
      </div>

      <div className="card p-3 flex flex-wrap gap-3 items-center">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="form-input w-auto text-xs py-1.5"
        >
          <option value="">All Actions</option>
          <option value="PURCHASE">PURCHASE</option>
          <option value="TRANSFER">TRANSFER</option>
          <option value="ASSIGNMENT">ASSIGNMENT</option>
          <option value="EXPENDITURE">EXPENDITURE</option>
          <option value="LOGIN">LOGIN</option>
          <option value="OPENING_BALANCE">OPENING_BALANCE</option>
        </select>

        <input
          type="text"
          placeholder="Filter by Username..."
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="form-input w-auto text-xs py-1.5"
        />

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="form-input w-auto text-xs py-1.5"
        />

        {(actionFilter || userFilter || dateFilter) && (
          <button
            onClick={() => { setActionFilter(''); setUserFilter(''); setDateFilter('') }}
            className="text-xs text-navy-400 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        onRefresh={fetchLogs}
        emptyTitle="No audit log entries found"
        emptyDescription="System transactions and security events will automatically record here."
      />
    </div>
  )
}
