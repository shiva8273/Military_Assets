import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import OpeningBalances from './pages/OpeningBalances'
import Purchases from './pages/Purchases'
import Transfers from './pages/Transfers'
import Assignments from './pages/Assignments'
import Expenditures from './pages/Expenditures'
import EquipmentTypes from './pages/EquipmentTypes'
import Bases from './pages/Bases'
import Users from './pages/Users'
import AuditLogs from './pages/AuditLogs'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Authenticated Layout Shell */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              
              <Route
                path="/opening-balances"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'BASE_COMMANDER']}>
                    <OpeningBalances />
                  </ProtectedRoute>
                }
              />
              
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/transfers" element={<Transfers />} />

              <Route
                path="/assignments"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'BASE_COMMANDER']}>
                    <Assignments />
                  </ProtectedRoute>
                }
              />

              <Route path="/expenditures" element={<Expenditures />} />

              {/* Admin-only routes */}
              <Route
                path="/equipment-types"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <EquipmentTypes />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/bases"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <Bases />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <Users />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AuditLogs />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Default fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  )
}
