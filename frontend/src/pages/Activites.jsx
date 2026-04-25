import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { getToken } from '../utils/auth'
import { getMe } from '../services/api'
import Loader from '../components/Loader'
import ConfirmModal from '../components/ConfirmModal'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Calendar, MapPin, Clock, CheckCircle2, AlertCircle, XCircle, CalendarDays } from 'lucide-react'

const BASE = '/api'
const h = () => ({ Authorization: `Bearer ${getToken()}` })
const apiGet = (url) => axios.get(BASE + url, { headers: h() })
const apiPost = (url, data) => axios.post(BASE + url, data, { headers: h() })
const apiPut = (url, data) => axios.put(BASE + url, data, { headers: h() })
const apiDelete = (url) => axios.delete(BASE + url, { headers: h() })

const STATUT_CONFIG = {
  a_venir:  { label: 'A venir',  color: 'bg-blue-100 text-blue-700',   icon: Clock,        bar: 'bg-blue-400' },
  en_cours: { label: 'En cours', color: 'bg-green-100 text-green-700', icon: CheckCircle2, bar: 'bg-green-500' },
  termine:  { label: 'Termine',  color: 'bg-gray-100 text-gray-600',   icon: CheckCircle2, bar: 'bg-gray-400' },
  annule:   { label: 'Annule',   color: 'bg-red-100 text-red-700',     icon: XCircle,      bar: 'bg-red-400' },
}

const EMPTY = { titre: '', description: '', date_debut: '', date_fin: '', lieu: '', statut: 'a_venir' }

const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null

export default function Activites() {
  const [activites, setActivites] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filterStatut, setFilterStatut] = useState('')

  const fetchActivites = useCallback(async () => {
    setLoading(true)
    try {
      const params = filterStatut ? '?statut=' + filterStatut : ''
      const { data } = await apiGet('/activites/' + params)
      setActivites(data.results ?? data)
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }, [filterStatut])

  useEffect(() => {
    fetchActivites()
    getMe().then(res => setIsAdmin(res.data.role === 'admin' || res.data.is_superuser)).catch(() => {})

    // Rafraichissement automatique toutes les 30 secondes
    const interval = setInterval(fetchActivites, 30000)
    return () => clearInterval(interval)
  }, [fetchActivites])

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setShowModal(true) }
  const openEdit = (a) => {
    setEditTarget(a)
    setForm({
      titre: a.titre, description: a.description || '',
      date_debut: a.date_debut ? a.date_debut.slice(0, 16) : '',
      date_fin: a.date_fin ? a.date_fin.slice(0, 16) : '',
      lieu: a.lieu || '', statut: a.statut,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, date_fin: form.date_fin || null }
      if (editTarget) {
        await apiPut('/activites/' + editTarget.id + '/', payload)
        toast.success('Activite modifiee !')
      } else {
        await apiPost('/activites/', payload)
        toast.success('Activite creee !')
      }
      setShowModal(false)
      fetchActivites()
    } catch (err) {
      const errors = err.response?.data
      const msg = errors ? Object.values(errors).flat().join(' ') : 'Erreur'
      toast.error(msg)
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await apiDelete('/activites/' + deleteTarget.id + '/')
      toast.success('Activite supprimee')
      setDeleteTarget(null)
      fetchActivites()
    } catch { toast.error('Erreur suppression') }
  }

  const counts = Object.keys(STATUT_CONFIG).reduce((acc, k) => {
    acc[k] = activites.filter(a => a.statut === k).length
    return acc
  }, {})

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nos Activites</h1>
          <p className="text-gray-500 text-sm mt-0.5">Activites et evenements de l organisation</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-700">Mise a jour auto</span>
          </div>
          {isAdmin && (
            <button onClick={openCreate} className="btn-primary flex items-center gap-2">
              <Plus size={18} /> Nouvelle activite
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(STATUT_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon
          return (
            <button key={key} onClick={() => setFilterStatut(filterStatut === key ? '' : key)}
              className={"card p-4 flex items-center gap-3 transition-all hover:shadow-md text-left " + (filterStatut === key ? 'ring-2 ring-green-500' : '')}>
              <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + cfg.color}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{cfg.label}</p>
                <p className="text-xl font-bold text-gray-800">{counts[key]}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Liste */}
      {loading ? <Loader /> : activites.length === 0 ? (
        <div className="card text-center py-16">
          <CalendarDays size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">Aucune activite trouvee</p>
          {isAdmin && (
            <button onClick={openCreate} className="mt-4 btn-primary inline-flex items-center gap-2">
              <Plus size={16} /> Creer la premiere activite
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {activites.map((a) => {
            const cfg = STATUT_CONFIG[a.statut] || STATUT_CONFIG.a_venir
            const Icon = cfg.icon
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className={"h-1 w-full " + cfg.bar} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={"w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 " + cfg.color}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900">{a.titre}</h3>
                          <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold " + cfg.color}>
                            {cfg.label}
                          </span>
                        </div>
                        {a.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.description}</p>}
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {fmt(a.date_debut)}
                            {a.date_fin && ' → ' + fmt(a.date_fin)}
                          </span>
                          {a.lieu && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} /> {a.lieu}
                            </span>
                          )}
                          {a.cree_par_nom && (
                            <span className="flex items-center gap-1">
                              <AlertCircle size={12} /> Par {a.cree_par_nom}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => openEdit(a)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={15} /></button>
                        <button onClick={() => setDeleteTarget(a)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><CalendarDays size={20} className="text-white" /></div>
                  <div>
                    <h2 className="text-white font-bold text-lg">{editTarget ? 'Modifier' : 'Nouvelle'} activite</h2>
                    <p className="text-green-100 text-xs">Remplissez les informations de l activite</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><X size={20} /></button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre <span className="text-red-500">*</span></label>
                <input className="input-field" placeholder="Titre de l activite" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea className="input-field resize-none" rows={3} placeholder="Description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date debut <span className="text-red-500">*</span></label>
                  <input type="datetime-local" className="input-field" value={form.date_debut} onChange={e => setForm({ ...form, date_debut: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date fin</label>
                  <input type="datetime-local" className="input-field" value={form.date_fin} onChange={e => setForm({ ...form, date_fin: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Lieu</label>
                <input className="input-field" placeholder="Ex: Salle des fetes, Tambacounda" value={form.lieu} onChange={e => setForm({ ...form, lieu: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Statut</label>
                <select className="input-field" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                  {Object.entries(STATUT_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 size={16} />}
                  {saving ? 'Enregistrement...' : (editTarget ? 'Enregistrer' : 'Creer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={"Supprimer l activite \"" + deleteTarget.titre + "\" ?"}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
