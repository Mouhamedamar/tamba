import { useEffect, useState, useCallback } from 'react'
import { getMembres, getCellules, createMembre, updateMembre, deleteMembre } from '../services/api'
import Loader from '../components/Loader'
import ConfirmModal from '../components/ConfirmModal'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, X, Users, FileSpreadsheet, FileText } from 'lucide-react'
import * as XLSX from 'xlsx/dist/xlsx.full.min.js'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const ROLE_CHOICES = [
  { value: 'militant', label: 'Militant' },
  { value: 'responsable', label: 'Responsable terrain (membre)' },
]

const EMPTY_FORM = { 
  nom: '', prenom: '', telephone: '', quartier: '', cellule: '', role: 'militant',
  numero_identification: '', inscrit_liste_electorale: false, numero_carte_electeur: '',
  date_expiration_carte: '', centre_vote: '', bureau_vote: '', optin_pastef_infos: false 
}

export default function Membres() {
  const [membres, setMembres] = useState([])
  const [cellules, setCellules] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCellule, setFilterCellule] = useState('')
  const [filterQuartier, setFilterQuartier] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchMembres = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page,
        search: search || undefined,
        cellule: filterCellule || undefined,
        quartier__icontains: filterQuartier || undefined,
      }
      const { data } = await getMembres(params)
      const results = data.results ?? data
      setMembres(Array.isArray(results) ? results : [])
      if (data.count) setTotalPages(Math.ceil(data.count / 10))
    } catch {
      toast.error('Erreur lors du chargement des membres')
    } finally {
      setLoading(false)
    }
  }, [page, search, filterCellule, filterQuartier])

  useEffect(() => { fetchMembres() }, [fetchMembres])

  useEffect(() => {
    getCellules().then(({ data }) => {
      setCellules(Array.isArray(data) ? data : data.results ?? [])
    }).catch(() => {})
  }, [])

  const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (m) => {
    setEditTarget(m)
    setForm({
      nom: m.nom ?? '',
      prenom: m.prenom ?? '',
      telephone: m.telephone ?? '',
      quartier: m.quartier ?? '',
      numero_identification: m.numero_identification ?? '',
      inscrit_liste_electorale: m.inscrit_liste_electorale ?? false,
      numero_carte_electeur: m.numero_carte_electeur ?? '',
      date_expiration_carte: m.date_expiration_carte ? m.date_expiration_carte.split('T')[0] : '', // Format YYYY-MM-DD
      centre_vote: m.centre_vote ?? '',
      bureau_vote: m.bureau_vote ?? '',
      optin_pastef_infos: m.optin_pastef_infos ?? false,
      cellule: m.cellule ?? '',
      role: m.role ?? 'militant',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation du formulaire
    if (!form.nom.trim()) {
      toast.error('Le nom est obligatoire')
      return
    }
    if (!form.prenom.trim()) {
      toast.error('Le prénom est obligatoire')
      return
    }
    if (!form.telephone.trim()) {
      toast.error('Le téléphone est obligatoire')
      return
    }
    if (!form.quartier.trim()) {
      toast.error('Le quartier est obligatoire')
      return
    }
    if (!form.cellule) {
      toast.error('La cellule est obligatoire')
      return
    }
    
    setSaving(true)
    setErrors({}) // Reset errors before submit
    
    try {
      // Nettoyer les données avant envoi
      const cleanedForm = { ...form }
      
      // Traiter les champs optionnels - convertir les chaînes vides en null
      cleanedForm.date_expiration_carte = cleanedForm.date_expiration_carte ? cleanedForm.date_expiration_carte : null
      cleanedForm.centre_vote = cleanedForm.centre_vote && cleanedForm.centre_vote.trim() ? cleanedForm.centre_vote.trim() : null
      cleanedForm.bureau_vote = cleanedForm.bureau_vote && cleanedForm.bureau_vote.trim() ? cleanedForm.bureau_vote.trim() : null
      cleanedForm.numero_identification = cleanedForm.numero_identification && cleanedForm.numero_identification.trim() ? cleanedForm.numero_identification.trim() : null
      cleanedForm.numero_carte_electeur = cleanedForm.numero_carte_electeur && cleanedForm.numero_carte_electeur.trim() ? cleanedForm.numero_carte_electeur.trim() : null
      
      // Convertir cellule en nombre si présente
      const payload = {
        nom: cleanedForm.nom.trim(),
        prenom: cleanedForm.prenom.trim(),
        telephone: cleanPhone(cleanedForm.telephone),
        quartier: cleanedForm.quartier.trim(),
        cellule: cleanedForm.cellule ? parseInt(cleanedForm.cellule, 10) : null,
        role: cleanedForm.role,
        numero_identification: cleanedForm.numero_identification,
        inscrit_liste_electorale: cleanedForm.inscrit_liste_electorale,
        numero_carte_electeur: cleanedForm.numero_carte_electeur,
        date_expiration_carte: cleanedForm.date_expiration_carte,
        centre_vote: cleanedForm.centre_vote,
        bureau_vote: cleanedForm.bureau_vote,
        optin_pastef_infos: cleanedForm.optin_pastef_infos,
      }
      
      // Log pour debugging
      console.log('📤 Payload envoyé:', JSON.stringify(payload, null, 2))
      
      if (editTarget) {
        // Mise à jour
        const response = await updateMembre(editTarget.id, payload)
        console.log('✅ Réponse de mise à jour:', response.data)
        toast.success('Membre modifié avec succès ✓')
      } else {
        // Création
        const response = await createMembre(payload)
        console.log('✅ Réponse de création:', response.data)
        toast.success('Membre ajouté avec succès ✓')
        if (payload.role === 'responsable') {
          toast('Pour l\'assigner comme responsable de cellule, cree aussi un compte dans "Utilisateurs System".', {
            icon: 'ℹ️',
          })
        }
      }
      
      // Fermer le modal et rafraîchir
      setShowModal(false)
      await fetchMembres()
    } catch (err) {
      console.error('❌ Erreur complète:', err)
      const apiErrors = err.response?.data
      
      if (apiErrors) {
        setErrors(apiErrors)
        if (typeof apiErrors === 'object') {
          const messages = Object.entries(apiErrors)
            .map(([field, msgs]) => {
              const msgText = Array.isArray(msgs) ? msgs.join(', ') : msgs
              return `${field}: ${msgText}`
            })
            .join(' | ')
          toast.error('❌ ' + messages)
        } else {
          toast.error('❌ Erreur lors de la sauvegarde')
        }
      } else {
        toast.error('❌ Erreur lors de la sauvegarde: ' + (err.message || 'Erreur inconnue'))
      }
    } finally {
      setSaving(false)
    }
  }

  const formatPhone = (value) => {
    // Extraire uniquement les chiffres
    const phone = value.replace(/[^0-9]/g, '')
    // Formater pour affichage
    if (phone.startsWith('77') || phone.startsWith('76') || phone.startsWith('78')) {
      return phone.replace(/^(\d{2})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4')
    }
    return phone
  }

  const cleanPhone = (value) => {
    // Retirer tous les caractères non numériques pour l'envoi
    return value.replace(/[^0-9]/g, '')
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value)
    setForm({ ...form, telephone: formatted })
  }

  const handleDelete = async () => {
    try {
      await deleteMembre(deleteTarget.id)
      toast.success('Membre supprimé')
      setDeleteTarget(null)
      fetchMembres()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const buildExportRows = () => membres.map((m) => ({
    'Nom complet': m.full_name || `${m.prenom || ''} ${m.nom || ''}`.trim(),
    Téléphone: m.telephone || '',
    Quartier: m.quartier || '',
    Cellule: m.cellule_nom || '',
    Rôle: m.role === 'responsable' ? 'Responsable' : 'Militant',
  }))

  const handleExportExcel = () => {
    if (!membres.length) {
      toast.error('Aucun membre à exporter')
      return
    }

    const worksheet = XLSX.utils.json_to_sheet(buildExportRows())
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Membres')
    XLSX.writeFile(workbook, `membres_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const handleExportPdf = () => {
    if (!membres.length) {
      toast.error('Aucun membre à exporter')
      return
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
    doc.setFontSize(16)
    doc.text('Liste des membres', 40, 40)

    const rows = membres.map((m) => [
      m.full_name || `${m.prenom || ''} ${m.nom || ''}`.trim(),
      m.telephone || '',
      m.quartier || '',
      m.cellule_nom || '',
      m.role === 'responsable' ? 'Responsable' : 'Militant',
    ])

    doc.autoTable({
      head: [['Nom complet', 'Téléphone', 'Quartier', 'Cellule', 'Rôle']],
      body: rows,
      startY: 60,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 6 },
    })

    doc.save(`membres_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Membres</h1>
          <p className="text-gray-500 text-base mt-0.5">Gestion des membres de l'organisation</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Ajouter un membre
          </button>
          <button type="button" onClick={handleExportExcel} className="btn-secondary flex items-center gap-2">
            <FileSpreadsheet size={18} /> Exporter Excel
          </button>
          <button type="button" onClick={handleExportPdf} className="btn-secondary flex items-center gap-2">
            <FileText size={18} /> Exporter PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom..."
              className="input-field pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select
            className="input-field"
            value={filterCellule}
            onChange={(e) => { setFilterCellule(e.target.value); setPage(1) }}
          >
            <option value="">Toutes les cellules</option>
            {cellules.map((c) => (
              <option key={c.id} value={c.id}>{c.nom_cellule}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Filtrer par quartier..."
            className="input-field"
            value={filterQuartier}
            onChange={(e) => { setFilterQuartier(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <Loader />
        ) : membres.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucun membre trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
{['Nom complet', 'Téléphone', 'Quartier', 'N° ID', 'Électeur', 'Carte', 'Cellule', 'Rôle', 'Actions'].map((h) => (
                    <th key={h} className="table-header text-left">{h}</th>
                  ))}

                </tr>
              </thead>
              <tbody>
                {membres.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{m.full_name || `${m.prenom} ${m.nom}`}</td>
                    <td className="table-cell">{m.telephone || '—'}</td>
                    <td className="table-cell">{m.quartier || '—'}</td>
                    <td className="table-cell">{m.numero_identification || '—'}</td>
                    <td className="table-cell">{m.inscrit_liste_electorale ? 'Oui' : 'Non'}</td>
                    <td className="table-cell">{m.numero_carte_electeur || '—'}</td>
                    <td className="table-cell">{m.cellule_nom || '—'}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        m.role === 'responsable' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {m.role === 'responsable' ? 'Responsable' : 'Militant'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(m)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(m)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
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
            <p className="text-base text-gray-500">Page {page} sur {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                {editTarget ? 'Modifier le membre' : 'Ajouter un membre'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">👤 Informations personnelles</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    className="input-field" 
                    placeholder="Ex: Ahmed"
                    value={form.prenom} 
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })} 
                    required 
                  />
                  {errors.prenom && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.prenom) ? errors.prenom[0] : errors.prenom}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    className="input-field" 
                    placeholder="Ex: Diallo"
                    value={form.nom} 
                    onChange={(e) => setForm({ ...form, nom: e.target.value })} 
                    required 
                  />
                  {errors.nom && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.nom) ? errors.nom[0] : errors.nom}</p>}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">📱 Contact & Localisation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone <span className="text-red-500">*</span></label>
                  <input 
                    className="input-field" 
                    value={form.telephone} 
                    onChange={handlePhoneChange} 
                    required 
                    placeholder="77 123 45 67"
                  />
                  {errors.telephone && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.telephone) ? errors.telephone[0] : errors.telephone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    {ROLE_CHOICES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  {form.role === 'responsable' && (
                    <p className="text-xs text-amber-600 mt-1">
                      Ce role concerne les membres. Le responsable de cellule doit etre un utilisateur systeme.
                    </p>
                  )}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">🏠 Localisation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quartier <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    className="input-field" 
                    placeholder="Ex: Centre ville"
                    value={form.quartier} 
                    onChange={(e) => setForm({ ...form, quartier: e.target.value })} 
                    required 
                  />
                  {errors.quartier && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.quartier) ? errors.quartier[0] : errors.quartier}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cellule <span className="text-red-500">*</span></label>
                  <select 
                    className="input-field" 
                    value={form.cellule} 
                    onChange={(e) => setForm({ ...form, cellule: e.target.value })} 
                    required
                  >
                    <option value="">— Choisir une cellule —</option>
                    {cellules.map((c) => <option key={c.id} value={c.id}>{c.nom_cellule}</option>)}
                  </select>
                  {errors.cellule && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.cellule) ? errors.cellule[0] : errors.cellule}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° Identification</label>
                <input 
                  type="text"
                  className="input-field" 
                  placeholder="Numéro CNI/BIR"
                  value={form.numero_identification} 
                  onChange={(e) => setForm({ ...form, numero_identification: e.target.value })} 
                />
              </div>

              <div className="flex items-center">
                <input
                  id="inscrit_liste"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  checked={form.inscrit_liste_electorale}
                  onChange={(e) => setForm({ ...form, inscrit_liste_electorale: e.target.checked })}
                />
                <label htmlFor="inscrit_liste" className="ml-2 block text-sm font-medium text-gray-700">
                  Inscrit liste électorale
                </label>
              </div>

              {form.inscrit_liste_electorale && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">N° Carte électeur</label>
                      <input 
                        type="text"
                        className="input-field" 
                        placeholder="Numéro de carte"
                        value={form.numero_carte_electeur || ''} 
                        onChange={(e) => setForm({ ...form, numero_carte_electeur: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date expiration</label>
                      <input 
                        type="date" 
                        className="input-field" 
                        value={form.date_expiration_carte || ''} 
                        onChange={(e) => setForm({ ...form, date_expiration_carte: e.target.value })} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Centre de vote</label>
                      <input 
                        type="text"
                        className="input-field" 
                        placeholder="Ex: Lycée Cheikh Anta Diop"
                        value={form.centre_vote || ''} 
                        onChange={(e) => setForm({ ...form, centre_vote: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bureau de vote</label>
                      <input 
                        type="text"
                        className="input-field" 
                        placeholder="Bureau n°X"
                        value={form.bureau_vote || ''} 
                        onChange={(e) => setForm({ ...form, bureau_vote: e.target.value })} 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <input
                  id="optin_pastef"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  checked={form.optin_pastef_infos}
                  onChange={(e) => setForm({ ...form, optin_pastef_infos: e.target.checked })}
                />
                <label htmlFor="optin_pastef" className="ml-2 block text-sm font-medium text-gray-700">
                  Recevoir infos PASTEF & processus électoraux
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {editTarget ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`Supprimer ${deleteTarget.prenom} ${deleteTarget.nom} ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
