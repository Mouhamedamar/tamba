import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getMe } from '../services/api'

/**
 * Route guard that only allows admin users.
 * Non-admin users are redirected to /membres.
 */
export default function AdminRoute({ children }) {
  const [status, setStatus] = useState('loading') // loading | admin | denied

  useEffect(() => {
    getMe()
      .then(res => setStatus(res.data.role === 'admin' ? 'admin' : 'denied'))
      .catch(() => setStatus('denied'))
  }, [])

  if (status === 'loading') return null
  if (status === 'denied') return <Navigate to="/membres" replace />
  return children
}
