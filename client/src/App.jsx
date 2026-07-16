import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { FuneralProvider } from './contexts/FuneralContext'
import { ToastProvider } from './contexts/ToastContext'
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import FuneralDashboard from './pages/dashboard/FuneralDashboard'
import CreateFuneral from './pages/dashboard/CreateFuneral'
import Committee from './pages/dashboard/Committee'
import Tasks from './pages/dashboard/Tasks'
import Financials from './pages/dashboard/Financials'
import Contributions from './pages/dashboard/Contributions'
import VendorDirectory from './pages/vendors/VendorDirectory'
import VendorDetail from './pages/vendors/VendorDetail'
import VendorDashboard from './pages/vendors/VendorDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import Memorial from './pages/memorial/Memorial'
import MemorialDirectory from './pages/memorial/MemorialDirectory'
import OrderOfService from './pages/memorial/OrderOfService'
import Donate from './pages/memorial/Donate'
import Profile from './pages/profile/Profile'
import EditProfile from './pages/profile/EditProfile'
import Icon from './components/ui/Icon'

function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: '4rem', marginBottom: 16 }}><Icon name="dove" size={64} /></div>
      <h1>404</h1>
      <p style={{ marginBottom: 24 }}>Page not found</p>
      <a href="/" className="btn btn-primary">Go Home</a>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <FuneralProvider>
        <ToastProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/memorials" element={<MemorialDirectory />} />
              <Route path="/memorial/:id" element={<Memorial />} />
              <Route path="/donate/:id" element={<Donate />} />
            </Route>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<FuneralDashboard />} />
              <Route path="/funerals/new" element={<CreateFuneral />} />
              <Route path="/committee" element={<Committee />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/financials" element={<Financials />} />
              <Route path="/contributions" element={<Contributions />} />
              <Route path="/order-of-service" element={<OrderOfService />} />
              <Route path="/vendors" element={<VendorDirectory />} />
              <Route path="/vendors/:id" element={<VendorDetail />} />
              <Route path="/vendor-dashboard" element={<VendorDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </FuneralProvider>
    </AuthProvider>
  )
}
