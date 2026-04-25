import { useEffect, useState, useCallback } from "react"
import { getCellules, getCellule, createCellule, updateCellule, deleteCellule, getMembres } from "../services/api"
import Loader from "../components/Loader"
import ConfirmModal from "../components/ConfirmModal"
import toast from "react-hot-toast"
import { Plus, Edit2, Trash2, Building2, X, Search, Users, MapPin, CheckCircle2 } from "lucide-react"

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
      setResponsables(Array.isArray(data) ? data : (data.results || []))
    } catch {}
  }, [])

  const fetchCellules = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await getCellules({ search: search || undefined })
      setCellules(data.results ? data.results : (Array.isArray(data) ? data : []))
    } catch (err) {
      setError(err.message || "Erreur lors du chargement")
      toast.error("Erreur lors du chargement des cellules")
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchCellules(); fetchResponsables() }, [fetchCellules, fetchResponsables])

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setErrors({}); setShowModal(true) }

  const openEdit = async (c) => {
    try {
      const { data } = await getCellule(c.id)
      setEditTarget(data)
      setForm({
        nom_cellule: data.nom_cellule ?? "", description: data.description ?? "",
        quartier: data.quartier ?? "", commune: data.commune ?? "",
        departement: data.departement ?? "Tambacounda", actif: data.actif ?? true,
        responsable: data.responsable ?? null,
      })
      setErrors({})
      setShowModal(true)
    } catch { toast.error("Impossible de charger la cellule") }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form }
    if (!payload.responsable) delete payload.responsable
    try {
      if (editTarget) {
        await updateCellule(editTarget.id, payload)
        toast.success("Cellule modifiee avec succes")
      } else {
        await createCellule(payload)
        toast.success("Cellule creee avec succes")
      }
      setShowModal(false)
      fetchCellules()
    } catch (err) {
      const apiErrors = err.response?.data
      setErrors(apiErrors || {})
      const msg = typeof apiErrors === "object"
        ? Object.entries(apiErrors).map(([k, v]) => k + ": " + (Array.isArray(v) ? v[0] : v)).join(" | ")
        : err.message
      toast.error(msg || "Erreur lors de la sauvegarde")
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await deleteCellule(deleteTarget.id)
      toast.success("Cellule supprimee")
      setDeleteTarget(null)
      fetchCellules()
    } catch { toast.error("Erreur lors de la suppression") }
  }

  const totalMembres = cellules.reduce((acc, c) => acc + (c.nombre_membres || 0), 0)
  const actives = cellules.filter(c => c.actif).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cellules</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestion des cellules de l organisation</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher..." className="input-field pl-9 w-52"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Ajouter cellule
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><Building2 size={18} className="text-green-600" /></div>
          <div><p className="text-xs text-gray-500">Total cellules</p><p className="text-xl font-bold text-gray-800">{cellules.length}</p></div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><CheckCircle2 size={18} className="text-emerald-600" /></div>
          <div><p className="text-xs text-gray-500">Actives</p><p className="text-xl font-bold text-gray-800">{actives}</p></div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Users size={18} className="text-blue-600" /></div>
          <div><p className="text-xs text-gray-500">Total membres</p><p className="text-xl font-bold text-gray-800">{totalMembres}</p></div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><MapPin size={18} className="text-purple-600" /></div>
          <div><p className="text-xs text-gray-500">Avec responsable</p><p className="text-xl font-bold text-gray-800">{cellules.filter(c => c.responsable_nom).length}</p></div>
        </div>
      </div>

      {/* Grid */}
      {loading ? <Loader /> : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700">{error}</p>
          <button onClick={fetchCellules} className="mt-2 text-sm text-red-600 underline">Reessayer</button>
        </div>
      ) : cellules.length === 0 ? (
        <div className="card text-center py-16">
          <Building2 size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">Aucune cellule trouvee</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {cellules.map((c) => (
            <div key={c.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              {/* Card top color bar */}
              <div className={"h-1.5 w-full " + (c.actif ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-orange-400 to-red-400")} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                      <Building2 size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight">{c.nom_cellule}</h3>
                      <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 " + (c.actif ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700")}>
                        {c.actif ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={15} /></button>
                    <button onClick={() => setDeleteTarget(c)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {(c.quartier || c.commune) && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                      <span>{[c.quartier, c.commune, c.departement].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                  {c.responsable_nom && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 text-xs font-bold">{c.responsable_nom[0]}</span>
                      </div>
                      <span className="font-medium text-gray-700">{c.responsable_nom}</span>
                    </div>
                  )}
                  {c.description && (
                    <p className="text-gray-400 text-xs line-clamp-2">{c.description}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <span className={"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold " + (c.nombre_membres > 0 ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500")}>
                    <Users size={11} />
                    {c.nombre_membres || 0} membre{c.nombre_membres !== 1 ? "s" : ""}
                  </span>
                  <div className="flex gap-1 sm:hidden">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={15} /></button>
                    <button onClick={() => setDeleteTarget(c)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Building2 size={20} className="text-white" /></div>
                  <div>
                    <h2 className="text-white font-bold text-lg">{editTarget ? "Modifier" : "Nouvelle"} cellule</h2>
                    <p className="text-green-100 text-xs">Remplissez les informations de la cellule</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><X size={20} /></button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom <span className="text-red-500">*</span></label>
                <input className="input-field" value={form.nom_cellule} onChange={(e) => setForm({ ...form, nom_cellule: e.target.value })} required placeholder="Ex: Cellule Centre" />
                {errors.nom_cellule && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.nom_cellule) ? errors.nom_cellule[0] : errors.nom_cellule}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Quartier</label>
                  <input className="input-field" value={form.quartier} onChange={(e) => setForm({ ...form, quartier: e.target.value })} placeholder="Quartier" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Commune</label>
                  <input className="input-field" value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })} placeholder="Commune" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Departement</label>
                <input className="input-field" value={form.departement} onChange={(e) => setForm({ ...form, departement: e.target.value })} placeholder="Tambacounda" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Responsable</label>
                <select className="input-field" value={form.responsable ?? ""} onChange={(e) => setForm({ ...form, responsable: e.target.value ? parseInt(e.target.value) : null })}>
                  <option value="">-- Selectionner un responsable --</option>
                  {responsables.map((r) => <option key={r.id} value={r.id}>{r.prenom} {r.nom}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea className="input-field resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description..." />
              </div>

              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setForm({ ...form, actif: !form.actif })}>
                <div className={"relative w-11 h-6 rounded-full transition-colors duration-200 " + (form.actif ? "bg-green-500" : "bg-gray-300")}>
                  <div className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 " + (form.actif ? "translate-x-5" : "")} />
                </div>
                <span className="text-sm font-medium text-gray-700">{form.actif ? "Cellule active" : "Cellule inactive"}</span>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
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
          message={"Supprimer \"" + deleteTarget.nom_cellule + "\" ? Cette action est irreversible."}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
