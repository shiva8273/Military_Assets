import { useState, useEffect } from 'react'
import { Plus, PackageMinus } from 'lucide-react'
import { getExpenditures, createExpenditure, getBases, getEquipmentTypes } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'

export default function Expenditures() {
  const { role, baseId } = useAuth()
  const toast = useToast()

  const [expenditures, setExpenditures] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [bases, setBases] = useState([])
  const [eqTypes, setEqTypes] = useState([])

  const [form, setForm] = useState({
    base: role === 'ADMIN' ? '' : baseId || '',
    equipment_type: '',
    quantity: '',
    reason: '',
    expenditure_date: new Date().toISOString().split('T')[0]
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchOptions()
    fetchExpenditures()
  }, [])

  const fetchOptions = async () => {
    try {
      if (role === 'ADMIN') {
        const resB = await getBases()
        setBases(resB.data?.results || resB.data || [])
      }
      const resEq = await getEquipmentTypes()
      setEqTypes(resEq.data?.equipment  || [])
    } catch {
    }
  }

  const fetchExpenditures = async () => {
    setLoading(true)
    try {
      const res = await getExpenditures()
      setExpenditures(res.data?.results || res.data || [])
    } catch {
      setExpenditures([])
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.base) errs.base = 'Base is required'
    if (!form.equipment_type) errs.equipment_type = 'Equipment Type is required'
    if (!form.quantity || Number(form.quantity) <= 0) errs.quantity = 'Quantity must be greater than 0'
    if (!form.reason.trim()) errs.reason = 'Reason/Details for expenditure is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await createExpenditure({
        ...form,
        quantity: Number(form.quantity)
      })
      toast.success('Expenditure recorded successfully.')
      setModalOpen(false)
      setForm({
        base: role === 'ADMIN' ? '' : baseId || '',
        equipment_type: '',
        quantity: '',
        reason: '',
        expenditure_date: new Date().toISOString().split('T')[0]
      })
      fetchExpenditures()
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to record expenditure.')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      label: 'Base',
      accessor: 'base_name',
      sortable: true,
      render: (val, row) => val || row.base?.name || row.base || '—'
    },
    {
      label: 'Equipment Type',
      accessor: 'equipment_type_name',
      sortable: true,
      render: (val, row) => val || row.equipment_type?.name || row.equipment_type || '—'
    },
    {
      label: 'Expended Quantity',
      accessor: 'quantity',
      sortable: true,
      render: (val) => <span className="font-semibold text-red-400 tabular-nums">-{val}</span>
    },
    {
      label: 'Reason / Context',
      accessor: 'reason',
      sortable: true,
      render: (val) => val || '—'
    },
    {
      label: 'Date',
      accessor: 'expenditure_date',
      sortable: true,
      render: (val, row) => val || row.created_at?.split('T')[0] || '—'
    },
    {
      label: 'Recorded By',
      accessor: 'created_by_name',
      sortable: true,
      render: (val, row) => val || row.created_by?.username || '—'
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Equipment Expenditures</h2>
          <p className="text-xs text-slate-400">Log consumed ammunition, demilitarized assets, or write-offs</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Record Expenditure
        </button>
      </div>

      <DataTable
        columns={columns}
        data={expenditures}
        loading={loading}
        onRefresh={fetchExpenditures}
        emptyTitle="No expenditure records found"
        emptyDescription="Expenditures for training exercises or asset consumption will appear here."
        emptyAction={{
          label: 'Record Expenditure',
          onClick: () => setModalOpen(true)
        }}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record Equipment Expenditure">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {role === 'ADMIN' ? (
            <div>
              <label className="form-label">Base</label>
              <select
                value={form.base}
                onChange={(e) => setForm({ ...form, base: e.target.value })}
                className={`form-input ${errors.base ? 'border-red-500' : ''}`}
              >
                <option value="">Select Base</option>
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {errors.base && <p className="form-error">{errors.base}</p>}
            </div>
          ) : (
            <div>
              <label className="form-label">Base ID</label>
              <input type="text" value={form.base} disabled className="form-input opacity-60 cursor-not-allowed" />
            </div>
          )}

          <div>
            <label className="form-label">Equipment Type</label>
            <select
              value={form.equipment_type}
              onChange={(e) => setForm({ ...form, equipment_type: e.target.value })}
              className={`form-input ${errors.equipment_type ? 'border-red-500' : ''}`}
            >
              <option value="">Select Equipment Type</option>
              {eqTypes.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.name} ({eq.category})</option>
              ))}
            </select>
            {errors.equipment_type && <p className="form-error">{errors.equipment_type}</p>}
          </div>

          <div>
            <label className="form-label">Expended Quantity</label>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="e.g. 1000"
              className={`form-input ${errors.quantity ? 'border-red-500' : ''}`}
            />
            {errors.quantity && <p className="form-error">{errors.quantity}</p>}
          </div>

          <div>
            <label className="form-label">Reason / Operational Context</label>
            <textarea
              rows="3"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="e.g. Live firing drill exercise / Combat simulation"
              className={`form-input ${errors.reason ? 'border-red-500' : ''}`}
            />
            {errors.reason && <p className="form-error">{errors.reason}</p>}
          </div>

          <div>
            <label className="form-label">Expenditure Date</label>
            <input
              type="date"
              value={form.expenditure_date}
              onChange={(e) => setForm({ ...form, expenditure_date: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? 'Submitting...' : 'Record Expenditure'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
