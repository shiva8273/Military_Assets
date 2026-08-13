import { useState, useEffect } from 'react'
import { Plus, Users as UsersIcon } from 'lucide-react'
import { getUsers, createUser, getBases } from '../services/api'
import { useToast } from '../context/ToastContext'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'

export default function Users() {
  const toast = useToast()

  const [usersList, setUsersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [bases, setBases] = useState([])

  const [roleFilter, setRoleFilter] = useState('')
  const [baseFilter, setBaseFilter] = useState('')

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'LOGISTICS_OFFICER',
    base: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchBasesList()
    fetchUsersList()
  }, [roleFilter, baseFilter])

  const fetchBasesList = async () => {
    try {
      const res = await getBases()
      setBases(res.data?.results || res.data || [])
    } catch {
    }
  }

  const fetchUsersList = async () => {
    setLoading(true)
    try {
      const params = {}
      if (roleFilter) params.role = roleFilter
      if (baseFilter) params.base = baseFilter

      const res = await getUsers(params)
      setUsersList(res.data?.results || res.data || [])
    } catch {
      setUsersList([])
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.username.trim()) errs.username = 'Username is required'
    if (!form.password) errs.password = 'Password is required'
    if (form.password && form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (!form.role) errs.role = 'Role is required'
    if (form.role === 'BASE_COMMANDER' && !form.base) {
      errs.base = 'Base assignment is required for Base Commanders'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const payload = { ...form }
      if (!payload.base) delete payload.base

      await createUser(payload)
      toast.success('User account created successfully.')
      setModalOpen(false)
      setForm({ username: '', email: '', password: '', role: 'LOGISTICS_OFFICER', base: '' })
      fetchUsersList()
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to create user.')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      label: 'Username',
      accessor: 'username',
      sortable: true,
      render: (val) => <span className="font-semibold text-slate-100">{val}</span>
    },
    {
      label: 'Email',
      accessor: 'email',
      sortable: true,
      render: (val) => val || '—'
    },
    {
      label: 'Role',
      accessor: 'role',
      sortable: true,
      render: (val) => <Badge value={val} />
    },
    {
      label: 'Assigned Base',
      accessor: 'base_name',
      sortable: true,
      render: (val, row) => val || row.base?.name || (row.role === 'ADMIN' ? 'Global' : row.base)
    },
    {
      label: 'Date Joined',
      accessor: 'date_joined',
      sortable: true,
      render: (val) => val ? new Date(val).toLocaleDateString() : '—'
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">User Management</h2>
          <p className="text-xs text-slate-400">Manage user accounts, roles, and base assignments</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Create New User
        </button>
      </div>

      <div className="card p-3 flex flex-wrap gap-3 items-center">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="form-input w-auto text-xs py-1.5"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="BASE_COMMANDER">BASE COMMANDER</option>
          <option value="LOGISTICS_OFFICER">LOGISTICS OFFICER</option>
        </select>

        <select
          value={baseFilter}
          onChange={(e) => setBaseFilter(e.target.value)}
          className="form-input w-auto text-xs py-1.5"
        >
          <option value="">All Bases</option>
          {bases.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        {(roleFilter || baseFilter) && (
          <button
            onClick={() => { setRoleFilter(''); setBaseFilter('') }}
            className="text-xs text-navy-400 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={usersList}
        loading={loading}
        onRefresh={fetchUsersList}
        emptyTitle="No system users found"
        emptyDescription="Create user accounts to grant system access."
        emptyAction={{
          label: 'Create New User',
          onClick: () => setModalOpen(true)
        }}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create User Account">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="e.g. commander_smith"
              className={`form-input ${errors.username ? 'border-red-500' : ''}`}
            />
            {errors.username && <p className="form-error">{errors.username}</p>}
          </div>

          <div>
            <label className="form-label">Email Address (Optional)</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. smith@military.gov"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className={`form-input ${errors.password ? 'border-red-500' : ''}`}
            />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <div>
            <label className="form-label">System Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="form-input"
            >
              <option value="LOGISTICS_OFFICER">LOGISTICS OFFICER</option>
              <option value="BASE_COMMANDER">BASE COMMANDER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div>
            <label className="form-label">Assigned Military Base</label>
            <select
              value={form.base}
              onChange={(e) => setForm({ ...form, base: e.target.value })}
              className={`form-input ${errors.base ? 'border-red-500' : ''}`}
            >
              <option value="">{form.role === 'ADMIN' ? 'Global Access (No Base)' : 'Select Base'}</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {errors.base && <p className="form-error">{errors.base}</p>}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
