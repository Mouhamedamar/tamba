import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { getToken } from "../utils/auth"
import Loader from "../components/Loader"
import ConfirmModal from "../components/ConfirmModal"
import toast from "react-hot-toast"
import { Plus, Trash2, Search, ChevronLeft, ChevronRight, X, Vote, User, Phone, MapPin, CreditCard, CheckCircle2, Pencil, FileSpreadsheet, FileText } from "lucide-react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : '/api'
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` })
const apiGet = (url) => axios.get(BASE + url, { headers: authHeader() })
const apiPost = (url, data) => axios.post(BASE + url, data, { headers: authHeader() })
const apiPut = (url, data) => axios.put(BASE + url, data, { headers: authHeader() })
const apiDelete = (url) => axios.delete(BASE + url, { headers: authHeader() })

const EMPTY = { nom: "", prenom: "", quartier: "", annee_naissance: "", telephone: "", a_nin: false, numero_nin: "" }
const ANNEES = Array.from({ length: 21 }, (_, i) => 2025 - 18 - i)
const age = (annee) => new Date().getFullYear() - annee

export default function PrimoVotants() {
  const [list, setList] = useState([])
  const [allData, setAllData] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await apiGet("/primo-votants/?page=" + page + "&search=" + search)
      setList(data.results ?? data)
      if (data.count !== undefined) {
        setTotal(data.count)
        setTotalPages(Math.ceil(data.count / 10))
      }
    } catch { toast.error("Erreur chargement") }
    finally { setLoading(false) }
  }, [page, search])

  const fetchAll = useCallback(async () => {
    try {
      const { data } = await apiGet("/primo-votants/?page_size=10000")
      setAllData(data.results ?? data)
    } catch {}
  }, [])

  useEffect(() => { fetchList(); fetchAll() }, [fetchList, fetchAll])

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setShowModal(true) }
  const openEdit = (p) => {
    setEditTarget(p)
    setForm({ nom: p.nom, prenom: p.prenom, quartier: p.quartier, annee_naissance: p.annee_naissance, telephone: p.telephone, a_nin: p.a_nin, numero_nin: p.numero_nin || "" })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, annee_naissance: parseInt(form.annee_naissance), numero_nin: form.a_nin ? form.numero_nin : "" }
      if (editTarget) {
        await apiPut("/primo-votants/" + editTarget.id + "/", payload)
        toast.success("Modifie avec succes !")
      } else {
        await apiPost("/primo-votants/", payload)
        toast.success("Primo votant ajoute !")
      }
      setShowModal(false)
      setForm(EMPTY)
      fetchList()
      fetchAll()
    } catch (err) {
      const errors = err.response?.data
      const msg = errors ? Object.values(errors).flat().join(" ") : "Erreur"
      toast.error(msg)
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await apiDelete("/primo-votants/" + deleteTarget.id + "/")
      toast.success("Supprime")
      setDeleteTarget(null)
      fetchList()
      fetchAll()
    } catch { toast.error("Erreur suppression") }
  }

  const exportExcel = () => {
    const rows = allData.map(p => ({
      "Prenom": p.prenom, "Nom": p.nom, "Quartier": p.quartier,
      "Annee naissance": p.annee_naissance, "Age": age(p.annee_naissance),
      "Telephone": p.telephone, "A un NIN": p.a_nin ? "Oui" : "Non", "Numero NIN": p.numero_nin || "",
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Primo Votants")
    XLSX.writeFile(wb, "primo_votants.xlsx")
    toast.success("Export Excel reussi !")
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Liste des Primo Votants", 14, 15)
    doc.setFontSize(10)
    doc.text("Total: " + allData.length, 14, 22)
    autoTable(doc, {
      startY: 28,
      head: [["Prenom", "Nom", "Quartier", "Annee", "Age", "Telephone", "NIN"]],
      body: allData.map(p => [p.prenom, p.nom, p.quartier, p.annee_naissance, age(p.annee_naissance), p.telephone, p.a_nin ? p.numero_nin : "Non"]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 163, 74] },
      alternateRowStyles: { fillColor: [240, 253, 244] },
    })
    doc.save("primo_votants.pdf")
    toast.success("Export PDF reussi !")
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Primo Votants</h1>
          <p className="text-gray-500 text-sm mt-0.5">Jeunes citoyens primo votants enregistres</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={exportExcel} className="flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-xl text-sm transition-colors border border-emerald-200">
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-xl text-sm transition-colors border border-red-200">
            <FileText size={16} /> PDF
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Ajouter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"><Vote size={22} className="text-green-600" /></div>
          <div><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold text-gray-800">{total}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"><CreditCard size={22} className="text-blue-600" /></div>
          <div><p className="text-sm text-gray-500">Avec NIN</p><p className="text-2xl font-bold text-gray-800">{allData.filter(p => p.a_nin).length}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center"><User size={22} className="text-orange-600" /></div>
          <div><p className="text-sm text-gray-500">Sans NIN</p><p className="text-2xl font-bold text-gray-800">{allData.filter(p => !p.a_nin).length}</p></div>
        </div>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher par nom, quartier..." className="input-field pl-9"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? <Loader /> : list.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Vote size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucun primo votant trouve</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>{["Nom complet", "Quartier", "Age", "Telephone", "NIN", "Actions"].map(h => <th key={h} className="table-header text-left">{h}</th>)}</tr>
              </thead>
              <tbody>
                {list.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs flex-shrink-0">
                          {p.prenom[0]}{p.nom[0]}
                        </div>
                        <span className="font-medium">{p.prenom} {p.nom}</span>
                      </div>
                    </td>
                    <td className="table-cell"><span className="flex items-center gap-1"><MapPin size={13} className="text-gray-400" />{p.quartier}</span></td>
                    <td className="table-cell"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{age(p.annee_naissance)} ans ({p.annee_naissance})</span></td>
                    <td className="table-cell"><span className="flex items-center gap-1"><Phone size={13} className="text-gray-400" />{p.telephone}</span></td>
                    <td className="table-cell">
                      {p.a_nin
                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 size={11} />{p.numero_nin}</span>
                        : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Sans NIN</span>}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={15} /></button>
                        <button onClick={() => setDeleteTarget(p)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
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
            <p className="text-sm text-gray-500">{total} resultats - Page {page} sur {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/15" style={{backgroundColor: 'rgba(10,20,15,0.97)'}}>
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Vote size={20} className="text-white" /></div>
                  <div>
                    <h2 className="text-white font-bold text-lg">{editTarget ? "Modifier" : "Nouveau"} Primo Votant</h2>
                    <p className="text-green-100 text-xs">Remplissez les informations du jeune citoyen</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><X size={20} /></button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2"><User size={13} /> Identite</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Prenom <span className="text-red-400">*</span></label>
                    <input className="input-field" placeholder="Prenom" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Nom <span className="text-red-400">*</span></label>
                    <input className="input-field" placeholder="Nom de famille" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2"><MapPin size={13} /> Localisation et Contact</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Quartier <span className="text-red-400">*</span></label>
                    <input className="input-field" placeholder="Quartier de residence" value={form.quartier} onChange={e => setForm({ ...form, quartier: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1.5">Annee de naissance <span className="text-red-400">*</span></label>
                      <select className="input-field" value={form.annee_naissance} onChange={e => setForm({ ...form, annee_naissance: e.target.value })} required>
                        <option value="" style={{backgroundColor:'#0a1410'}}>-- Choisir --</option>
                        {ANNEES.map(a => <option key={a} value={a} style={{backgroundColor:'#0a1410'}}>{a} ({age(a)} ans)</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1.5">Telephone <span className="text-red-400">*</span></label>
                      <input className="input-field" placeholder="7X XXX XX XX" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} required />
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl p-4 space-y-3 border border-white/10" style={{backgroundColor:'rgba(255,255,255,0.05)'}}>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2"><CreditCard size={13} /> Numero d Identite National</p>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setForm({ ...form, a_nin: !form.a_nin, numero_nin: "" })}>
                  <div className={"relative w-11 h-6 rounded-full transition-colors duration-200 " + (form.a_nin ? "bg-green-500" : "bg-white/20")}>
                    <div className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 " + (form.a_nin ? "translate-x-5" : "")} />
                  </div>
                  <span className="text-sm font-medium text-white/80">{form.a_nin ? "Oui, j ai un NIN" : "Non, je n ai pas de NIN"}</span>
                </div>
                {form.a_nin && (
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Numero NIN <span className="text-red-400">*</span></label>
                    <input className="input-field font-mono tracking-wider" placeholder="Ex: 1 234567 89012 34"
                      value={form.numero_nin} onChange={e => setForm({ ...form, numero_nin: e.target.value })} required={form.a_nin} />
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end pt-2 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 size={16} />}
                  {saving ? "Enregistrement..." : (editTarget ? "Enregistrer" : "Ajouter")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={"Supprimer " + deleteTarget.prenom + " " + deleteTarget.nom + " de la liste des primo votants ?"}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
