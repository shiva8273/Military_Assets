import { useState, useEffect } from 'react'
import { Plus, ArrowRightLeft } from 'lucide-react'
import { getTransfers, createTransfer, getBases, getEquipmentTypes } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Badge from '../components/Badge'

export default function Transfers() {
  const { role, baseId } = useAuth()
  const toast = useToast()

  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [bases, setBases] = useState([])
  const [eqTypes, setEqTypes] = useState([])

  const [form, setForm] = useState({
    source_base: role === 'ADMIN' ? '' : baseId || '',
    destination_base: '',
    equipment_type: '',
    quantity: '',
    transfer_date: new Date().toISOString().split('T')[0]
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchOptions()
    fetchTransfers()
  }, [])

  const fetchOptions = async () => {
    try {
      const resB = await getBases()
      setBases(resB.data?.results || resB.data || [])
      const resE = await getEquipmentTypes()
      setEqTypes(resE.data?.results || resE.data || [])
    } catch {
      // Handled
    }
  }

  const fetchTransfers = async () => {
    setLoading(true)
    try {
      const res = await getTransfers()
      setTransfers(res.data?.results || res.data || [])
    } catch {
      setTransfers([])
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.source_base) errs.source_base = 'Source Base is required'
    if (!form.destination_base) errs.destination_base = 'Destination Base is required'
    if (form.source_base && form.destination_base && String(form.source_base) === String(form.destination_base)) {
      errs.destination_base = 'Source and Destination bases cannot be the same'
    }
    if (!form.equipment_type) errs.equipment_type = 'Equipment Type is required'
    if (!form.quantity || Number(form.quantity) <= 0) errs.quantity = 'Quantity must be greater than 0'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleOpenConfirm = (e) => {
    e.preventDefault()
    if (validate()) {
      setConfirmOpen(true)
    }
  }

  const handleExecuteTransfer = async () => {
    setSubmitting(true)
    try {
      await createTransfer({
        ...form,
        quantity: Number(form.quantity)
      })
      toast.success('Equipment transfer completed successfully.')
      setConfirmOpen(false)
      setModalOpen(false)
      setForm({
        source_base: role === 'ADMIN' ? '' : baseId || '',
        destination_base: '',
        equipment_type: '',
        quantity: '',
        transfer_date: new Date().toISOString().split('T')[0]
      })
      fetchTransfers()
    } catch (err) {
      toast.error(err.friendlyMessage || 'Transfer operation failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const getBaseName = (id) => bases.find(b => String(b.id) === String(id))?.name || `Base #${id}`
  const getEqName = (id) => eqTypes.find(e => String(e.id) === String(id))?.name || `Equipment #${id}`

  const columns = [
    {
      label: 'Source Base',
      accessor: 'source_base_name',
      sortable: true,
      render: (val, row) => val || row.source_base?.name || row.source_base || '—'
    },
    {
      label: 'Destination Base',
      accessor: 'destination_base_name',
      sortable: true,
      render: (val, row) => val || row.destination_base?.name || row.destination_base || '—'
    },
    {
      label: 'Equipment Type',
      accessor: 'equipment_type_name',
      sortable: true,
      render: (val, row) => val || row.equipment_type?.name || row.equipment_type || '—'
    },
    {
      label: 'Quantity',
      accessor: 'quantity',
      sortable: true,
      render: (val) => <span className="font-semibold text-slate-100 tabular-nums">{val}</span>
    },
    {
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (val) => <Badge value={val || 'COMPLETED'} />
    },
    {
      label: 'Initiated By',
      accessor: 'initiated_by_name',
      sortable: true,
      render: (val, row) => val || row.initiated_by?.username || row.created_by?.username || '—'
    },
    {
      label: 'Date',
      accessor: 'transfer_date',
      sortable: true,
      render: (val, row) => val || row.created_at?.split('T')[0] || '—'
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Inter-Base Transfers</h2>
          <p className="text-xs text-slate-400">Transfer military equipment atomically between locations</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Initiate Transfer
        </button>
      </div>

      <DataTable
        columns={columns}
        data={transfers}
        loading={loading}
        onRefresh={fetchTransfers}
        emptyTitle="No transfer records found"
        emptyDescription="Inter-base transfers will be logged here once initiated."
        emptyAction={{
          label: 'Initiate Transfer',
          onClick: () => setModalOpen(true)
        }}
      />

      {/* Transfer Form Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Initiate Equipment Transfer">
        <form onSubmit={handleOpenConfirm} className="p-6 space-y-4">
          <div>
            <label className="form-label">Source Base</label>
            {role === 'ADMIN' ? (
              <select
                value={form.source_base}
                onChange={(e) => setForm({ ...form, source_base: e.target.value })}
                className={`form-input ${errors.source_base ? 'border-red-500' : ''}`}
              >
                <option value="">Select Source Base</option>
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            ) : (
              <input type="text" value={getBaseName(form.source_base)} disabled className="form-input opacity-60 cursor-not-allowed" />
            )}
            {errors.source_base && <p className="form-error">{errors.source_base}</p>}
          </div>

          <div>
            <label className="form-label">Destination Base</label>
            <select
              value={form.destination_base}
              onChange={(e) => setForm({ ...form, destination_base: e.target.value })}
              className={`form-input ${errors.destination_base ? 'border-red-500' : ''}`}
            >
              <option value="">Select Destination Base</option>
              {bases
                .filter(b => String(b.id) !== String(form.source_base))
                .map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
            </select>
            {errors.destination_base && <p className="form-error">{errors.destination_base}</p>}
          </div>

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
              placeholder="e.g. 25"
              className={`form-input ${errors.quantity ? 'border-red-500' : ''}`}
            />
            {errors.quantity && <p className="form-error">{errors.quantity}</p>}
          </div>

          <div>
            <label className="form-label">Transfer Date</label>
            <input
              type="date"
              value={form.transfer_date}
              onChange={(e) => setForm({ ...form, transfer_date: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              Continue to Confirm
            </button>
          </div>
        </form>
      </Modal>

      {/* Required Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleExecuteTransfer}
        loading={submitting}
        title="Confirm Inter-Base Transfer"
        message={`Are you sure you want to transfer ${form.quantity} units of "${getEqName(form.equipment_type)}" from ${getBaseName(form.source_base)} to ${getBaseName(form.destination_base)}?`}
        confirmLabel="Confirm & Transfer"
      />
    </div>
  )
}
