import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield, Lock, User, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form,    setForm]    = useState({ username: '', password: '' })
  const [errors,  setErrors]  = useState({})
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiErr,  setApiErr]  = useState('')

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username is required'
    if (!form.password)        e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiErr('')
    if (!validate()) return
    setLoading(true)
    try {
      const user = await login({ username: form.username, password: form.password })
      toast.success(`Welcome back, ${user?.username || 'User'}!`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setApiErr(err.friendlyMessage || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(er => ({ ...er, [name]: '' }))
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left panel — Branding */}
      <div className="hidden lg:flex flex-col flex-1 items-center justify-center bg-slate-900 border-r border-slate-800 p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, #4a6fa5 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <div className="w-20 h-20 bg-navy-800 border border-navy-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Shield className="w-10 h-10 text-navy-300" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-100 mb-3 tracking-tight">
            MAMS
          </h2>
          <p className="text-navy-400 text-sm font-semibold uppercase tracking-widest mb-4">
            Military Asset Management System
          </p>
          <p className="text-slate-500 text-sm leading-relaxed">
            Enterprise-grade asset tracking and logistics management for military operations across all bases and units.
          </p>

          {/* Feature bullets */}
          <div className="mt-10 space-y-3 text-left">
            {[
              'Real-time inventory across all bases',
              'Full audit trail of every transaction',
              'Role-based access control & security',
              'Transfers, assignments & expenditure tracking',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-navy-500 flex-shrink-0" />
                <p className="text-xs text-slate-400">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — Login form */}
      <div className="flex flex-col items-center justify-center flex-1 lg:max-w-md xl:max-w-lg p-6 sm:p-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex flex-col items-center">
          <div className="w-14 h-14 bg-navy-800 border border-navy-600 rounded-xl flex items-center justify-center mb-3">
            <Shield className="w-7 h-7 text-navy-300" />
          </div>
          <p className="text-base font-bold text-slate-200">MAMS</p>
          <p className="text-xs text-slate-500">Military Asset Management</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-100 mb-1">Sign in to MAMS</h1>
            <p className="text-sm text-slate-500">Enter your credentials to access the system</p>
          </div>

          {/* API error alert */}
          {apiErr && (
            <div className="flex items-start gap-3 bg-red-900/30 border border-red-800/50 rounded-xl p-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{apiErr}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="form-label">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="username"
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className={`form-input pl-9 ${errors.username ? 'border-red-700 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.username && <p className="form-error">{errors.username}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`form-input pl-9 pr-10 ${errors.password ? 'border-red-700 focus:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-8">
            MAMS Enterprise · Authorised Personnel Only
          </p>
        </div>
      </div>
    </div>
  )
}
