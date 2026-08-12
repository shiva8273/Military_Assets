import { useState, useEffect } from 'react'
import { Plus, Building2 } from 'lucide-react'
import { getBases, createBase } from '../services/api'
import { useToast } from '../context/ToastContext'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'

export default function Bases() {
  const toast = useToast()

  const [bases, setBases] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    location: '',
    code: '',
    contact_number: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchBases()
  }, [])

  const fetchBases = async () => {
    setLoading(true)
    try {
      const res = await getBases()
      setBases(res.data?.results || res.data || [])
    } catch {
      setBases([])
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Base name is required'
    if (!form.location.trim()) errs.location = 'Location is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await createBase(form)
      toast.success('Military base registered successfully.')
      setModalOpen(false)
      setForm({ name: '', location: '', code: '', contact_number: '' })
      fetchBases()
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to register base.')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      label: 'Base Name',
      accessor: 'name',
      sortable: true,
      render: (val) => <span className="font-semibold text-slate-100">{val}</span>
    },
    {
      label: 'Location',
      accessor: 'location',
      sortable: true,
      render: (val) => val || '—'
    },
    {
      label: 'Base Code / ID',
      accessor: 'code',
      sortable: true,
      render: (val, row) => val || `BASE-${row.id}`
    },
    {
      label: 'Contact',
      accessor: 'contact_number',
      sortable: true,
      render: (val) => val || '—'
    },
    {
      label: 'Created At',
      accessor: 'created_at',
      sortable: true,
      render: (val) => val ? new Date(val).toLocaleDateString() : '—'
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Military Bases</h2>
          <p className="text-xs text-slate-400">Configure command headquarters and operational military outposts</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Register New Base
        </button>
      </div>

      <DataTable
        columns={columns}
        data={bases}
        loading={loading}
        onRefresh={fetchBases}
        emptyTitle="No military bases registered"
        emptyDescription="Register military bases to manage localized asset inventories."
        emptyAction={{
          label: 'Register New Base',
          onClick: () => setModalOpen(true)
        }}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Register Military Base">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label">Base Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Fort Bragg Northern Command"
              className={`form-input ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div>
            <label className="form-label">Location / Coordinates</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Sector 4, North District"
              className={`form-input ${errors.location ? 'border-red-500' : ''}`}
            />
            {errors.location && <p className="form-error">{errors.location}</p>}
          </div>

          <div>
            <label className="form-label">Base Code (Optional)</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="e.g. BASE-ALPHA"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">HQ Contact Number (Optional)</label>
            <input
              type="text"
              value={form.contact_number}
              onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
              placeholder="e.g. +1 (555) 019-2831"
              className="form-input"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? 'Registering...' : 'Register Base'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
