import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import PublicRoute from './components/PublicRoute'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Orders from './pages/Orders'
import Projects from './pages/Projects'
import Vendors from './pages/Vendors'
import Invoices from './pages/Invoices'
import FinanceDashboard from './pages/FinanceDashboard'
import Admin from './pages/Admin'
import GeneralLedger from './pages/GeneralLedger'


function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* PROTECTED + LAYOUT */}
      <Route element={<ProtectedRoute />}>
        {/* The Layout wraps all these pages */}
        <Route element={<Layout />}>
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/inventory" element={<Inventory />} />
             <Route path="/orders" element={<Orders />} />
             <Route path="/projects" element={<Projects />} />
             <Route path="/vendors" element={<Vendors />} />
             <Route path="/invoices" element={<Invoices />} />
             <Route path="/financials" element={<FinanceDashboard />} />
             <Route path="/gl" element={<GeneralLedger />} />
             <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App