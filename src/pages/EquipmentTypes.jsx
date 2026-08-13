import { useState, useEffect } from 'react'
import { Plus, Layers } from 'lucide-react'
import { getEquipmentTypes, createEquipmentType } from '../services/api'
import { useToast } from '../context/ToastContext'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'

export default function EquipmentTypes() {
  const toast = useToast()

  const [eqTypes, setEqTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    category: 'WEAPON',
    description: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchEquipmentTypes()
  }, [])

  const fetchEquipmentTypes = async () => {
    setLoading(true)
    try {
      const resEq = await getEquipmentTypes()
      setEqTypes(resEq.data?.equipment  || [])
    } catch {
      setEqTypes([])
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Equipment name is required'
    if (!form.category) errs.category = 'Category is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await createEquipmentType(form)
      toast.success('Equipment type created successfully.')
      setModalOpen(false)
      setForm({ name: '', category: 'WEAPON', description: '' })
      fetchEquipmentTypes()
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to create equipment type.')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      label: 'Equipment Name',
      accessor: 'name',
      sortable: true,
      render: (val) => <span className="font-semibold text-slate-100">{val}</span>
    },
    {
      label: 'Category',
      accessor: 'category',
      sortable: true,
      render: (val) => <Badge value={val} />
    },
    {
      label: 'Description',
      accessor: 'description',
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
          <h2 className="page-title">Equipment Types</h2>
          <p className="text-xs text-slate-400">Manage military hardware classifications, weapons, vehicles, and munitions</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Equipment Type
        </button>
      </div>

      <DataTable
        columns={columns}
        data={eqTypes}
        loading={loading}
        onRefresh={fetchEquipmentTypes}
        emptyTitle="No equipment types defined"
        emptyDescription="Define equipment types such as rifles, tanks, or mortar rounds."
        emptyAction={{
          label: 'Add Equipment Type',
          onClick: () => setModalOpen(true)
        }}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Equipment Type">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label">Equipment Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. M4A1 Carbine, Humvee, 155mm Shell"
              className={`form-input ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div>
            <label className="form-label">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="form-input"
            >
              <option value="WEAPON">WEAPON</option>
              <option value="VEHICLE">VEHICLE</option>
              <option value="AMMUNITION">AMMUNITION</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div>
            <label className="form-label">Description (Optional)</label>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Standard issue assault rifle 5.56 NATO"
              className="form-input"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? 'Creating...' : 'Create Equipment Type'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
