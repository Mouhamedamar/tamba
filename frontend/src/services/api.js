import axios from 'axios'
import { getToken, getRefreshToken, setTokens, clearTokens, isTokenExpired } from '../utils/auth'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request + auto-refresh
api.interceptors.request.use(async (config) => {
  let token = getToken()

  if (token && isTokenExpired(token)) {
    const refresh = getRefreshToken()
    if (refresh && !isTokenExpired(refresh)) {
      try {
        const { data } = await axios.post('/api/auth/refresh/', { refresh })
        setTokens(data.access, null)
        token = data.access
      } catch {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject('Session expirÃ©e')
      }
    } else {
      clearTokens()
      window.location.href = '/login'
      return Promise.reject('Session expirÃ©e')
    }
  }

  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      clearTokens()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const getCsrfToken = () => {
  return document.cookie.split('; ').find(row => row.startsWith('csrftoken=')).split('=')[1]
}

// POST /api/auth/login/          { username, password } â†’ { access, refresh, user }
export const login = (credentials) => {
  const config = {
    headers: {
      'X-CSRFToken': getCsrfToken(),
    },
  }
  return axios.post('/api/auth/login/', credentials, config)
}

// POST /api/auth/refresh/        { refresh } â†’ { access, refresh }
export const refreshToken = (refresh) => axios.post('/api/auth/refresh/', { refresh })

// POST /api/auth/logout/         { refresh }
export const logout = (refresh) => api.post('/auth/logout/', { refresh })

// GET  /api/auth/me/             â†’ user object
export const getMe = () => api.get('/auth/me/')

// â”€â”€ Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// GET  /api/dashboard/
// Response: { total_membres, membres_par_cellule: [{cellule__nom_cellule, count}], evolution_inscriptions: [{date, count}] }
export const getDashboard = () => api.get('/dashboard/')

// â”€â”€ Membres â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// GET    /api/membres/?search=&cellule=&quartier__icontains=&page=
// POST   /api/membres/          { nom, prenom, telephone, quartier, cellule, role }
// GET    /api/membres/:id/
// PUT    /api/membres/:id/
// PATCH  /api/membres/:id/
// DELETE /api/membres/:id/      (soft delete)
// POST   /api/membres/:id/restore/
// GET    /api/membres/deleted/
export const getMembres = (params) => api.get('/membres/', { params })
export const getMembre = (id) => api.get(`/membres/${id}/`)
export const createMembre = (data) => api.post('/membres/', data)
export const updateMembre = (id, data) => api.patch(`/membres/${id}/`, data)
export const deleteMembre = (id) => api.delete(`/membres/${id}/`)
export const restoreMembre = (id) => api.post(`/membres/${id}/restore/`)
export const getDeletedMembres = () => api.get('/membres/deleted/')

// â”€â”€ Cellules â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// GET    /api/cellules/?search=
// POST   /api/cellules/         { nom_cellule, description, responsable }
// GET    /api/cellules/:id/
// PUT    /api/cellules/:id/
// PATCH  /api/cellules/:id/
// DELETE /api/cellules/:id/
export const getCellules = (params) => api.get('/cellules/', { params })
export const getCellule = (id) => api.get(`/cellules/${id}/`)
export const createCellule = (data) => api.post('/cellules/', data)
export const updateCellule = (id, data) => api.patch(`/cellules/${id}/`, data)
export const deleteCellule = (id) => api.delete(`/cellules/${id}/`)
export const getUsers = (params) => api.get('/auth/users/', { params })
export const createUser = (data) => api.post('/auth/users/', data)
export const updateUser = (id, data) => api.patch(`/auth/users/${id}/`, data)
export const deleteUser = (id) => api.delete(`/auth/users/${id}/`)

export default api

export const getResponsablesList = () => api.get('/membres/responsables-list/')

