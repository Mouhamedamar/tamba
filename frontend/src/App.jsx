import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Membres from './pages/Membres'
import Cellules from './pages/Cellules'
import PrimoVotants from './pages/PrimoVotants'
import Activites from './pages/Activites'
import Utilisateurs from './pages/Utilisateurs'
import InstallPWA from './components/InstallPWA'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: '10px', fontSize: '14px' },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
        }}
      />
      <InstallPWA />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/membres" replace />} />
          {/* Routes for all authenticated users */}
          <Route path="membres" element={<Membres />} />
          <Route path="activites" element={<Activites />} />
          {/* Admin-only routes */}
          <Route path="dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="cellules" element={<AdminRoute><Cellules /></AdminRoute>} />
          <Route path="primo-votants" element={<AdminRoute><PrimoVotants /></AdminRoute>} />
          <Route path="utilisateurs" element={<AdminRoute><Utilisateurs /></AdminRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/membres" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

