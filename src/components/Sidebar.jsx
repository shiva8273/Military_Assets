import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingCart, ArrowRightLeft,
  UserCheck, PackageMinus, Users, Building2, ClipboardList,
  Layers, Scale, ChevronLeft, ChevronRight, Shield, X, Menu
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import clsx from 'clsx'

const allNavItems = [
  { to: '/dashboard',        label: 'Dashboard',        icon: LayoutDashboard, roles: ['ADMIN','BASE_COMMANDER','LOGISTICS_OFFICER'] },
  { to: '/inventory',        label: 'Inventory',        icon: Package,          roles: ['ADMIN','BASE_COMMANDER','LOGISTICS_OFFICER'] },
  { to: '/opening-balances', label: 'Opening Balances', icon: Scale,            roles: ['ADMIN','BASE_COMMANDER'] },
  { to: '/purchases',        label: 'Purchases',        icon: ShoppingCart,     roles: ['ADMIN','BASE_COMMANDER','LOGISTICS_OFFICER'] },
  { to: '/transfers',        label: 'Transfers',        icon: ArrowRightLeft,   roles: ['ADMIN','BASE_COMMANDER','LOGISTICS_OFFICER'] },
  { to: '/assignments',      label: 'Assignments',      icon: UserCheck,        roles: ['ADMIN','BASE_COMMANDER'] },
  { to: '/expenditures',     label: 'Expenditures',     icon: PackageMinus,     roles: ['ADMIN','BASE_COMMANDER','LOGISTICS_OFFICER'] },
  { divider: true, label: 'Administration',            roles: ['ADMIN'] },
  { to: '/equipment-types',  label: 'Equipment Types',  icon: Layers,           roles: ['ADMIN'] },
  { to: '/bases',            label: 'Bases',             icon: Building2,        roles: ['ADMIN'] },
  { to: '/users',            label: 'Users',             icon: Users,            roles: ['ADMIN'] },
  { to: '/audit-logs',       label: 'Audit Logs',        icon: ClipboardList,    roles: ['ADMIN'] },
]

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { role } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const overlayRef = useRef()

  const navItems = allNavItems.filter(item => item.roles.includes(role))

  // Close mobile sidebar on route change
  useEffect(() => { onMobileClose?.() }, [location.pathname])

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden animate-fade-in"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300',
          // Desktop
          'lg:translate-x-0',
          collapsed ? 'lg:w-[72px]' : 'lg:w-64',
          // Mobile
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72',
          'lg:relative lg:h-screen lg:flex-shrink-0'
        )}
      >
        {/* Header */}
        <div className={clsx(
          'flex items-center border-b border-slate-800 px-4 h-16 flex-shrink-0',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-navy-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-navy-200" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-100 truncate">MAMS</p>
                <p className="text-[10px] text-slate-500 truncate">Asset Management</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-navy-700 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-navy-200" />
            </div>
          )}
          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className="lg:hidden flex items-center justify-center w-7 h-7 rounded text-slate-500 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item, idx) => {
            if (item.divider) {
              return !collapsed ? (
                <div key={idx} className="pt-4 pb-1 px-2">
                  <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                    {item.label}
                  </p>
                </div>
              ) : <div key={idx} className="my-2 border-t border-slate-800" />
            }
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center rounded-lg transition-colors duration-150 group relative',
                    collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
                    isActive
                      ? 'bg-navy-700 text-white'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-100 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg border border-slate-700">
                    {item.label}
                  </div>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer version */}
        {!collapsed && (
          <div className="px-4 py-3 border-t border-slate-800">
            <p className="text-[10px] text-slate-600">v1.0.0 — MAMS Enterprise</p>
          </div>
        )}
      </aside>
    </>
  )
}
