import { useEffect, useState, useCallback } from "react"
import { getCellules, getCellule, createCellule, updateCellule, deleteCellule, getMembres } from "../services/api"
import Loader from "../components/Loader"
import ConfirmModal from "../components/ConfirmModal"
import toast from "react-hot-toast"
import { Plus, Edit2, Trash2, Building2, X } from "lucide-react"

const EMPTY_FORM = { nom_cellule: "", description: "", quartier: "", commune: "", departement: "Tambacounda", actif: true, responsable: null }

export default function Cellules() {
  const [cellules, setCellules] = useState([])
  const [responsables, setResponsables] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")

  const fetchResponsables = useCallback(async () => {
    try {
      const { data } = await getMembres({ role: "responsable", page_size: 100 })
      const list = Array.isArray(data) ? data : (data.results || [])
      setResponsables(list)
    } catch {
      toast.error("Erreur lors de la récupération des responsables")
    }
  }, [])

  const fetchCellules = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await getCellules({ search: search || undefined })
      const list = data.results ? data.results : (Array.isArray(data) ? data : [])
      setCellules(list)
    } catch (err) {
      setError(err.message || "Erreur lors du chargement")
      toast.error("Erreur lors du chargement des cellules")
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchCellules()
    fetchResponsables()
  }, [fetchCellules, fetchResponsables])

  const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setShowModal(true)
  }

  const openEdit = async (c) => {
    try {
      const { data } = await getCellule(c.id)
      setEditTarget(data)
      setForm({
        nom_cellule: data.nom_cellule ?? "",
        description: data.description ?? "",
        quartier: data.quartier ?? "",
        commune: data.commune ?? "",
        departement: data.departement ?? "Tambacounda",
        actif: data.actif ?? true,
        responsable: data.responsable ?? null,
      })
      setErrors({})
      setShowModal(true)
    } catch {
      toast.error("Impossible de charger la cellule pour modification")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form }
    if (!payload.responsable) delete payload.responsable
    try {
      if (editTarget) {
        await updateCellule(editTarget.id, payload)
        toast.success("Cellule modifiée avec succès")
      } else {
        await createCellule(payload)
        toast.success("Cellule créée avec succès")
      }
      setShowModal(false)
      fetchCellules()
    } catch (err) {
      const apiErrors = err.response?.data
      setErrors(apiErrors || {})
      const msg = typeof apiErrors === "object"
        ? Object.entries(apiErrors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(" | ")
        : err.message
      toast.error(msg || "Erreur lors de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCellule(deleteTarget.id)
      toast.success("Cellule supprimée")
      setDeleteTarget(null)
      fetchCellules()
    } catch {
      toast.error("Erreur lors de la suppression")
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cellules</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestion des cellules de l organisation</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Rechercher..." className="input-field pl-9 w-56" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Ajouter cellule
          </button>
        </div>
      </div>

      {loading ? <Loader /> : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700">{error}</p>
          <button onClick={fetchCellules} className="mt-2 text-sm text-red-600 underline">Réessayer</button>
        </div>
      ) : cellules.length === 0 ? (
        <div className="card text-center py-12">
          <Building2 size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">Aucune cellule trouvée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cellules.map((c) => (
            <div key={c.id} className="group card bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.actif ? "bg-green-500 text-white" : "bg-orange-500 text-white"}`}>
                  {c.actif ? "Actif" : "Inactif"}
                </span>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Building2 size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 truncate pr-20">{c.nom_cellule}</h3>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                    {c.quartier && <span>📍 {c.quartier}</span>}
                    {c.commune && <span>🏙 {c.commune}</span>}
                    {c.responsable_nom && <span className="col-span-2">👤 <span className="font-medium">{c.responsable_nom}</span></span>}
                    <span className="col-span-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${c.nombre_membres > 0 ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                        {c.nombre_membres || 0} membre{c.nombre_membres !== 1 ? "s" : ""}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                <button onClick={() => openEdit(c)} className="p-2 bg-white text-blue-600 hover:shadow-md rounded-xl transition-all shadow-sm border border-gray-100">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => setDeleteTarget(c)} className="p-2 bg-white text-red-500 hover:shadow-md rounded-xl transition-all shadow-sm border border-gray-100">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-lg font-semibold">{editTarget ? "Modifier" : "Nouvelle"} cellule</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
                <input className="input-field" value={form.nom_cellule} onChange={(e) => setForm({ ...form, nom_cellule: e.target.value })} required placeholder="Ex: Cellule Centre" />
                {errors.nom_cellule && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.nom_cellule) ? errors.nom_cellule[0] : errors.nom_cellule}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
                  <input className="input-field" value={form.quartier} onChange={(e) => setForm({ ...form, quartier: e.target.value })} placeholder="Quartier" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
                  <input className="input-field" value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })} placeholder="Commune" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                <input className="input-field" value={form.departement} onChange={(e) => setForm({ ...form, departement: e.target.value })} placeholder="Tambacounda" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                <select className="input-field" value={form.responsable ?? ""} onChange={(e) => setForm({ ...form, responsable: e.target.value ? parseInt(e.target.value) : null })}>
                  <option value="">-- Sélectionner un responsable --</option>
                  {responsables.map((r) => (
                    <option key={r.id} value={r.id}>{r.prenom} {r.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description..." />
              </div>
              <div className="flex items-center gap-2">
                <input id="actif" type="checkbox" checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} className="h-4 w-4 text-green-600 border-gray-300 rounded" />
                <label htmlFor="actif" className="text-sm text-gray-700">Cellule active</label>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" disabled={saving}>Annuler</button>
                <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
                  {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {saving ? "Enregistrement..." : (editTarget ? "Enregistrer" : "Ajouter")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`Supprimer "${deleteTarget.nom_cellule}" ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
