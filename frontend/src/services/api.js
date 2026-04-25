import axios from 'axios'
import { getToken, getRefreshToken, setTokens, clearTokens, isTokenExpired } from '../utils/auth'

const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT + auto-refresh
api.interceptors.request.use(async (config) => {
  let token = getToken()
  if (token && isTokenExpired(token)) {
    const refresh = getRefreshToken()
    if (refresh && !isTokenExpired(refresh)) {
      try {
        const { data } = await axios.post(BASE_URL + '/auth/refresh/', { refresh })
        setTokens(data.access, null)
        token = data.access
      } catch {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject('Session expiree')
      }
    } else {
      clearTokens()
      window.location.href = '/login'
      return Promise.reject('Session expiree')
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

// Auth
export const login = (credentials) => axios.post(BASE_URL + '/auth/login/', credentials)
export const refreshToken = (refresh) => axios.post(BASE_URL + '/auth/refresh/', { refresh })
export const logout = (refresh) => api.post('/auth/logout/', { refresh })
export const getMe = () => api.get('/auth/me/')

// Dashboard
export const getDashboard = () => api.get('/dashboard/')

// Membres
export const getMembres = (params) => api.get('/membres/', { params })
export const getMembre = (id) => api.get(`/membres/${id}/`)
export const createMembre = (data) => api.post('/membres/', data)
export const updateMembre = (id, data) => api.patch(`/membres/${id}/`, data)
export const deleteMembre = (id) => api.delete(`/membres/${id}/`)
export const restoreMembre = (id) => api.post(`/membres/${id}/restore/`)
export const getDeletedMembres = () => api.get('/membres/deleted/')
export const getResponsablesList = () => api.get('/membres/responsables-list/')

// Cellules
export const getCellules = (params) => api.get('/cellules/', { params })
export const getCellule = (id) => api.get(`/cellules/${id}/`)
export const createCellule = (data) => api.post('/cellules/', data)
export const updateCellule = (id, data) => api.patch(`/cellules/${id}/`, data)
export const deleteCellule = (id) => api.delete(`/cellules/${id}/`)

// Utilisateurs
export const getUsers = (params) => api.get('/auth/users/', { params })
export const createUser = (data) => api.post('/auth/users/', data)
export const updateUser = (id, data) => api.patch(`/auth/users/${id}/`, data)
export const deleteUser = (id) => api.delete(`/auth/users/${id}/`)

export default api
