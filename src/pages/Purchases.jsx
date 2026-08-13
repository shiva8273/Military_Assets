import { useState, useEffect } from 'react'
import { Plus, ShoppingCart } from 'lucide-react'
import { getPurchases, createPurchase, getBases, getEquipmentTypes } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'

export default function Purchases() {
  const { role, baseId } = useAuth()
  const toast = useToast()

  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [bases, setBases] = useState([])
  const [eqTypes, setEqTypes] = useState([])

  const [form, setForm] = useState({
    base: role === 'ADMIN' ? '' : baseId || '',
    equipment_type: '',
    quantity: '',
    supplier: '',
    purchase_date: new Date().toISOString().split('T')[0]
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchOptions()
    fetchPurchases()
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

  const fetchPurchases = async () => {
    setLoading(true)
    try {
      const res = await getPurchases()
      setPurchases(res.data?.results || res.data || [])
    } catch {
      setPurchases([])
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.base) errs.base = 'Base is required'
    if (!form.equipment_type) errs.equipment_type = 'Equipment Type is required'
    if (!form.quantity || Number(form.quantity) <= 0) errs.quantity = 'Quantity must be greater than 0'
    if (!form.purchase_date) errs.purchase_date = 'Purchase Date is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await createPurchase({
        ...form,
        quantity: Number(form.quantity)
      })
      toast.success('Purchase recorded successfully.')
      setModalOpen(false)
      setForm({
        base: role === 'ADMIN' ? '' : baseId || '',
        equipment_type: '',
        quantity: '',
        supplier: '',
        purchase_date: new Date().toISOString().split('T')[0]
      })
      fetchPurchases()
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to create purchase record.')
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
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span>{val || row.equipment_type?.name || row.equipment_type || '—'}</span>
          {row.category && <Badge value={row.category} />}
        </div>
      )
    },
    {
      label: 'Quantity',
      accessor: 'quantity',
      sortable: true,
      render: (val) => <span className="font-semibold text-green-400 tabular-nums">+{val}</span>
    },
    {
      label: 'Supplier / Vendor',
      accessor: 'supplier',
      sortable: true,
      render: (val) => val || 'N/A'
    },
    {
      label: 'Date',
      accessor: 'purchase_date',
      sortable: true,
      render: (val, row) => val || row.date || row.created_at?.split('T')[0] || '—'
    },
    {
      label: 'Created By',
      accessor: 'created_by_name',
      sortable: true,
      render: (val, row) => val || row.created_by?.username || '—'
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Purchases</h2>
          <p className="text-xs text-slate-400">Record incoming stock procurements for military bases</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Record New Purchase
        </button>
      </div>

      <DataTable
        columns={columns}
        data={purchases}
        loading={loading}
        onRefresh={fetchPurchases}
        emptyTitle="No purchases recorded"
        emptyDescription="Add a new procurement record to increase incoming inventory."
        emptyAction={{
          label: 'Record New Purchase',
          onClick: () => setModalOpen(true)
        }}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record New Purchase">
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
            <label className="form-label">Quantity</label>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="e.g. 50"
              className={`form-input ${errors.quantity ? 'border-red-500' : ''}`}
            />
            {errors.quantity && <p className="form-error">{errors.quantity}</p>}
          </div>

          <div>
            <label className="form-label">Supplier / Vendor (Optional)</label>
            <input
              type="text"
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              placeholder="e.g. Defense Ordnance Corp"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Purchase Date</label>
            <input
              type="date"
              value={form.purchase_date}
              onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
              className={`form-input ${errors.purchase_date ? 'border-red-500' : ''}`}
            />
            {errors.purchase_date && <p className="form-error">{errors.purchase_date}</p>}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? 'Recording...' : 'Submit Purchase'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
