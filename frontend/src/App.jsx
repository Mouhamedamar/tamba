import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import PrivateRoute from './components/PrivateRoute'
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
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="membres" element={<Membres />} />
          <Route path="cellules" element={<Cellules />} />
          <Route path="primo-votants" element={<PrimoVotants />} />
          <Route path="activites" element={<Activites />} />
          <Route path="utilisateurs" element={<Utilisateurs />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

