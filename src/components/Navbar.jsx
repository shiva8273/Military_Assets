import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, User, Menu, Globe, MapPin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import clsx from 'clsx'

const pageTitles = {
  '/dashboard':        'Dashboard',
  '/inventory':        'Inventory',
  '/opening-balances': 'Opening Balances',
  '/purchases':        'Purchases',
  '/transfers':        'Transfers',
  '/assignments':      'Assignments',
  '/expenditures':     'Expenditures',
  '/equipment-types':  'Equipment Types',
  '/bases':            'Bases',
  '/users':            'Users',
  '/audit-logs':       'Audit Logs',
}

const roleBadgeStyle = {
  ADMIN:             'bg-purple-900/50 text-purple-300 border-purple-800/60',
  BASE_COMMANDER:    'bg-navy-900/50  text-navy-300  border-navy-800/60',
  LOGISTICS_OFFICER: 'bg-cyan-900/50  text-cyan-300  border-cyan-800/60',
}

export default function Navbar({ onMenuClick }) {
  const { user, role, baseName, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef()

  const pageTitle = pageTitles[location.pathname] || 'MAMS'

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-4 flex-shrink-0 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="lg:hidden btn-ghost p-2"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-slate-100 truncate">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
          {role === 'ADMIN' ? (
            <>
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs text-slate-300">Global Access</span>
            </>
          ) : (
            <>
              <MapPin className="w-3.5 h-3.5 text-navy-400" />
              <span className="text-xs text-slate-300 truncate max-w-[120px]">
                {baseName || 'Unassigned'}
              </span>
            </>
          )}
        </div>

        <button className="btn-ghost relative p-2" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-navy-500 rounded-full" />
        </button>

        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-navy-700 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-navy-200" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-slate-200 leading-none">
                {user?.username || user?.name || 'User'}
              </p>
              <p className={clsx(
                'text-[10px] font-medium mt-0.5 px-1 rounded border inline-block',
                roleBadgeStyle[role] || 'bg-slate-800 text-slate-400 border-slate-700'
              )}>
                {role?.replace('_', ' ')}
              </p>
            </div>
            <ChevronDown className={clsx('w-3.5 h-3.5 text-slate-400 transition-transform', dropOpen && 'rotate-180')} />
          </button>

          {dropOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 animate-slide-up overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-sm font-medium text-slate-100">{user?.username || user?.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{role?.replace('_', ' ')}</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
