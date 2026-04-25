import { useEffect, useState, useCallback } from 'react'
import { getMembres, getCellules, createMembre, updateMembre, deleteMembre } from '../services/api'
import Loader from '../components/Loader'
import ConfirmModal from '../components/ConfirmModal'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, X, Users, FileSpreadsheet, FileText, User, Phone, MapPin, Building2, CreditCard, CheckCircle2, Bell } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const ROLE_CHOICES = [
  { value: 'militant', label: 'Militant' },
  { value: 'responsable', label: 'Responsable' },
]

const EMPTY_FORM = {
  nom: '', prenom: '', telephone: '', quartier: '', cellule: '', role: 'militant',
  numero_identification: '', inscrit_liste_electorale: false, numero_carte_electeur: '',
  date_expiration_carte: '', centre_vote: '', bureau_vote: '', optin_pastef_infos: false
}

const cleanPhone = (v) => v.replace(/[^0-9]/g, '')

export default function Membres() {
  const [membres, setMembres] = useState([])
  const [allMembres, setAllMembres] = useState([])
  const [cellules, setCellules] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCellule, setFilterCellule] = useState('')
  const [filterQuartier, setFilterQuartier] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchMembres = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, search: search || undefined, cellule: filterCellule || undefined, quartier__icontains: filterQuartier || undefined }
      const { data } = await getMembres(params)
      const results = data.results ?? data
      setMembres(Array.isArray(results) ? results : [])
      if (data.count !== undefined) { setTotal(data.count); setTotalPages(Math.ceil(data.count / 10)) }
    } catch { toast.error('Erreur lors du chargement des membres') }
    finally { setLoading(false) }
  }, [page, search, filterCellule, filterQuartier])

  const fetchAll = useCallback(async () => {
    try {
      const { data } = await getMembres({ page_size: 10000 })
      setAllMembres(data.results ?? data)
    } catch {}
  }, [])

  useEffect(() => { fetchMembres() }, [fetchMembres])
  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => {
    getCellules().then(({ data }) => setCellules(Array.isArray(data) ? data : data.results ?? [])).catch(() => {})
  }, [])

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setErrors({}); setShowModal(true) }
  const openEdit = (m) => {
    setEditTarget(m)
    setForm({
      nom: m.nom ?? '', prenom: m.prenom ?? '', telephone: m.telephone ?? '',
      quartier: m.quartier ?? '', cellule: m.cellule ?? '', role: m.role ?? 'militant',
      numero_identification: m.numero_identification ?? '',
      inscrit_liste_electorale: m.inscrit_liste_electorale ?? false,
      numero_carte_electeur: m.numero_carte_electeur ?? '',
      date_expiration_carte: m.date_expiration_carte ? m.date_expiration_carte.split('T')[0] : '',
      centre_vote: m.centre_vote ?? '', bureau_vote: m.bureau_vote ?? '',
      optin_pastef_infos: m.optin_pastef_infos ?? false,
    })
    setErrors({})
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const payload = {
        ...form,
        telephone: cleanPhone(form.telephone),
        cellule: form.cellule ? parseInt(form.cellule, 10) : null,
        date_expiration_carte: form.date_expiration_carte || null,
        centre_vote: form.centre_vote || null,
        bureau_vote: form.bureau_vote || null,
        numero_identification: form.numero_identification || null,
        numero_carte_electeur: form.numero_carte_electeur || null,
      }
      if (editTarget) {
        await updateMembre(editTarget.id, payload)
        toast.success('Membre modifie avec succes')
      } else {
        await createMembre(payload)
        toast.success('Membre ajoute avec succes')
      }
      setShowModal(false)
      fetchMembres()
      fetchAll()
    } catch (err) {
      const apiErrors = err.response?.data
      if (apiErrors && typeof apiErrors === 'object') {
        setErrors(apiErrors)
        const msg = Object.entries(apiErrors).map(([k, v]) => k + ': ' + (Array.isArray(v) ? v[0] : v)).join(' | ')
        toast.error(msg)
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await deleteMembre(deleteTarget.id)
      toast.success('Membre supprime')
      setDeleteTarget(null)
      fetchMembres()
      fetchAll()
    } catch { toast.error('Erreur lors de la suppression') }
  }

  const exportExcel = () => {
    if (!allMembres.length) return toast.error('Aucun membre a exporter')
    const rows = allMembres.map(m => ({
      'Prenom': m.prenom, 'Nom': m.nom, 'Telephone': m.telephone,
      'Quartier': m.quartier, 'Cellule': m.cellule_nom || '',
      'Role': m.role === 'responsable' ? 'Responsable' : 'Militant',
      'N ID': m.numero_identification || '', 'Electeur': m.inscrit_liste_electorale ? 'Oui' : 'Non',
      'N Carte': m.numero_carte_electeur || '', 'Centre vote': m.centre_vote || '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Membres')
    XLSX.writeFile(wb, 'membres.xlsx')
    toast.success('Export Excel reussi')
  }

  const exportPDF = () => {
    if (!allMembres.length) return toast.error('Aucun membre a exporter')
    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(16)
    doc.text('Liste des Membres', 14, 15)
    doc.setFontSize(10)
    doc.text('Total: ' + allMembres.length, 14, 22)
    autoTable(doc, {
      startY: 28,
      head: [['Nom complet', 'Telephone', 'Quartier', 'Cellule', 'Role', 'Electeur']],
      body: allMembres.map(m => [
        (m.prenom + ' ' + m.nom), m.telephone, m.quartier,
        m.cellule_nom || '', m.role === 'responsable' ? 'Responsable' : 'Militant',
        m.inscrit_liste_electorale ? 'Oui' : 'Non'
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 163, 74] },
      alternateRowStyles: { fillColor: [240, 253, 244] },
    })
    doc.save('membres.pdf')
    toast.success('Export PDF reussi')
  }

  const initials = (m) => ((m.prenom?.[0] || '') + (m.nom?.[0] || '')).toUpperCase()

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Membres</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestion des membres de l organisation</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={exportExcel} className="flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-xl text-sm transition-colors border border-emerald-200">
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-xl text-sm transition-colors border border-red-200">
            <FileText size={16} /> PDF
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Ajouter un membre
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><Users size={18} className="text-green-600" /></div>
          <div><p className="text-xs text-gray-500">Total</p><p className="text-xl font-bold text-gray-800">{total}</p></div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><User size={18} className="text-purple-600" /></div>
          <div><p className="text-xs text-gray-500">Responsables</p><p className="text-xl font-bold text-gray-800">{allMembres.filter(m => m.role === 'responsable').length}</p></div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><CheckCircle2 size={18} className="text-blue-600" /></div>
          <div><p className="text-xs text-gray-500">Electeurs</p><p className="text-xl font-bold text-gray-800">{allMembres.filter(m => m.inscrit_liste_electorale).length}</p></div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><Bell size={18} className="text-orange-600" /></div>
          <div><p className="text-xs text-gray-500">Optin PASTEF</p><p className="text-xl font-bold text-gray-800">{allMembres.filter(m => m.optin_pastef_infos).length}</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher par nom..." className="input-field pl-9"
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="input-field" value={filterCellule} onChange={(e) => { setFilterCellule(e.target.value); setPage(1) }}>
            <option value="">Toutes les cellules</option>
            {cellules.map((c) => <option key={c.id} value={c.id}>{c.nom_cellule}</option>)}
          </select>
          <input type="text" placeholder="Filtrer par quartier..." className="input-field"
            value={filterQuartier} onChange={(e) => { setFilterQuartier(e.target.value); setPage(1) }} />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? <Loader /> : membres.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucun membre trouve</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Membre', 'Contact', 'Cellule', 'Role', 'Electeur', 'Actions'].map(h => (
                    <th key={h} className="table-header text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {membres.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {initials(m)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{m.full_name || (m.prenom + ' ' + m.nom)}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} />{m.quartier || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <p className="flex items-center gap-1 text-sm"><Phone size={12} className="text-gray-400" />{m.telephone || '—'}</p>
                      {m.numero_identification && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><CreditCard size={10} />{m.numero_identification}</p>}
                    </td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1 text-sm"><Building2 size={12} className="text-gray-400" />{m.cellule_nom || '—'}</span>
                    </td>
                    <td className="table-cell">
                      <span className={"inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold " + (m.role === 'responsable' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700')}>
                        {m.role === 'responsable' ? 'Responsable' : 'Militant'}
                      </span>
                    </td>
                    <td className="table-cell">
                      {m.inscrit_liste_electorale ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <CheckCircle2 size={11} /> Inscrit
                          </span>
                          {m.numero_carte_electeur && <p className="text-xs text-gray-400 mt-0.5">{m.numero_carte_electeur}</p>}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Non inscrit</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(m)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={15} /></button>
                        <button onClick={() => setDeleteTarget(m)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">{total} membres - Page {page} sur {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/15" style={{backgroundColor: 'rgba(10,20,15,0.97)'}}>
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Users size={20} className="text-white" /></div>
                  <div>
                    <h2 className="text-white font-bold text-lg">{editTarget ? 'Modifier le membre' : 'Ajouter un membre'}</h2>
                    <p className="text-green-100 text-xs">Remplissez les informations du membre</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><X size={20} /></button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Identite */}
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2"><User size={13} /> Identite</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Prenom <span className="text-red-400">*</span></label>
                    <input className="input-field" placeholder="Prenom" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} required />
                    {errors.prenom && <p className="text-red-400 text-xs mt-1">{Array.isArray(errors.prenom) ? errors.prenom[0] : errors.prenom}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Nom <span className="text-red-400">*</span></label>
                    <input className="input-field" placeholder="Nom" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required />
                    {errors.nom && <p className="text-red-400 text-xs mt-1">{Array.isArray(errors.nom) ? errors.nom[0] : errors.nom}</p>}
                  </div>
                </div>
              </div>

              {/* Contact & Localisation */}
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2"><Phone size={13} /> Contact et Localisation</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Telephone <span className="text-red-400">*</span></label>
                    <input className="input-field" placeholder="77 123 45 67" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} required />
                    {errors.telephone && <p className="text-red-400 text-xs mt-1">{Array.isArray(errors.telephone) ? errors.telephone[0] : errors.telephone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Quartier <span className="text-red-400">*</span></label>
                    <input className="input-field" placeholder="Quartier" value={form.quartier} onChange={e => setForm({ ...form, quartier: e.target.value })} required />
                  </div>
                </div>
              </div>

              {/* Cellule & Role */}
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2"><Building2 size={13} /> Cellule et Role</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Cellule <span className="text-red-400">*</span></label>
                    <select className="input-field" value={form.cellule} onChange={e => setForm({ ...form, cellule: e.target.value })} required>
                      <option value="" style={{backgroundColor:'#0a1410'}}>-- Choisir --</option>
                      {cellules.map(c => <option key={c.id} value={c.id} style={{backgroundColor:'#0a1410'}}>{c.nom_cellule}</option>)}
                    </select>
                    {errors.cellule && <p className="text-red-400 text-xs mt-1">{Array.isArray(errors.cellule) ? errors.cellule[0] : errors.cellule}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Role</label>
                    <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                      {ROLE_CHOICES.map(r => <option key={r.value} value={r.value} style={{backgroundColor:'#0a1410'}}>{r.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Identification */}
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2"><CreditCard size={13} /> Identification</p>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">N Identification (CNI/BIR)</label>
                  <input className="input-field" placeholder="Numero CNI ou BIR" value={form.numero_identification} onChange={e => setForm({ ...form, numero_identification: e.target.value })} />
                </div>
              </div>

              {/* Liste electorale */}
              <div className="rounded-xl p-4 space-y-4 border border-white/10" style={{backgroundColor:'rgba(255,255,255,0.05)'}}>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2"><CheckCircle2 size={13} /> Liste Electorale</p>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setForm({ ...form, inscrit_liste_electorale: !form.inscrit_liste_electorale })}>
                  <div className={"relative w-11 h-6 rounded-full transition-colors duration-200 " + (form.inscrit_liste_electorale ? "bg-green-500" : "bg-white/20")}>
                    <div className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 " + (form.inscrit_liste_electorale ? "translate-x-5" : "")} />
                  </div>
                  <span className="text-sm font-medium text-white/80">{form.inscrit_liste_electorale ? "Inscrit sur la liste electorale" : "Non inscrit sur la liste electorale"}</span>
                </div>
                {form.inscrit_liste_electorale && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1.5">N Carte electeur</label>
                        <input className="input-field" placeholder="Numero carte" value={form.numero_carte_electeur} onChange={e => setForm({ ...form, numero_carte_electeur: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1.5">Date expiration</label>
                        <input type="date" className="input-field" value={form.date_expiration_carte} onChange={e => setForm({ ...form, date_expiration_carte: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1.5">Centre de vote</label>
                        <input className="input-field" placeholder="Ex: Lycee Cheikh Anta Diop" value={form.centre_vote} onChange={e => setForm({ ...form, centre_vote: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1.5">Bureau de vote</label>
                        <input className="input-field" placeholder="Bureau n X" value={form.bureau_vote} onChange={e => setForm({ ...form, bureau_vote: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Optin */}
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setForm({ ...form, optin_pastef_infos: !form.optin_pastef_infos })}>
                <div className={"relative w-11 h-6 rounded-full transition-colors duration-200 " + (form.optin_pastef_infos ? "bg-green-500" : "bg-white/20")}>
                  <div className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 " + (form.optin_pastef_infos ? "translate-x-5" : "")} />
                </div>
                <span className="text-sm font-medium text-white/80">Recevoir infos PASTEF et elections</span>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 size={16} />}
                  {saving ? 'Enregistrement...' : (editTarget ? 'Enregistrer' : 'Ajouter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={"Supprimer " + deleteTarget.prenom + " " + deleteTarget.nom + " ? Cette action est irreversible."}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
